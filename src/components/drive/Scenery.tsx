"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BANNER_S, drive, ROAD_LENGTH, TUNNEL, stops } from "@/lib/drive";
import { skillCategories } from "@/content/site";
import { archShell, distanceToRoad, frameAt, LANE, makeFrame, matrixAt, mulberry32, pointAt, ribbon, ROAD_HALF, S_MAX } from "./path";
import { radialTexture, signTexture } from "./textures";
import { world } from "./world";

type Uniforms = Record<string, THREE.IUniform>;

/* ───────────── Sky ───────────── */

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }
`;
const skyFragment = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform float uFinale;
  uniform float uTime;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  void main() {
    vec3 d = normalize(vDir);
    float h = max(d.y, 0.0);
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.5, h));
    // Glow on the horizon straight ahead, growing toward dawn
    float ahead = pow(max(d.z, 0.0), 3.0);
    col += uGlow * exp(-h * mix(9.0, 5.0, uFinale)) * (0.16 + ahead * mix(0.26, 0.5, uFinale));
    col += uGlow * exp(-h * 16.0) * 0.12;
    // Stars
    vec3 cell = floor(d * 170.0);
    float r = hash(cell);
    vec3 fp = fract(d * 170.0) - 0.5;
    float star = step(0.9965, r) * smoothstep(0.32, 0.0, length(fp));
    star *= 0.55 + 0.45 * sin(uTime * 1.6 + r * 900.0);
    col += star * smoothstep(0.04, 0.3, h) * (1.0 - uFinale * 0.75) * vec3(0.85, 0.9, 1.0);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Sky() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo<Uniforms>(
    () => ({
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
      uFinale: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );
  useFrame((state) => {
    ref.current?.position.copy(state.camera.position);
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTop.value.copy(world.skyTop);
    u.uHorizon.value.copy(world.horizon);
    u.uGlow.value.copy(world.glow);
    u.uFinale.value = world.finale;
    u.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh ref={ref} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[300, 40, 24]} />
      <shaderMaterial ref={mat} vertexShader={skyVertex} fragmentShader={skyFragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/* ───────────── Road ───────────── */

/** Asphalt with painted lines and a faint sheen, all drawn in one shader. */
const roadVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vW;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const roadFragment = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vW;
  uniform vec3 uHorizon;
  uniform vec3 uAccent;
  uniform vec3 uCar;
  uniform vec3 uGlow;
  uniform float uHalf;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float band(float x, float c, float w) {
    float aa = fwidth(x) + 0.005;
    return 1.0 - smoothstep(w - aa, w + aa, abs(x - c));
  }
  void main() {
    float x = (vUv.x - 0.5) * 2.0 * uHalf; // metres from centre
    float s = vUv.y;
    vec3 V = cameraPosition - vW;
    float dist = length(V);
    float grain = noise(vW.xz * 9.0) * 0.5 + noise(vW.xz * 0.6) * 0.5;
    vec3 col = vec3(0.012, 0.012, 0.02) * (0.7 + grain * 0.6);
    // Wet sheen: reflects the horizon at grazing angles
    float fres = pow(1.0 - clamp(V.y / dist, 0.0, 1.0), 5.0);
    col += (uHorizon * 0.7 + uGlow * 0.16) * fres * (0.45 + 0.55 * noise(vW.xz * 0.35));
    // Neon kerbs bleed onto the asphalt
    col += vec3(0.36, 0.91, 1.0) * exp(-(uHalf + x) * 1.5) * 0.18;
    col += vec3(0.55, 0.48, 1.0) * exp(-(uHalf - x) * 1.5) * 0.18;
    // Paint
    float dash = step(fract(s / 9.0), 0.42) * band(x, 0.0, 0.08);
    float edge = band(abs(x), uHalf - 0.55, 0.06);
    float nearCar = exp(-length(vW - uCar) * 0.06);
    col += vec3(0.8, 0.84, 0.95) * (dash * 0.5 + edge * 0.28) * (0.25 + nearCar * 0.9);
    float fog = 1.0 - exp(-pow(dist * 0.0085, 2.0));
    col = mix(col, uHorizon * 0.55, fog);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Road() {
  const road = useMemo(() => ribbon(-ROAD_HALF, ROAD_HALF, 0.005), []);
  const kerbL = useMemo(() => ribbon(-ROAD_HALF - 0.12, -ROAD_HALF, 0.08), []);
  const kerbR = useMemo(() => ribbon(ROAD_HALF, ROAD_HALF + 0.12, 0.08), []);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const ground = useRef<THREE.Mesh>(null);
  const groundMat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo<Uniforms>(
    () => ({
      uHorizon: { value: new THREE.Color() },
      uAccent: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
      uCar: { value: new THREE.Vector3() },
      uHalf: { value: ROAD_HALF },
    }),
    [],
  );
  const groundUniforms = useMemo<Uniforms>(() => ({ uHorizon: { value: new THREE.Color() } }), []);
  useFrame(() => {
    const u = mat.current?.uniforms;
    if (u) {
      u.uHorizon.value.copy(world.horizon);
      u.uAccent.value.copy(world.accent);
      u.uGlow.value.copy(world.glow);
      u.uCar.value.copy(world.carPos);
    }
    groundMat.current?.uniforms.uHorizon.value.copy(world.horizon);
    ground.current?.position.set(world.carPos.x, -0.06, world.carPos.z);
  });
  return (
    <>
      <mesh ref={ground} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[700, 700]} />
        <shaderMaterial
          ref={groundMat}
          uniforms={groundUniforms}
          vertexShader={roadVertex}
          fragmentShader={/* glsl */ `
            varying vec3 vW;
            uniform vec3 uHorizon;
            float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
            void main() {
              float dist = length(cameraPosition - vW);
              vec3 col = vec3(0.006, 0.006, 0.014) + uHorizon * 0.03 * hash(floor(vW.xz * 1.5));
              col = mix(col, uHorizon * 0.55, 1.0 - exp(-pow(dist * 0.0085, 2.0)));
              gl_FragColor = vec4(col, 1.0);
              #include <colorspace_fragment>
            }
          `}
        />
      </mesh>
      <mesh geometry={road} frustumCulled={false}>
        <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={roadVertex} fragmentShader={roadFragment} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={kerbL} frustumCulled={false}>
        <meshBasicMaterial color="#5be9ff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={kerbR} frustumCulled={false}>
        <meshBasicMaterial color="#8b7bff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

/* ───────────── Roadside lamps ───────────── */

const LAMP_GAP = 34;

export function Lamps() {
  const poles = useRef<THREE.InstancedMesh>(null);
  const arms = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const pools = useRef<THREE.InstancedMesh>(null);
  const glow = useMemo(() => radialTexture(), []);
  const spots = useMemo(() => {
    const out: { s: number; side: 1 | -1 }[] = [];
    for (let s = -120, i = 0; s < ROAD_LENGTH + 60; s += LAMP_GAP, i++) {
      if (s > TUNNEL.start - 8 && s < TUNNEL.end + 8) continue;
      // Nothing in front of the banner
      if (s > BANNER_S - 30 && s < BANNER_S + 6) continue;
      out.push({ s, side: i % 2 ? 1 : -1 });
    }
    return out;
  }, []);
  const points = useMemo(() => {
    const pos = new Float32Array(spots.length * 3);
    const v = new THREE.Vector3();
    spots.forEach(({ s, side }, i) => pointAt(s, side * (ROAD_HALF - 0.9), 6.3, v).toArray(pos, i * 3));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [spots]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const flat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    spots.forEach(({ s, side }, i) => {
      const edge = side * (ROAD_HALF + 1.1);
      poles.current?.setMatrixAt(i, matrixAt(s, edge, 3.2, [0.09, 6.4, 0.09], m));
      arms.current?.setMatrixAt(i, matrixAt(s, side * (ROAD_HALF + 0.1), 6.38, [2.2, 0.07, 0.09], m));
      heads.current?.setMatrixAt(i, matrixAt(s, side * (ROAD_HALF - 0.9), 6.32, [0.9, 0.06, 0.22], m));
      pools.current?.setMatrixAt(i, matrixAt(s, side * (ROAD_HALF - 1.6), 0.025, [1, 1, 1], m).multiply(flat));
    });
    for (const r of [poles, arms, heads, pools]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
  }, [spots]);

  const n = spots.length;
  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#14141c" metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={arms} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#14141c" metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial color="#e6e9ff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pools} args={[undefined, undefined, n]} frustumCulled={false} renderOrder={1}>
        <planeGeometry args={[9, 13]} />
        <meshBasicMaterial map={glow} color="#6a72c8" transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      <points geometry={points} frustumCulled={false} renderOrder={3}>
        <pointsMaterial map={glow} color="#b9c2ff" size={2.6} sizeAttenuation transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

/* ───────────── City, trees, mountains ───────────── */

const buildingVertex = /* glsl */ `
  attribute float aSeed;
  varying vec3 vP;
  varying vec3 vN;
  varying vec3 vW;
  varying float vSeed;
  void main() {
    vec3 size = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vP = (position + vec3(0.0, 0.5, 0.0)) * size;
    vN = normal;
    vSeed = aSeed;
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const buildingFragment = /* glsl */ `
  varying vec3 vP;
  varying vec3 vN;
  varying vec3 vW;
  varying float vSeed;
  uniform vec3 uHorizon;
  uniform vec3 uAccent;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    float dist = length(cameraPosition - vW);
    vec3 col = uHorizon * 0.1 + vec3(0.004, 0.004, 0.01);
    if (abs(vN.y) < 0.5) {
      float h = abs(vN.x) > 0.5 ? vP.z : vP.x;
      vec2 g = vec2(h / 1.7, vP.y / 2.1);
      vec2 id = floor(g);
      vec2 f = fract(g);
      float lit = step(0.72, hash(id + vSeed * 91.0));
      float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.25, f.y) * step(f.y, 0.75);
      vec3 tint = mix(vec3(1.0, 0.75, 0.48), mix(uAccent, vec3(0.8, 0.9, 1.0), 0.4), step(0.45, hash(id * 1.7 + vSeed)));
      // Fade the grid out with distance so it never shimmers
      float sharp = 1.0 - smoothstep(0.35, 0.9, max(fwidth(g.x), fwidth(g.y)));
      col += tint * mix(0.1, lit * win, sharp) * (0.25 + 0.55 * hash(id + 3.1)) * mix(0.3, 0.8, smoothstep(30.0, 75.0, dist));
    }
    float fog = 1.0 - exp(-pow(dist * 0.0062, 2.0));
    col = mix(col, uHorizon * 0.62, fog);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/** How built-up the roadside is at a given distance. */
function cityDensity(s: number) {
  if (s > TUNNEL.start - 10 && s < TUNNEL.end + 10) return 0;
  if (s > ROAD_LENGTH - 60) return 0.12;
  if (s < 156) return 0.22;
  return 1;
}

export function City() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo<Uniforms>(() => ({ uHorizon: { value: new THREE.Color() }, uAccent: { value: new THREE.Color() } }), []);
  const { matrices, seeds } = useMemo(() => {
    const rand = mulberry32(77);
    const matrices: THREE.Matrix4[] = [];
    const p = new THREE.Vector3();
    for (let s = -120; s < S_MAX - 60; s += 5) {
      for (const side of [-1, 1]) {
        const a = rand();
        const off = 46 + Math.pow(rand(), 1.4) * 110;
        const w = 6 + rand() * 10;
        const h = 7 + Math.pow(rand(), 2.2) * 46 * (0.5 + off / 110);
        const turn = (rand() - 0.5) * 0.5;
        if (a > cityDensity(s)) continue;
        pointAt(s, side * off, h / 2, p);
        if (distanceToRoad(p.x, p.z) < 38) continue;
        matrices.push(matrixAt(s, side * off, h / 2, [w, h, w * (0.7 + rand() * 0.6)], new THREE.Matrix4(), turn));
      }
    }
    return { matrices, seeds: new Float32Array(matrices.map(() => rand())) };
  }, []);
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current?.setMatrixAt(i, m));
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  useFrame(() => {
    mat.current?.uniforms.uHorizon.value.copy(world.horizon);
    mat.current?.uniforms.uAccent.value.copy(world.accent);
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} frustumCulled={false}>
      <boxGeometry>
        <instancedBufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </boxGeometry>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={buildingVertex} fragmentShader={buildingFragment} />
    </instancedMesh>
  );
}

export function Trees() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo<Uniforms>(() => ({ uHorizon: { value: new THREE.Color() } }), []);
  const matrices = useMemo(() => {
    const rand = mulberry32(5);
    const out: THREE.Matrix4[] = [];
    const p = new THREE.Vector3();
    for (let s = -140; s < S_MAX - 80; s += 2.2) {
      const open = s < 186 || s > TUNNEL.end - 20;
      for (const side of [-1, 1]) {
        const a = rand();
        const off = 10.5 + Math.pow(rand(), 1.6) * 60;
        const h = 2.6 + rand() * 4.6;
        if (a > (open ? 0.6 : 0.1)) continue;
        // Keep the finale's screen and the roadside displays clear
        if (s > ROAD_LENGTH - 6 && off < 30) continue;
        if (!open && off < 20) continue;
        pointAt(s, side * off, h / 2, p);
        if (distanceToRoad(p.x, p.z) < 9) continue;
        out.push(matrixAt(s, side * off, h / 2, [h * 0.36, h, h * 0.36], new THREE.Matrix4(), rand() * 6));
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current?.setMatrixAt(i, m));
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  useFrame(() => {
    mat.current?.uniforms.uHorizon.value.copy(world.horizon);
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} frustumCulled={false}>
      <coneGeometry args={[1, 1, 7, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vW;
          varying vec3 vN;
          varying float vY;
          void main() {
            vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vW = w.xyz;
            vY = position.y + 0.5;
            vN = normalize(mat3(instanceMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec3 vW;
          varying vec3 vN;
          varying float vY;
          uniform vec3 uHorizon;
          void main() {
            float dist = length(cameraPosition - vW);
            float rim = pow(1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 2.0);
            vec3 col = vec3(0.006, 0.008, 0.018) + uHorizon * (0.06 + vY * 0.14 + rim * 0.16);
            col = mix(col, uHorizon * 0.58, 1.0 - exp(-pow(dist * 0.008, 2.0)));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `}
      />
    </instancedMesh>
  );
}

/** Two layers of ridgeline that stay on the horizon, with slight parallax. */
export function Mountains() {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const geos = useMemo(
    () =>
      [0, 1].map((layer) => {
        const rand = mulberry32(layer * 31 + 9);
        const seg = 150;
        const R = layer ? 215 : 250;
        const pos: number[] = [];
        const idx: number[] = [];
        let h = 18;
        const first = h;
        for (let i = 0; i <= seg; i++) {
          const a = (i / seg) * Math.PI * 2;
          h += (rand() - 0.5) * (layer ? 8 : 13);
          h = THREE.MathUtils.clamp(h, 6, layer ? 24 : 44);
          const y = i > seg - 12 ? THREE.MathUtils.lerp(h, first, (i - seg + 12) / 12) : h;
          pos.push(Math.sin(a) * R, -2, Math.cos(a) * R, Math.sin(a) * R, y, Math.cos(a) * R);
          if (i) {
            const k = i * 2;
            idx.push(k - 2, k - 1, k, k - 1, k + 1, k);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
        g.setIndex(idx);
        return g;
      }),
    [],
  );
  useFrame((state) => {
    groups.current.forEach((g, i) => {
      if (!g) return;
      g.position.set(state.camera.position.x, 0, state.camera.position.z);
      g.rotation.y = -state.camera.position.x * 0.0004 * (i + 1);
      mats.current[i]?.color.copy(world.horizon).multiplyScalar(i ? 0.34 : 0.5);
    });
  });
  return (
    <>
      {geos.map((g, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <mesh geometry={g} frustumCulled={false} renderOrder={-9 + i}>
            <meshBasicMaterial
              ref={(el) => {
                mats.current[i] = el;
              }}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ───────────── Skill gantries ───────────── */

function Gantry({ s, index, title, accent }: { s: number; index: string; title: string; accent: string }) {
  const tex = useMemo(() => signTexture(index, title, accent), [index, title, accent]);
  const { position, yaw } = useMemo(() => {
    const f = frameAt(s, makeFrame());
    return { position: f.pos.clone(), yaw: f.yaw };
  }, [s]);
  const w = ROAD_HALF + 1;
  return (
    <group position={position} rotation-y={yaw}>
      {[-w, w].map((x) => (
        <mesh key={x} position={[x, 2.9, 0]}>
          <boxGeometry args={[0.22, 5.8, 0.3]} />
          <meshStandardMaterial color="#15151f" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 5.75, 0]}>
        <boxGeometry args={[w * 2, 0.16, 0.3]} />
        <meshStandardMaterial color="#15151f" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 5.64, 0]}>
        <boxGeometry args={[w * 2, 0.05, 0.12]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {/* Faces oncoming traffic, i.e. the approaching car */}
      <mesh position={[-LANE, 4.85, -0.18]} rotation-y={Math.PI}>
        <planeGeometry args={[7, 1.31]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Gantries() {
  const base = stops.find((s) => s.key === "skills")!.s;
  return skillCategories.map((c, i) => (
    <Gantry key={c.id} s={base - 22 + i * 22} index={`0${i + 1}`} title={c.title} accent={i % 2 ? "#8b7bff" : "#5be9ff"} />
  ));
}

/* ───────────── Tunnel ───────────── */

export function Tunnel() {
  const shell = useMemo(() => archShell(8.4, TUNNEL.start, TUNNEL.end), []);
  const rings = useRef<THREE.InstancedMesh>(null);
  const count = Math.floor((TUNNEL.end - TUNNEL.start) / 7) + 1;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const a = new THREE.Color("#5be9ff");
    const b = new THREE.Color("#c06bff");
    for (let i = 0; i < count; i++) {
      rings.current?.setMatrixAt(i, matrixAt(TUNNEL.start + i * 7, 0, 0, [1, 1, 1], m));
      rings.current?.setColorAt(i, c.copy(a).lerp(b, i / (count - 1)));
    }
    if (rings.current) {
      rings.current.instanceMatrix.needsUpdate = true;
      if (rings.current.instanceColor) rings.current.instanceColor.needsUpdate = true;
    }
  }, [count]);
  return (
    <>
      <mesh geometry={shell} frustumCulled={false}>
        <meshStandardMaterial color="#0b0b16" roughness={0.45} metalness={0.5} side={THREE.DoubleSide} envMapIntensity={0.25} />
      </mesh>
      <instancedMesh ref={rings} args={[undefined, undefined, count]} frustumCulled={false}>
        <torusGeometry args={[8.1, 0.06, 6, 40, Math.PI]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ───────────── Speed streaks ───────────── */

const STREAKS = 70;
const SPAN = 90;

export function Streaks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const seeds = useMemo(() => {
    const rand = mulberry32(21);
    return Array.from({ length: STREAKS }, () => {
      const a = rand() * Math.PI;
      const r = 4.5 + rand() * 7;
      return { x: Math.cos(a) * r, y: 0.3 + Math.sin(a) * r * 0.75, z: rand() * SPAN, l: 0.6 + rand() };
    });
  }, []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || !mat.current) return;
    const v = Math.min(1, Math.abs(drive.speed) / 70);
    mat.current.opacity += (v * 0.3 - mat.current.opacity) * 0.1;
    mesh.visible = mat.current.opacity > 0.01;
    if (!mesh.visible) return;
    mat.current.color.copy(world.accent).lerp(WHITE, 0.4);
    seeds.forEach((p, i) => {
      // Fixed in the world, recycled around the car
      const rel = ((((p.z - world.carS) % SPAN) + SPAN) % SPAN) - SPAN * 0.35;
      mesh.setMatrixAt(i, matrixAt(world.carS + rel, LANE + p.x, p.y, [0.02, 0.02, (0.6 + v * 5) * p.l], m));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, STREAKS]} frustumCulled={false} renderOrder={3}>
      <boxGeometry />
      <meshBasicMaterial ref={mat} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </instancedMesh>
  );
}

const WHITE = new THREE.Color("#ffffff");
