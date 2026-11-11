/**
 * Window-level pointer in normalized device coords (-1..1).
 * Shared by 3D scenes so they react even when content overlays the canvas.
 */
export const pointer = { x: 0, y: 0, active: false };

let attached = false;
export function attachPointer() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.active = true;
    },
    { passive: true },
  );
}
