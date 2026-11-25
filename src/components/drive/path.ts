import { BufferAttribute, BufferGeometry, Matrix4, Quaternion, Vector3 } from "three";
import { ROAD_LENGTH } from "@/lib/drive";

/** The road: a flat curve built once by integrating a heading over distance. */

export const LANE = 2; // the car keeps to the right-hand lane
export const ROAD_HALF = 5.4;
export const S_MIN = -160;
export const S_MAX = ROAD_LENGTH + 320;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function heading(s: number) {
  // Straight at the start and at the finish
  const env = smoothstep(20, 120, s) * (1 - smoothstep(ROAD_LENGTH - 130, ROAD_LENGTH - 40, s));
  return env * (0.34 * Math.sin(s / 62) + 0.16 * Math.sin(s / 33 + 1.2));
}

const N = S_MAX - S_MIN;
const xs = new Float32Array(N + 1);
const zs = new Float32Array(N + 1);
for (let i = 1; i <= N; i++) {
  const h = heading(S_MIN + i - 0.5);
  xs[i] = xs[i - 1] + Math.sin(h);
  zs[i] = zs[i - 1] + Math.cos(h);
}

export type Frame = { pos: Vector3; fwd: Vector3; right: Vector3; yaw: number; curve: number };

export const makeFrame = (): Frame => ({
  pos: new Vector3(),
  fwd: new Vector3(),
  right: new Vector3(),
  yaw: 0,
  curve: 0,
});

export function frameAt(s: number, out: Frame): Frame {
  const t = Math.min(N - 0.001, Math.max(0, s - S_MIN));
  const i = Math.floor(t);
  const f = t - i;
  out.yaw = heading(s);
  out.curve = (heading(s + 2) - heading(s - 2)) / 4;
  out.pos.set(xs[i] + (xs[i + 1] - xs[i]) * f, 0, zs[i] + (zs[i + 1] - zs[i]) * f);
  out.fwd.set(Math.sin(out.yaw), 0, Math.cos(out.yaw));
  out.right.set(-out.fwd.z, 0, out.fwd.x);
  return out;
}

const scratch = makeFrame();

/** World position of a point `right` metres off the centre line. */
export function pointAt(s: number, right: number, up: number, out: Vector3) {
  frameAt(s, scratch);
  return out.copy(scratch.pos).addScaledVector(scratch.right, right).setY(up);
}

const UP = new Vector3(0, 1, 0);
const q = new Quaternion();
const p = new Vector3();
const sc = new Vector3();

/** Instance matrix for something standing by the road, facing along it. */
export function matrixAt(
  s: number,
  right: number,
  up: number,
  scale: readonly [number, number, number],
  out: Matrix4,
  turn = 0,
) {
  pointAt(s, right, up, p);
  q.setFromAxisAngle(UP, scratch.yaw + turn);
  return out.compose(p, q, sc.set(scale[0], scale[1], scale[2]));
}

/** Distance from a world point to the centre line (coarse, for placing scenery). */
export function distanceToRoad(x: number, z: number) {
  let best = Infinity;
  for (let i = 0; i <= N; i += 6) {
    const d = (xs[i] - x) ** 2 + (zs[i] - z) ** 2;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/** A ribbon that follows the road between two lateral offsets. */
export function ribbon(from: number, to: number, y: number, s0 = S_MIN, s1 = S_MAX, step = 3) {
  const rows = Math.floor((s1 - s0) / step) + 1;
  const pos = new Float32Array(rows * 6);
  const nor = new Float32Array(rows * 6);
  const uv = new Float32Array(rows * 4);
  const idx: number[] = [];
  const v = new Vector3();
  for (let i = 0; i < rows; i++) {
    const s = s0 + i * step;
    pointAt(s, from, y, v).toArray(pos, i * 6);
    pointAt(s, to, y, v).toArray(pos, i * 6 + 3);
    nor[i * 6 + 1] = nor[i * 6 + 4] = 1;
    uv.set([0, s, 1, s], i * 4);
    if (i) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("normal", new BufferAttribute(nor, 3));
  g.setAttribute("uv", new BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/** Half-pipe shell following the road, for the tunnel. */
export function archShell(radius: number, s0: number, s1: number, step = 3, seg = 18) {
  const rows = Math.floor((s1 - s0) / step) + 1;
  const pos: number[] = [];
  const idx: number[] = [];
  const v = new Vector3();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * Math.PI;
      pointAt(s0 + i * step, Math.cos(a) * radius, Math.sin(a) * radius, v);
      pos.push(v.x, v.y, v.z);
      if (i && j) {
        const c = i * (seg + 1) + j;
        idx.push(c, c - 1, c - seg - 1, c - 1, c - seg - 2, c - seg - 1);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Deterministic PRNG so the scenery is identical on every visit. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
