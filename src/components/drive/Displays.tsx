"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BANNER_S, drive, projectSide, ROAD_LENGTH, stops } from "@/lib/drive";
import { projectCategories, site, type Project } from "@/content/site";
import { frameAt, LANE, makeFrame, pointAt, ROAD_HALF } from "./path";
import { radialTexture } from "./textures";
import { world } from "./world";

/** Load a texture once it is close enough to matter. Sized by the Next image optimizer. */
function useLazyTexture(src: string, width: number, enabled: boolean) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let dead = false;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(`/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`, (t) => {
      if (dead) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      loaded = t;
      setTex(t);
    });
    return () => {
      dead = true;
      loaded?.dispose();
    };
  }, [src, width, enabled]);
  return tex;
}

/** True once the car has come within `range` metres (then stays true). */
function useNear(s: number, range: number) {
  const [near, setNear] = useState(false);
  useFrame(() => {
    if (!near && Math.abs(drive.s - s) < range) setNear(true);
  });
  return near;
}

/* ───────────── Giant phones, one cluster per project ───────────── */

const PHONE_H = 6.4;
const PHONE_W = PHONE_H * 0.47;

function Phone({
  src,
  accent,
  near,
  width,
  ...group
}: {
  src: string;
  accent: string;
  near: boolean;
  width: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  const tex = useLazyTexture(src, width, near);
  const aspect = tex ? (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height : 0.461;
  const sh = PHONE_H - 0.3;
  const sw = Math.min(PHONE_W - 0.2, sh * aspect);
  return (
    <group {...group}>
      <RoundedBox args={[PHONE_W, PHONE_H, 0.24]} radius={0.12} smoothness={3} position={[0, PHONE_H / 2, 0]}>
        <meshStandardMaterial color="#0b0b12" metalness={0.8} roughness={0.25} />
      </RoundedBox>
      <RoundedBox args={[PHONE_W + 0.07, PHONE_H + 0.07, 0.1]} radius={0.05} smoothness={2} position={[0, PHONE_H / 2, 0.05]}>
        <meshBasicMaterial color={accent} toneMapped={false} />
      </RoundedBox>
      <mesh position={[0, PHONE_H / 2, -0.126]} rotation-y={Math.PI}>
        <planeGeometry args={[sw, sh]} />
        {/* Remount when the texture arrives so the shader picks up the map */}
        <meshBasicMaterial key={tex ? "on" : "off"} map={tex} color={tex ? "#e4e4ee" : "#0d1020"} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ProjectPhones({ project, accent, i, s }: { project: Project; accent: string; i: number; s: number }) {
  const near = useNear(s, 170);
  const ref = useRef<THREE.Group>(null);
  const glow = useMemo(() => radialTexture(), []);
  const shots = project.screenshots?.slice(0, 3) ?? [];
  const side = projectSide(i) === "left" ? 1 : -1; // +1 = right of the road
  const { position, yaw } = useMemo(() => {
    const at = s + 11;
    const p = pointAt(at, side * (ROAD_HALF + 3.9), 0, new THREE.Vector3());
    return { position: p, yaw: frameAt(at, makeFrame()).yaw };
  }, [s, side]);
  const raise = useRef(0);

  // Rise out of the ground as the car approaches
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = drive.s > s - 52 ? 1 : 0;
    raise.current += (target - raise.current) * (1 - Math.exp(-3.2 * Math.min(dt, 0.05)));
    g.position.y = (raise.current - 1) * (PHONE_H + 1.2);
    g.visible = raise.current > 0.01;
  });

  return (
    // Screens face -z (back toward the approaching car), angled in toward the road
    <group position={position} rotation-y={yaw - side * 0.34}>
      <group ref={ref}>
        {shots[2] && <Phone src={shots[2]} accent="#262a44" near={near} width={384} position={[-3.05, 0, 1.3]} rotation={[0, 0.16, 0]} scale={0.86} />}
        {shots[1] && <Phone src={shots[1]} accent="#262a44" near={near} width={384} position={[3.05, 0, 1.3]} rotation={[0, -0.16, 0]} scale={0.86} />}
        {shots[0] && <Phone src={shots[0]} accent={accent} near={near} width={640} position={[0, 0.25, 0]} rotation={[0, 0, 0]} />}
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -2.2]} renderOrder={1}>
        <planeGeometry args={[12, 9]} />
        <meshBasicMaterial map={glow} color={accent} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export function ProjectDisplays() {
  let i = 0;
  const items = projectCategories.flatMap((c) =>
    c.projects.map((project) => ({ project, accent: c.accent, i: i++, s: stops.find((x) => x.key === `project-${project.id}`)!.s })),
  );
  return items.map((p) => <ProjectPhones key={p.project.id} {...p} />);
}

/* ───────────── Banner over the highway: photo + title ───────────── */

const BANNER_W = 10.4;
const BANNER_H = 4.5;
const BANNER_TOP = 9.6;

/** Photo on the left, title on the right, drawn once into a single texture. */
function bannerTexture(photo: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = Math.round((2048 * BANNER_H) / BANNER_W);
  const ctx = c.getContext("2d")!;
  const { width: W, height: H } = c;
  const sans = getComputedStyle(document.body).fontFamily;
  const serif = getComputedStyle(document.documentElement).getPropertyValue("--font-instrument-serif") || "serif";

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b0c1e");
  bg.addColorStop(1, "#1b0f45");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Photo: head and shoulders, with a slanted edge
  const pw = W * 0.42;
  const slant = 110;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(pw + slant, 0);
  ctx.lineTo(pw, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.clip();
  const sw = photo.width;
  const sh = (sw * H) / (pw + slant);
  ctx.drawImage(photo, 0, photo.height * 0.02, sw, sh, 0, 0, pw + slant, H);
  ctx.restore();
  const edge = ctx.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, "#5be9ff");
  edge.addColorStop(1, "#8b7bff");
  ctx.strokeStyle = edge;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(pw + slant, 0);
  ctx.lineTo(pw, H);
  ctx.stroke();

  // Title, one word per line, as large as fits
  const x = pw + slant + 60;
  const room = W - x - 70;
  const words = site.bannerTitle.split(" ");
  let size = 250;
  ctx.textBaseline = "alphabetic";
  do ctx.font = `600 ${(size -= 4)}px ${sans}`;
  while (size > 60 && (Math.max(...words.map((w) => ctx.measureText(w).width)) > room || size * words.length > H * 0.62));
  const lh = size * 1.02;
  let y = H / 2 - (lh * words.length) / 2 + size * 0.98;
  const nameY = y - size - 26;
  ctx.fillStyle = "#ffffff";
  for (const w of words) {
    ctx.fillText(w, x, y);
    y += lh;
  }
  ctx.fillStyle = "#7feaff";
  ctx.font = `italic 400 92px ${serif}`;
  ctx.fillText(site.name, x, Math.max(110, nameY));

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

/** Hangs from a gantry across the road and unrolls as the car drives up to it. */
export function HighwayBanner() {
  const photo = useLazyTexture(site.portrait, 1080, !!site.portrait);
  const map = useMemo(() => (photo ? bannerTexture(photo.image as HTMLImageElement) : null), [photo]);
  useEffect(() => () => map?.dispose(), [map]);
  const cloth = useRef<THREE.Group>(null);
  const roll = useRef<THREE.Group>(null);
  const open = useRef(0);
  const { position, yaw } = useMemo(() => {
    const f = frameAt(BANNER_S, makeFrame());
    return { position: f.pos.clone(), yaw: f.yaw };
  }, []);

  useFrame((state, dt) => {
    if (!cloth.current || !roll.current) return;
    const target = map && drive.s > BANNER_S - 56 ? 1 : 0;
    open.current += (target - open.current) * (1 - Math.exp(-3.4 * Math.min(dt, 0.05)));
    const k = Math.max(0.001, open.current);
    cloth.current.scale.y = k;
    cloth.current.visible = k > 0.01;
    roll.current.position.y = -BANNER_H * k;
    roll.current.rotation.x = k * 14;
    // A breath of wind
    cloth.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.1) * 0.012;
  });

  if (!site.portrait) return null;
  const w = ROAD_HALF + 1.2;
  return (
    <group position={position} rotation-y={yaw}>
      {[-w, w].map((x) => (
        <mesh key={x} position={[x, BANNER_TOP / 2 + 0.15, 0.1]}>
          <boxGeometry args={[0.3, BANNER_TOP + 0.3, 0.4]} />
          <meshStandardMaterial color="#15151f" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {[0.12, 0.75].map((y) => (
        <mesh key={y} position={[0, BANNER_TOP + y, 0.1]}>
          <boxGeometry args={[w * 2 + 0.3, 0.16, 0.34]} />
          <meshStandardMaterial color="#15151f" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, BANNER_TOP + 0.02, -0.06]}>
        <boxGeometry args={[BANNER_W + 0.3, 0.07, 0.1]} />
        <meshBasicMaterial color="#5be9ff" toneMapped={false} />
      </mesh>

      <group position={[0, BANNER_TOP, 0]}>
        {/* Faces -z: back toward the approaching car */}
        <group ref={cloth}>
          <mesh position={[0, -BANNER_H / 2, 0]} rotation-y={Math.PI}>
            <planeGeometry args={[BANNER_W, BANNER_H]} />
            <meshBasicMaterial key={map ? "on" : "off"} map={map} color={map ? "#e6e6f0" : "#0d1020"} toneMapped={false} />
          </mesh>
          <mesh position={[0, -BANNER_H / 2, 0.03]}>
            <planeGeometry args={[BANNER_W, BANNER_H]} />
            <meshStandardMaterial color="#0d0d16" />
          </mesh>
        </group>
        <group ref={roll}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.1, 0.1, BANNER_W + 0.24, 14]} />
            <meshBasicMaterial color="#8b7bff" toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ───────────── Drive-in screen that frames the contact form ───────────── */

/**
 * Far away it stands at the end of the road. At the contact stop it is projected onto
 * the form card every frame, so the DOM form sits exactly inside the 3D screen.
 */
export function DriveInScreen() {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useMemo(() => radialTexture(), []);
  const tmp = useMemo(
    () => ({ p: new THREE.Vector3(), dir: new THREE.Vector3(), home: new THREE.Vector3(), q: new THREE.Quaternion(), fwd: new THREE.Vector3() }),
    [],
  );
  const frame = useMemo(() => {
    const s = ROAD_LENGTH + 22;
    const f = frameAt(s, makeFrame());
    return { yaw: f.yaw, pos: pointAt(s, LANE, 5, new THREE.Vector3()) };
  }, []);
  const W = 13;
  const H = 8;

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.visible = !drive.compact && drive.s > ROAD_LENGTH - 190;
    if (!g.visible) return;
    const cam = state.camera as THREE.PerspectiveCamera;
    g.position.copy(frame.pos);
    g.rotation.set(0, frame.yaw + Math.PI, 0);
    g.scale.set(1, 1, 1);

    const card = document.getElementById("contact-screen");
    const lock = THREE.MathUtils.smoothstep(world.finale, 0.35, 0.9);
    if (card && lock > 0) {
      const r = card.getBoundingClientRect();
      const D = 24;
      const toWorld = (x: number, y: number, out: THREE.Vector3) => {
        out.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5).unproject(cam);
        tmp.dir.copy(out).sub(cam.position);
        cam.getWorldDirection(tmp.fwd);
        return out.copy(cam.position).addScaledVector(tmp.dir, D / tmp.dir.dot(tmp.fwd));
      };
      const perPx = (2 * D * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))) / window.innerHeight;
      toWorld(r.left + r.width / 2, r.top + r.height / 2, tmp.home);
      g.position.lerp(tmp.home, lock);
      g.quaternion.slerp(cam.quaternion, lock);
      g.scale.set(
        THREE.MathUtils.lerp(1, (r.width * perPx) / W, lock),
        THREE.MathUtils.lerp(1, (r.height * perPx) / H, lock),
        1,
      );
    }
    if (halo.current) halo.current.color.copy(world.accent);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.6]} renderOrder={1}>
        <planeGeometry args={[W * 2, H * 2.3]} />
        <meshBasicMaterial ref={halo} map={glow} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[W * 1.035, H * 1.05, 0.3]} />
        <meshStandardMaterial color="#12121c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.14]}>
        <boxGeometry args={[W * 1.012, H * 1.018, 0.1]} />
        <meshBasicMaterial color="#8fa2ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial color="#0c0e1c" toneMapped={false} />
      </mesh>
      {[-W * 0.32, W * 0.32].map((x) => (
        <mesh key={x} position={[x, -H * 0.5 - 4, -0.4]}>
          <boxGeometry args={[0.35, 8, 0.35]} />
          <meshStandardMaterial color="#12121c" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
