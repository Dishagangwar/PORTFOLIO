"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { attachPointer, pointer } from "@/lib/pointer";
import { heroOrbit } from "@/content/site";
import {
  blobFragment,
  blobVertex,
  particlesFragment,
  particlesVertex,
} from "./shaders";

type SceneProps = {
  reduced: boolean;
  detail: number;
  particleCount: number;
  labels: React.RefObject<(HTMLDivElement | null)[]>;
};

/** Small seeded PRNG so the particle field is deterministic (and render stays pure). */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CYAN = new THREE.Color("#5be9ff");
const VIOLET = new THREE.Color("#8b7bff");
const BLUE = new THREE.Color("#4f8bff");

/** Responsive placement: object sits right of the copy on wide screens, above it on narrow ones. */
function useLayout() {
  const { viewport, size } = useThree();
  const wide = size.width / size.height > 1.05 && size.width >= 900;
  return {
    wide,
    x: wide ? viewport.width * 0.22 : 0,
    y: wide ? 0 : viewport.height * 0.29,
    scale: wide ? Math.min(0.82, viewport.width / 11) : Math.min(0.5, viewport.width / 5),
  };
}

function Blob({ reduced, detail }: { reduced: boolean; detail: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.LineSegments>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.2 },
      uFreq: { value: 0.75 },
      uLight: { value: new THREE.Vector3(2, 2, 4) },
      uColorA: { value: CYAN.clone() },
      uColorB: { value: VIOLET.clone() },
      uColorC: { value: BLUE.clone() },
    }),
    [],
  );

  const shellGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.95, 1)),
    [],
  );

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    const u = m.uniforms as typeof uniforms;
    const dt = Math.min(delta, 1 / 30);
    if (!reduced) u.uTime.value += dt;
    // Light follows the pointer (mouse-following lighting)
    const lx = pointer.x * 4.5;
    const ly = pointer.y * 3.5;
    u.uLight.value.x += (lx - u.uLight.value.x) * 0.06;
    u.uLight.value.y += (ly - u.uLight.value.y) * 0.06;
    // Calm down distortion when the pointer is idle-centered, swell when moving
    const energy = 0.17 + Math.min(0.1, Math.hypot(pointer.x, pointer.y) * 0.08);
    u.uAmp.value += (energy - u.uAmp.value) * 0.03;

    if (mesh.current && !reduced) {
      mesh.current.rotation.y += dt * 0.12;
    }
    if (shell.current && !reduced) {
      shell.current.rotation.y -= dt * 0.06;
      shell.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.35, detail]} />
        <shaderMaterial
          ref={material}
          vertexShader={blobVertex}
          fragmentShader={blobFragment}
          uniforms={uniforms}
        />
      </mesh>
      <lineSegments ref={shell} geometry={shellGeo}>
        <lineBasicMaterial color="#8b7bff" transparent opacity={0.12} />
      </lineSegments>
    </group>
  );
}

function OrbitRing({ radius, tilt, speed, opacity }: { radius: number; tilt: [number, number]; speed: number; opacity: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += Math.min(d, 1 / 30) * speed;
  });
  const geo = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
  }, [radius]);
  return (
    <group rotation={[tilt[0], tilt[1], 0]}>
      <group ref={ref}>
        <lineLoop geometry={geo}>
          <lineBasicMaterial color="#9fdcff" transparent opacity={opacity} />
        </lineLoop>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#5be9ff" />
        </mesh>
      </group>
    </group>
  );
}

/** Technology labels orbiting the object. Positions are projected to screen space and
 *  written straight to DOM nodes (no React re-renders); labels dim as they pass behind. */
function TechOrbit({
  reduced,
  labels,
}: {
  reduced: boolean;
  labels: React.RefObject<(HTMLDivElement | null)[]>;
}) {
  const group = useRef<THREE.Group>(null);
  const anchors = useRef<(THREE.Object3D | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();
  const R = 2.75;

  useFrame((_, d) => {
    if (!group.current) return;
    if (!reduced) group.current.rotation.y += Math.min(d, 1 / 30) * 0.16;
    anchors.current.forEach((a, i) => {
      const el = labels.current?.[i];
      if (!a || !el) return;
      a.getWorldPosition(tmp);
      const depth = tmp.z;
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.y * 0.5 + 0.5) * size.height;
      const front = THREE.MathUtils.clamp((depth + 0.6) / 2.4, 0, 1);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${0.8 + front * 0.25})`;
      el.style.opacity = String(0.12 + front * 0.88);
      el.style.filter = front < 0.35 ? "blur(1.5px)" : "none";
      el.style.zIndex = front > 0.5 ? "2" : "0";
    });
  });

  return (
    <group rotation={[0.38, 0, -0.12]}>
      <group ref={group}>
        {heroOrbit.map((name, i) => {
          const a = (i / heroOrbit.length) * Math.PI * 2;
          return (
            <object3D
              key={name}
              position={[Math.cos(a) * R, Math.sin(a * 2) * 0.25, Math.sin(a) * R]}
              ref={(el) => {
                anchors.current[i] = el;
              }}
            />
          );
        })}
      </group>
    </group>
  );
}

function Particles({ count, reduced }: { count: number; reduced: boolean }) {
  const { size, gl } = useThree();
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { geometry, uniforms } = useMemo(() => {
    const rand = mulberry32(1337);
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.pow(rand(), 0.6) * 9;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.6;
      pos[i * 3 + 1] = r * Math.cos(ph) * 0.9;
      pos[i * 3 + 2] = Math.min(2.5, r * Math.sin(ph) * Math.sin(th) * 0.7 - 3);
      scale[i] = 0.4 + rand() * 1.2;
      seed[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return {
      geometry: g,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(10, 10) },
        uAspect: { value: 1 },
        uPixelRatio: { value: 1 },
        uSize: { value: 70 },
        uColorA: { value: CYAN.clone() },
        uColorB: { value: VIOLET.clone() },
      },
    };
  }, [count]);

  useFrame((_, d) => {
    const m = material.current;
    if (!m) return;
    const u = m.uniforms as typeof uniforms;
    const dt = Math.min(d, 1 / 30);
    if (!reduced) u.uTime.value += dt;
    u.uAspect.value = size.width / size.height;
    u.uPixelRatio.value = gl.getPixelRatio();
    if (pointer.active) {
      u.uMouse.value.x += (pointer.x - u.uMouse.value.x) * 0.12;
      u.uMouse.value.y += (pointer.y - u.uMouse.value.y) * 0.12;
    }
    if (points.current && !reduced) {
      points.current.rotation.y += dt * 0.015;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={particlesVertex}
        fragmentShader={particlesFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const layout = useLayout();
  useFrame(() => {
    if (!ref.current) return;
    const g = ref.current;
    const k = reduced ? 1 : 0.05;
    // Subtle reaction to mouse movement
    g.rotation.x += (-pointer.y * 0.22 - g.rotation.x) * k;
    g.rotation.y += (pointer.x * 0.35 - g.rotation.y) * k;
    g.position.x += (layout.x + pointer.x * 0.12 - g.position.x) * (reduced ? 1 : 0.08);
    g.position.y += (layout.y + pointer.y * 0.08 - g.position.y) * (reduced ? 1 : 0.08);
    const s = layout.scale;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * (reduced ? 1 : 0.08));
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ reduced, detail, particleCount, labels }: SceneProps) {
  return (
    <>
      <Particles count={particleCount} reduced={reduced} />
      <Rig reduced={reduced}>
        <Blob reduced={reduced} detail={detail} />
        <OrbitRing radius={2.0} tilt={[1.25, 0.2]} speed={0.4} opacity={0.18} />
        <OrbitRing radius={2.75} tilt={[1.1, -0.35]} speed={-0.25} opacity={0.1} />
        <TechOrbit reduced={reduced} labels={labels} />
      </Rig>
    </>
  );
}

export default function HeroScene({ active }: { active: boolean }) {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.75]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const [cfg, setCfg] = useState<{ reduced: boolean; detail: number; particles: number } | null>(null);

  useEffect(() => {
    attachPointer();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- quality depends on browser-only capabilities
    setCfg({
      reduced,
      detail: small || lowEnd ? 28 : 48,
      particles: small ? 600 : lowEnd ? 900 : 1600,
    });
  }, []);

  if (!cfg) return null;

  return (
    <div className="absolute inset-0">
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 7], fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr([1, 1.15])}
        onIncline={() => setDpr([1, 1.75])}
        flipflops={3}
      />
      <Scene reduced={cfg.reduced} detail={cfg.detail} particleCount={cfg.particles} labels={labels} />
    </Canvas>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {heroOrbit.map((name, i) => (
          <div
            key={name}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className="glass absolute top-0 left-0 flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] tracking-wide whitespace-nowrap text-fg/90 opacity-0 will-change-transform"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--color-cyan)]" />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
