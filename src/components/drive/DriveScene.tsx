"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { attachPointer, pointer } from "@/lib/pointer";
import { drive, measureStops, sampleScroll, stops, type Shot } from "@/lib/drive";
import { Car } from "./Car";
import { DriveInScreen, HighwayBanner, ProjectDisplays } from "./Displays";
import { City, Gantries, Lamps, Mountains, Road, Sky, Streaks, Trees, Tunnel } from "./Scenery";
import { frameAt, LANE, makeFrame } from "./path";
import { world } from "./world";

const LEAD = 4.5; // the car can pull this far ahead of (or fall behind) the camera

/** Parsed once: mood colours per stop. */
const moods = stops.map((s) => ({
  top: new THREE.Color(s.mood.top),
  horizon: new THREE.Color(s.mood.horizon),
  glow: new THREE.Color(s.mood.glow),
  accent: new THREE.Color(s.mood.accent),
}));

const shotOf = (i: number): Shot => (drive.compact ? stops[i].compact : stops[i].shot);

/** Reads the scroll position, drives the car and flies the camera between shots. */
function Director({ reduced }: { reduced: boolean }) {
  const st = useRef({
    frame: makeFrame(),
    cam: new THREE.Vector3(),
    look: new THREE.Vector3(),
    cTarget: new THREE.Vector3(),
    lTarget: new THREE.Vector3(),
    b: new THREE.Vector3(),
    lookW: new THREE.Vector3(),
    fov: 40,
    shift: new THREE.Vector2(),
    mx: 0,
    my: 0,
    first: true,
  });

  useFrame((state, delta) => {
    const s = st.current;
    const dt = Math.min(delta, 1 / 20);
    const cam = state.camera as THREE.PerspectiveCamera;
    if (!reduced) sampleScroll();

    // Distance: the car reacts fast, the camera follows with more weight
    const prev = drive.s;
    if (s.first) drive.s = world.camS = drive.targetS;
    else {
      drive.s += (drive.targetS - drive.s) * (1 - Math.exp(-6.5 * dt));
      world.camS += (drive.targetS - world.camS) * (1 - Math.exp(-4.2 * dt));
      world.camS = THREE.MathUtils.clamp(world.camS, drive.s - LEAD, drive.s + LEAD * 0.6);
    }
    const v = s.first ? 0 : (drive.s - prev) / Math.max(dt, 1e-3);
    drive.speed += (v - drive.speed) * (1 - Math.exp(-10 * dt));
    if (Math.abs(drive.speed) < 0.01) drive.speed = 0;

    // Shot
    const a = shotOf(drive.from);
    const b = shotOf(drive.to);
    const u = drive.blend;
    s.cTarget.fromArray(a.cam).lerp(s.b.fromArray(b.cam), u);
    s.lTarget.fromArray(a.look).lerp(s.b.fromArray(b.look), u);
    // Passing from behind the car to its front (or back), swing wide instead of cutting through it
    const swing = Math.sign(a.cam[2]) !== Math.sign(b.cam[2]) ? Math.sin(u * Math.PI) : 0;
    const sx = Math.sign(a.cam[0] + b.cam[0]) || 1;
    s.cTarget.x += sx * swing * 5.2;
    s.cTarget.y += swing * 0.7;

    const aspectFit = drive.compact ? 1 : THREE.MathUtils.clamp(1.78 / (state.size.width / state.size.height), 0.92, 1.25);
    const fov = THREE.MathUtils.lerp(a.fov, b.fov, u) * aspectFit;
    const rush = reduced ? 0 : Math.min(1, Math.abs(drive.speed) / 80);
    const k = s.first ? 1 : 1 - Math.exp(-3.4 * dt);
    s.cam.lerp(s.cTarget, k);
    s.look.lerp(s.lTarget, k);
    s.fov += (fov + rush * 7 - s.fov) * k;
    s.shift.x += (THREE.MathUtils.lerp(a.shift[0], b.shift[0], u) - s.shift.x) * k;
    s.shift.y += (THREE.MathUtils.lerp(a.shift[1], b.shift[1], u) - s.shift.y) * k;

    const mk = 1 - Math.exp(-3 * dt);
    if (!reduced && !drive.compact) {
      s.mx += (pointer.x - s.mx) * mk;
      s.my += (pointer.y - s.my) * mk;
    }
    const t = state.clock.elapsedTime;
    const breathe = reduced ? 0 : 1;

    const f = frameAt(world.camS, s.frame);
    const place = (v3: THREE.Vector3, out: THREE.Vector3, dx = 0, dy = 0) =>
      out
        .copy(f.pos)
        .addScaledVector(f.right, LANE + v3.x + dx)
        .addScaledVector(f.fwd, v3.z)
        .setY(v3.y + dy);
    place(s.cam, cam.position, s.mx * 0.55 + Math.sin(t * 0.35) * 0.06 * breathe, s.my * 0.22 + Math.sin(t * 0.5) * 0.03 * breathe);
    cam.position.y = Math.max(0.35, cam.position.y);
    place(s.look, s.lookW);
    cam.lookAt(s.lookW);
    cam.fov = s.fov;
    const { width: w, height: h } = state.size;
    cam.setViewOffset(w, h, -s.shift.x * w, s.shift.y * h, w, h);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    // Mood
    const ma = moods[drive.from];
    const mb = moods[drive.to];
    const ck = s.first ? 1 : 1 - Math.exp(-3 * dt);
    const mix = (out: THREE.Color, x: THREE.Color, y: THREE.Color) => {
      out.r += (x.r + (y.r - x.r) * u - out.r) * ck;
      out.g += (x.g + (y.g - x.g) * u - out.g) * ck;
      out.b += (x.b + (y.b - x.b) * u - out.b) * ck;
    };
    mix(world.skyTop, ma.top, mb.top);
    mix(world.horizon, ma.horizon, mb.horizon);
    mix(world.glow, ma.glow, mb.glow);
    mix(world.accent, ma.accent, mb.accent);
    const finale = drive.to === stops.length - 1 ? u : 0;
    world.finale += (finale - world.finale) * ck;

    // Street lights sweeping over the bodywork: roll the reflections as the car moves
    state.scene.environmentRotation.set(drive.s * 0.11, 0, 0);
    s.first = false;
  }, -1);

  return null;
}

/** Strip lights for the paint to reflect. Rendered once, no network. */
function Studio() {
  return (
    <Environment frames={1} resolution={256} environmentIntensity={0.85}>
      <color attach="background" args={["#04040c"]} />
      <Lightformer form="rect" intensity={5} color="#dfe6ff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[2, 9, 1]} />
      <Lightformer form="rect" intensity={2.6} color="#a5efff" position={[-6, 1.6, 0]} rotation-y={Math.PI / 2} scale={[12, 1.1, 1]} />
      <Lightformer form="rect" intensity={3} color="#c79bff" position={[6, 1.6, 0]} rotation-y={-Math.PI / 2} scale={[12, 1.1, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#d8d2ff" position={[0, 2, 8]} rotation-y={Math.PI} scale={[8, 0.7, 1]} />
      <Lightformer form="rect" intensity={2} color="#cdefff" position={[0, 2, -8]} scale={[8, 0.7, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, -5, 4]} rotation-x={-Math.PI / 2} scale={[6, 0.8, 1]} />
    </Environment>
  );
}

export default function DriveScene({ started, onLive }: { started: boolean; onLive: () => void }) {
  const [cfg, setCfg] = useState<{ reduced: boolean; maxDpr: number } | null>(null);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    attachPointer();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const maxDpr = Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.6);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- quality depends on browser-only capabilities
    setCfg({ reduced, maxDpr });
    setDpr(maxDpr);

    measureStops();
    sampleScroll();
    const ro = new ResizeObserver(() => measureStops());
    ro.observe(document.body);
    window.addEventListener("resize", measureStops);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureStops);
    };
  }, []);

  useEffect(() => {
    world.started = started;
  }, [started]);

  if (!cfg) return null;

  return (
    <Canvas
      dpr={dpr}
      frameloop={cfg.reduced ? "demand" : "always"}
      camera={{ position: [0, 2, -8], fov: 40, near: 0.1, far: 420 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={onLive}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#03040d"]} />
      {/* Step the resolution down only while frames are being dropped */}
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(0.9, d * 0.82))} />
      <Director reduced={cfg.reduced} />
      <ambientLight intensity={0.25} color="#c8c6ff" />
      <directionalLight position={[-6, 9, -4]} intensity={0.6} color="#d5dcff" />
      <Sky />
      <Mountains />
      <Road />
      <Lamps />
      <City />
      <Trees />
      <Gantries />
      <Tunnel />
      <HighwayBanner />
      <ProjectDisplays />
      <DriveInScreen />
      <Streaks />
      <Suspense fallback={null}>
        <Studio />
        <Car reduced={cfg.reduced} />
      </Suspense>
    </Canvas>
  );
}
