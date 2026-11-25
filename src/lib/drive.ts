import { projectCategories, site } from "@/content/site";

/**
 * Scroll → road. Every section (and every project) that carries a `data-drive="<key>"`
 * attribute is a stop on the route. The distance driven and the camera shot are
 * interpolated between the two stops surrounding the middle of the viewport.
 *
 * State lives in this plain module so the 3D scene and HUD can read it every frame
 * without re-rendering React.
 */

type V3 = readonly [number, number, number];

/** Camera shot relative to the car: [right, up, forward] in metres. */
export type Shot = {
  cam: V3;
  look: V3;
  fov: number;
  /** Where the subject sits on screen, as a fraction of the viewport (+x right, +y up). */
  shift: readonly [number, number];
};

/** Time of day, as hex colours. */
export type Mood = { top: string; horizon: string; glow: string; accent: string };

export type Stop = { key: string; label: string; s: number; shot: Shot; compact: Shot; mood: Mood };

const MOODS = {
  midnight: { top: "#03040d", horizon: "#16154a", glow: "#5b3df0", accent: "#8b7bff" },
  dusk: { top: "#060414", horizon: "#2a1456", glow: "#b04bff", accent: "#b48bff" },
  city: { top: "#02060f", horizon: "#0b2b4e", glow: "#1fa8e0", accent: "#5be9ff" },
  deep: { top: "#03030c", horizon: "#171347", glow: "#6a55ff", accent: "#8b7bff" },
  tunnel: { top: "#030208", horizon: "#1a0f3a", glow: "#8b5bff", accent: "#c06bff" },
  dawn: { top: "#0a0b26", horizon: "#33204f", glow: "#f07a58", accent: "#ffb38a" },
} satisfies Record<string, Mood>;

const COMPACT: Record<"front" | "rear" | "side" | "high", Shot> = {
  front: { cam: [-4.6, 1.9, 9.6], look: [0, 0.5, 0], fov: 50, shift: [0, 0.23] },
  rear: { cam: [1.6, 2.0, -9.6], look: [0, 0.7, 2], fov: 54, shift: [0, 0.2] },
  side: { cam: [-6.4, 1.7, 7.6], look: [0, 0.6, 0.2], fov: 52, shift: [0, 0.24] },
  high: { cam: [0.6, 3.6, -11], look: [0, 0.6, 5], fov: 54, shift: [0, 0.2] },
};

/** Card sits on this side of the screen; the phones stand on the other one. */
export const projectSide = (i: number) => (i % 2 === 0 ? "left" : "right");

function projectShot(i: number): Shot {
  const phonesRight = projectSide(i) === "left";
  return phonesRight
    ? { cam: [-2.6, 1.9, -8.2], look: [2.0, 2.2, 6], fov: 46, shift: [0.16, -0.06] }
    : { cam: [3.2, 1.9, -8.4], look: [-2.6, 2.2, 6], fov: 48, shift: [-0.17, -0.06] };
}

const allProjects = projectCategories.flatMap((c) => c.projects);
const PROJECT_START = 336;
const PROJECT_GAP = 58;
const projectStops: Stop[] = allProjects.map((p, i) => ({
  key: `project-${p.id}`,
  label: p.name,
  s: PROJECT_START + i * PROJECT_GAP,
  shot: projectShot(i),
  compact: COMPACT.high,
  mood: i % 2 === 0 ? MOODS.city : MOODS.deep,
}));
const PROJECT_END = PROJECT_START + (allProjects.length - 1) * PROJECT_GAP;

/** Where the banner hangs, a little way past its stop. */
export const BANNER_S = 73;

export const TUNNEL = { start: PROJECT_END + 50, end: PROJECT_END + 190 };
export const ROAD_LENGTH = PROJECT_END + 310;

export const stops: Stop[] = [
  {
    key: "home",
    label: "Home",
    s: 0,
    shot: { cam: [-3.7, 1.05, 6.4], look: [0, 0.62, 0.1], fov: 34, shift: [0.2, -0.06] },
    compact: COMPACT.front,
    mood: MOODS.midnight,
  },
  {
    // Open road: the car heads for the banner with nothing else on screen
    key: "banner",
    label: site.bannerTitle,
    s: 60,
    shot: { cam: [-1.9, 1.3, -8.6], look: [-1.75, 2.75, 8], fov: 46, shift: [0, -0.04] },
    compact: { cam: [-0.7, 2, -11], look: [-1.1, 2.9, 8], fov: 64, shift: [0, 0.02] },
    mood: MOODS.dusk,
  },
  {
    key: "about",
    label: "About",
    s: 124,
    shot: { cam: [-8, 1.3, 2.2], look: [0, 0.85, 0.2], fov: 38, shift: [-0.22, -0.13] },
    compact: COMPACT.side,
    mood: MOODS.dusk,
  },
  {
    key: "skills",
    label: "Skills",
    s: 204,
    shot: { cam: [-1.1, 1.0, -7.6], look: [0.1, 1.35, 6], fov: 50, shift: [0.22, -0.1] },
    compact: COMPACT.rear,
    mood: MOODS.city,
  },
  {
    key: "projects",
    label: "Projects",
    s: 276,
    shot: { cam: [3.6, 5.6, -9.5], look: [0, 0.4, 5], fov: 44, shift: [0.12, -0.12] },
    compact: COMPACT.high,
    mood: MOODS.city,
  },
  ...projectStops,
  {
    key: "experience",
    label: "Experience",
    s: (TUNNEL.start + TUNNEL.end) / 2,
    shot: { cam: [1.9, 0.85, 6.6], look: [0, 0.75, 0], fov: 46, shift: [0.22, -0.08] },
    compact: COMPACT.front,
    mood: MOODS.tunnel,
  },
  {
    key: "contact",
    label: "Contact",
    s: ROAD_LENGTH,
    shot: { cam: [0.4, 2.0, -9.6], look: [0, 1.5, 8], fov: 42, shift: [0.17, -0.27] },
    compact: COMPACT.high,
    mood: MOODS.dawn,
  },
];

export const drive = {
  /** Distance the scroll position asks for, and where the car actually is (metres). */
  targetS: 0,
  s: 0,
  /** Smoothed signed speed in m/s. */
  speed: 0,
  /** Current segment between two stops and eased blend across it. */
  from: 0,
  to: 0,
  blend: 0,
  index: 0,
  /** 0..1 over the whole page. */
  progress: 0,
  compact: false,
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

let centers: number[] = [];

/** Re-measure the stops. Call on mount and whenever layout changes. */
export function measureStops() {
  centers = stops.map((stop) => {
    const el = document.querySelector<HTMLElement>(`[data-drive="${stop.key}"]`);
    if (!el) return NaN;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY + r.height / 2;
  });
  // A missing stop inherits its predecessor, so one absent section can't break the route
  centers.forEach((c, i) => {
    if (Number.isNaN(c)) centers[i] = i ? centers[i - 1] + 1 : 0;
  });
  drive.compact = window.innerWidth < 1024;
}

/** Map the current scroll position onto the route. */
export function sampleScroll() {
  if (!centers.length) return;
  const y = window.scrollY + window.innerHeight / 2;
  let i = 0;
  while (i < centers.length - 2 && y > centers[i + 1]) i++;
  const u = clamp01((y - centers[i]) / Math.max(1, centers[i + 1] - centers[i]));
  const a = stops[i];
  const b = stops[i + 1];
  // Mostly linear, easing a little so the car slows down near each stop
  drive.targetS = a.s + (b.s - a.s) * (u * 0.45 + smooth(u) * 0.55);
  drive.from = i;
  drive.to = i + 1;
  drive.blend = smooth(clamp01((u - 0.15) / 0.7));
  drive.index = u > 0.5 ? i + 1 : i;
  drive.progress = clamp01(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
}

/* ───────────── Scene readiness (the loader waits for the car) ───────────── */

let sceneReady = false;
const listeners = new Set<() => void>();

export function markSceneReady() {
  sceneReady = true;
  listeners.forEach((l) => l());
}

export function onSceneReady(cb: () => void) {
  if (sceneReady) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
