import { CanvasTexture, SRGBColorSpace } from "three";

let radial: CanvasTexture | null = null;

/** Soft round falloff used for glows, light pools and the contact shadow. */
export function radialTexture() {
  if (radial) return radial;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(0.55, "rgba(255,255,255,0.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  radial = new CanvasTexture(c);
  return radial;
}

/** Overhead road sign with a category title. */
export function signTexture(index: string, title: string, accent: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 192;
  const ctx = c.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#070a18";
  ctx.fillRect(0, 0, 1024, 192);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 1004, 172);
  ctx.fillStyle = accent;
  ctx.font = `500 44px ${font}`;
  ctx.textBaseline = "middle";
  ctx.fillText(index, 48, 98);
  ctx.fillStyle = "#f2f2f5";
  let size = 92;
  do ctx.font = `600 ${size--}px ${font}`;
  while (ctx.measureText(title).width > 820 && size > 30);
  ctx.fillText(title, 140, 100);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
