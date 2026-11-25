import { Color, Vector3 } from "three";

/** Per-frame values shared between scene pieces (never triggers React renders). */
export const world = {
  /** Set once the intro loader lifts. */
  started: false,
  carS: 0,
  carPos: new Vector3(),
  /** Distance the camera rig is following (lags behind the car a little). */
  camS: 0,
  skyTop: new Color("#03040d"),
  horizon: new Color("#16154a"),
  glow: new Color("#5b3df0"),
  accent: new Color("#8b7bff"),
  /** 0 → 1 as the contact stop approaches. */
  finale: 0,
};
