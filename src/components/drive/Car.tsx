"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { drive, markSceneReady } from "@/lib/drive";
import { frameAt, LANE, makeFrame } from "./path";
import { radialTexture } from "./textures";
import { world } from "./world";

const MODEL = "/models/car.glb";
const WHEEL_RADIUS = 0.36;

type Wheel = { hub: THREE.Group; spinner: THREE.Object3D; front: boolean; rest: THREE.Vector3 };

/** Rebuild materials by name (the optimised model ships without textures). */
function makeMaterials() {
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  return {
    "Paint 1": new THREE.MeshPhysicalMaterial({
      color: "#6f3bf5",
      metalness: 0.6,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide,
    }),
    "Paint 2": new THREE.MeshPhysicalMaterial({
      color: "#0c0c14",
      metalness: 0.5,
      roughness: 0.3,
      clearcoat: 0.6,
      side: THREE.DoubleSide,
    }),
    Glass: new THREE.MeshPhysicalMaterial({
      color: "#05060c",
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.72,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    Trim: std({ color: "#060608", roughness: 0.75, side: THREE.DoubleSide }),
    Mechanical: std({ color: "#101014", metalness: 0.7, roughness: 0.5 }),
    "Interior 1": std({ color: "#0d0d12", roughness: 0.5 }),
    "Interior 3": std({ color: "#1b5f78", roughness: 0.5, side: THREE.DoubleSide }),
    "Panel Sides": std({ color: "#0d0d12", roughness: 0.5 }),
    Dashboard: std({ color: "#02040a", emissive: "#5be9ff", emissiveIntensity: 0.7 }),
    Signallight: std({ color: "#120700", emissive: "#ff7a1a", emissiveIntensity: 0.8 }),
    Brakelight: std({ color: "#140003", emissive: "#ff1030", emissiveIntensity: 2 }),
    Headlight: std({ color: "#dfe9ff", emissive: "#cfe4ff", emissiveIntensity: 4 }),
    Mirror: std({ color: "#9aa3b5", metalness: 1, roughness: 0.05 }),
    Brake: std({ color: "#5be9ff", metalness: 0.4, roughness: 0.35 }),
    Disc: std({ color: "#7c828e", metalness: 1, roughness: 0.4, side: THREE.DoubleSide }),
    Tireside: std({ color: "#1b1b20", roughness: 0.6 }),
    Tiretread: std({ color: "#141418", roughness: 0.85 }),
    Rim1: std({ color: "#0a0a0e", metalness: 0.6, roughness: 0.35 }),
    Rim2: std({ color: "#c8d0e0", metalness: 1, roughness: 0.18 }),
  };
}

type CarParts = {
  model: THREE.Object3D;
  wheels: Wheel[];
  materials: ReturnType<typeof makeMaterials>;
};

/** The mounted car's moving parts, animated every frame outside React. */
const rig: { parts: CarParts | null } = { parts: null };

function buildCar(source: THREE.Object3D): CarParts {
  const model = source.clone(true);
  const materials = makeMaterials();
  model.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      const name = (o.material as THREE.Material).name as keyof typeof materials;
      if (materials[name]) o.material = materials[name];
      if (name === "Glass") o.renderOrder = 2;
    }
  });

  // Split each wheel into: hub (steers) > spinner (rolls), with the caliper fixed to the hub
  const wheels: Wheel[] = [];
  const euler = new THREE.Euler();
  for (const name of ["WheelFrontL", "WheelFrontR", "WheelRearL", "WheelRearR"]) {
    const node = model.getObjectByName(name);
    if (!node?.parent) continue;
    const hub = new THREE.Group();
    hub.position.copy(node.position);
    node.parent.add(hub);
    const roll = euler.setFromQuaternion(node.quaternion, "ZXY").x;
    const caliper = new THREE.Group();
    caliper.rotation.x = roll;
    node.children.filter((c) => c.name.includes("BrakePad")).forEach((c) => caliper.add(c));
    node.position.set(0, 0, 0);
    node.rotation.set(0, 0, 0);
    hub.add(node, caliper);
    wheels.push({ hub, spinner: node, front: name.includes("Front"), rest: hub.position.clone() });
  }
  return { model, wheels, materials };
}

const beamVertex = /* glsl */ `
  varying float vT;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vT = uv.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const beamFragment = /* glsl */ `
  varying float vT;
  varying vec3 vN;
  varying vec3 vV;
  uniform float uPower;
  void main() {
    float edge = pow(abs(dot(vN, vV)), 1.6);
    float a = pow(vT, 2.4) * edge * 0.11 * uPower;
    gl_FragColor = vec4(vec3(0.75, 0.87, 1.0) * a, a);
  }
`;

/** Opens along +z from a lamp; uv.y = 1 at the lamp. */
function beamGeometry() {
  const g = new THREE.CylinderGeometry(0.06, 1.9, 13, 28, 1, true);
  g.translate(0, -6.5, 0);
  g.rotateX(-Math.PI / 2 - 0.035);
  return g;
}

export function Car({ reduced }: { reduced: boolean }) {
  const gltf = useGLTF(MODEL, false, true);
  const car = useMemo(() => buildCar(gltf.scene), [gltf]);
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const beams = useRef<THREE.ShaderMaterial>(null);
  const headGlow = useRef<(THREE.Sprite | null)[]>([]);
  const tailGlow = useRef<(THREE.Sprite | null)[]>([]);
  const pool = useRef<THREE.MeshBasicMaterial>(null);
  const tailPool = useRef<THREE.MeshBasicMaterial>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);
  const beamGeo = useMemo(() => beamGeometry(), []);
  const glow = useMemo(() => radialTexture(), []);
  const beamUniforms = useMemo(() => ({ uPower: { value: 1 } }), []);
  const m = useRef({ frame: makeFrame(), roll: 0, steer: 0, pitch: 0, lean: 0, lastSpeed: 0, brake: 0, intro: 0 });


  useEffect(() => {
    rig.parts = car;
    return () => {
      rig.parts = null;
    };
  }, [car]);

  useEffect(() => {
    if (spot.current && target.current) spot.current.target = target.current;
    markSceneReady();
  }, []);

  useFrame((state, delta) => {
    const g = root.current;
    const b = body.current;
    const p = rig.parts;
    if (!g || !b || !p) return;
    const dt = Math.min(delta, 1 / 20);
    const st = m.current;

    // On load the car rolls into its parking spot
    if (reduced) st.intro = 1;
    else if (world.started) st.intro = Math.min(1, st.intro + dt / 2.6);
    const ease = 1 - Math.pow(1 - st.intro, 4);
    const introOffset = (1 - ease) * -46;
    const s = drive.s + introOffset;

    const f = frameAt(s, st.frame);
    g.position.copy(f.pos).addScaledVector(f.right, LANE);
    g.rotation.y = f.yaw;
    world.carS = s;
    world.carPos.copy(g.position);

    const introSpeed = st.intro < 1 && world.started ? 46 * 4 * Math.pow(1 - st.intro, 3) / 2.6 : 0;
    const speed = drive.speed + introSpeed;
    const accel = THREE.MathUtils.clamp((speed - st.lastSpeed) / Math.max(dt, 1e-3), -60, 60);
    st.lastSpeed = speed;

    // Body: squat and dive under acceleration, lean in corners, shiver at idle
    const k = 1 - Math.exp(-6 * dt);
    st.pitch += (THREE.MathUtils.clamp(-accel * 0.0011, -0.045, 0.045) - st.pitch) * k;
    st.lean += (THREE.MathUtils.clamp(f.curve * speed * 0.16, -0.06, 0.06) - st.lean) * k;
    const t = state.clock.elapsedTime;
    const bump = reduced ? 0 : Math.sin(t * 31) * 0.0012 + Math.sin(t * 9.1) * Math.min(1, Math.abs(speed) / 25) * 0.006;
    b.rotation.set(st.pitch, 0, st.lean);
    b.position.y = bump;

    // Wheels
    st.roll += (speed * dt) / WHEEL_RADIUS;
    st.steer += (THREE.MathUtils.clamp(f.curve * 14, -0.42, 0.42) - st.steer) * k;
    const parked = 1 - Math.min(1, Math.abs(drive.s) / 14);
    for (const w of p.wheels) {
      w.hub.rotation.z = w.front ? st.steer + parked * ease * 0.42 : 0;
      w.spinner.rotation.x = st.roll;
      // Suspension: tyres stay on the road while the body moves (model space is z-up, y-back)
      w.hub.position.z = w.rest.z - w.rest.y * st.pitch - w.rest.x * st.lean - bump;
    }

    // Lights
    const braking = accel < -4 || Math.abs(speed) < 0.6;
    st.brake += ((braking ? 1 : 0) - st.brake) * (1 - Math.exp(-9 * dt));
    p.materials.Brakelight.emissiveIntensity = 1.6 + st.brake * 4;
    const camF = (state.camera.position.x - g.position.x) * f.fwd.x + (state.camera.position.z - g.position.z) * f.fwd.z;
    const dist = Math.max(1, state.camera.position.distanceTo(g.position));
    const facing = camF / dist; // 1 = in front of the car, -1 = behind it
    const front = THREE.MathUtils.smoothstep(facing, -0.1, 0.8);
    const back = THREE.MathUtils.smoothstep(-facing, -0.1, 0.8);
    headGlow.current.forEach((sp) => sp && (sp.material.opacity = 0.15 + front * 0.75));
    tailGlow.current.forEach((sp) => sp && (sp.material.opacity = back * (0.28 + st.brake * 0.5)));
    if (tailPool.current) tailPool.current.opacity = 0.16 + st.brake * 0.28;
    const flicker = st.intro < 0.9 || reduced ? 1 : 1 + Math.sin(t * 2.3) * 0.02;
    if (beams.current) beams.current.uniforms.uPower.value = flicker * (1 - front * 0.45);
    if (pool.current) pool.current.opacity = 0.5 * flicker;
  });

  return (
    <group ref={root}>
      {/* Contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0.2]} renderOrder={1}>
        <planeGeometry args={[3.4, 6]} />
        <meshBasicMaterial map={glow} color="#000" transparent opacity={0.95} depthWrite={false} />
      </mesh>

      {/* Headlight pool on the road, and red wash behind */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 9.5]} renderOrder={1}>
        <planeGeometry args={[9, 18]} />
        <meshBasicMaterial ref={pool} map={glow} color="#8fb2e8" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, -3.4]} renderOrder={1}>
        <planeGeometry args={[4.4, 5]} />
        <meshBasicMaterial ref={tailPool} map={glow} color="#ff1a3c" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={body}>
        <primitive object={car.model} />
        {[-0.58, 0.58].map((x, i) => (
          <group key={x}>
            <mesh geometry={beamGeo} position={[x, 0.66, 2.2]} renderOrder={3}>
              <shaderMaterial
                ref={i === 0 ? beams : undefined}
                vertexShader={beamVertex}
                fragmentShader={beamFragment}
                uniforms={beamUniforms}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <sprite
              ref={(el) => {
                headGlow.current[i] = el;
              }}
              position={[x, 0.6, 2.24]}
              scale={[1.15, 0.8, 1]}
              renderOrder={4}
            >
              <spriteMaterial map={glow} color="#bcd8ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
            <sprite
              ref={(el) => {
                tailGlow.current[i] = el;
              }}
              position={[x * 0.85, 0.93, -1.72]}
              scale={[1.3, 0.8, 1]}
              renderOrder={4}
            >
              <spriteMaterial map={glow} color="#ff2340" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          </group>
        ))}
      </group>

      <spotLight ref={spot} position={[0, 1.1, 1.8]} angle={0.5} penumbra={0.9} intensity={160} distance={60} decay={1.5} color="#cfe0ff" />
      <object3D ref={target} position={[0, 0.2, 16]} />
      {/* Soft fill that travels with the car so the paint always reads */}
      <pointLight position={[-4, 3.2, 3]} intensity={22} distance={14} color="#c9ecff" />
      <pointLight position={[4, 2.6, -3]} intensity={20} distance={14} color="#e0b8ff" />
    </group>
  );
}

useGLTF.preload(MODEL, false, true);
