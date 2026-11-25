"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useIntro } from "@/components/providers/IntroProvider";
import { drive, stops } from "@/lib/drive";

const ARC = 2 * Math.PI * 40 * 0.75;

/** Dashboard readout: speed from scrolling, plus the stop you're approaching. Written straight to the DOM. */
export function DriveHud() {
  const { ready } = useIntro();
  const box = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let shown = 0;
    let lastIndex = -1;
    let side = "";
    let swapAt = 0;
    const loop = () => {
      const kmh = Math.min(240, Math.abs(drive.speed) * 3.6 * 0.7);
      shown += (kmh - shown) * 0.16;
      if (num.current) num.current.textContent = String(Math.round(shown)).padStart(3, "0");
      if (arc.current) arc.current.style.strokeDashoffset = String(ARC * (1 - shown / 240));
      // Duck out of the way of the current window, and of the footer
      const key = stops[drive.index].key;
      const left = key === "about" || (key.startsWith("project-") && drive.index % 2 === 0);
      const want = key === "contact" ? "hidden" : left ? "left" : "right";
      const el = box.current;
      if (el && want !== side) {
        el.style.transform = "translateY(160px)";
        if (!swapAt) swapAt = performance.now() + (side ? 380 : 0);
        else if (performance.now() > swapAt) {
          swapAt = 0;
          side = want;
          el.style.left = want === "left" ? "1.5rem" : "auto";
          el.style.right = want === "left" ? "auto" : "1.5rem";
          if (want !== "hidden") el.style.transform = "none";
        }
      } else if (el && side !== "hidden") {
        swapAt = 0;
        el.style.transform = "none";
      }
      if (drive.index !== lastIndex) {
        lastIndex = drive.index;
        if (label.current) label.current.textContent = stops[lastIndex].label;
        if (count.current) count.current.textContent = `${String(lastIndex + 1).padStart(2, "0")} / ${String(stops.length).padStart(2, "0")}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      aria-hidden
      initial={{ y: 140 }}
      animate={{ y: ready ? 0 : 140 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
      className="drive-hud pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden lg:block"
    >
      <div ref={box} className="absolute right-6 bottom-6 flex items-center gap-4 transition-transform duration-500 ease-[var(--ease-expo)]">
      <div className="text-right [text-shadow:0_1px_12px_rgb(0_0_0/0.9)]">
        <span ref={count} className="block font-mono text-[10px] tracking-[0.2em] text-muted" />
        <span ref={label} className="block text-sm font-medium tracking-tight text-fg" />
      </div>
      <div className="relative grid h-[84px] w-[84px] place-items-center rounded-full bg-ink/70">
        <svg viewBox="0 0 100 100" className="absolute inset-0 rotate-[135deg]">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="4" strokeDasharray={`${ARC} 999`} strokeLinecap="round" />
          <circle ref={arc} cx="50" cy="50" r="40" fill="none" stroke="var(--color-cyan)" strokeWidth="4" strokeDasharray={`${ARC} 999`} strokeDashoffset={ARC} strokeLinecap="round" />
        </svg>
        <div className="text-center leading-none">
          <span ref={num} className="block font-mono text-lg font-medium tabular-nums">000</span>
          <span className="mt-1 block font-mono text-[8px] tracking-[0.2em] text-muted">KM/H</span>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
