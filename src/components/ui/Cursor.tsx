"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor: a precise dot plus a trailing ring that morphs on interactive
 * elements. Elements can set data-cursor="Label" to show text inside the ring.
 * Only enabled for fine pointers and when motion is allowed.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- enabling depends on browser-only media queries
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let visible = false;
    let raf = 0;

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = target.x;
        pos.y = target.y;
        dot.current?.style.setProperty("opacity", "1");
        ring.current?.style.setProperty("opacity", "1");
      }
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
    };

    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(
        "a, button, input, textarea, [data-cursor]",
      );
      setHovering(!!el);
      setLabel(el?.dataset.cursor ?? null);
    };

    const leave = () => {
      visible = false;
      dot.current?.style.setProperty("opacity", "0");
      ring.current?.style.setProperty("opacity", "0");
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;

  const size = label ? 88 : hovering ? 54 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ring}
        className="absolute top-0 left-0 opacity-0 transition-opacity duration-300"
      >
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] font-medium tracking-wide text-ink transition-[width,height,background-color,border-color,scale] duration-500 ease-[var(--ease-expo)]"
          style={{
            width: size,
            height: size,
            scale: down ? 0.85 : 1,
            borderColor: label ? "transparent" : "rgb(255 255 255 / 0.35)",
            backgroundColor: label
              ? "var(--color-cyan)"
              : hovering
                ? "rgb(91 233 255 / 0.08)"
                : "transparent",
            backdropFilter: hovering && !label ? "blur(2px)" : undefined,
          }}
        >
          {label}
        </div>
      </div>
      <div
        ref={dot}
        className="absolute top-0 left-0 opacity-0 transition-opacity duration-300"
      >
        <div
          className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan transition-transform duration-300"
          style={{ transform: `translate(-50%, -50%) scale(${label ? 0 : 1})` }}
        />
      </div>
    </div>
  );
}
