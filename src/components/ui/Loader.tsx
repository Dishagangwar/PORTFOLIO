"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useIntro } from "@/components/providers/IntroProvider";
import { onSceneReady } from "@/lib/drive";
import { site } from "@/content/site";

const MIN_MS = 1300;
const MAX_MS = 6000; // never hold the page hostage to the 3D model

/** A car drives across the bottom of the screen while the 3D world loads, then the curtain lifts. */
export function Loader() {
  const { setReady } = useIntro();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let loaded = false;
    let finished = false;
    let raf = 0;
    let shown = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setCount(100);
      setDone(true);
      setReady(true);
    };

    const off = onSceneReady(() => {
      loaded = true;
      if (reduce) finish();
    });
    // Also covers background tabs, where rAF is paused
    const fallback = setTimeout(finish, MAX_MS);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / MIN_MS);
      const goal = loaded ? 100 : 88 * (1 - Math.pow(1 - t, 3)) + Math.min(9, (now - start) / 700);
      shown += (Math.min(goal, t * 100) - shown) * 0.14;
      setCount(Math.round(shown));
      if (loaded && t >= 1 && shown > 99.2) finish();
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      off();
    };
  }, [setReady]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-[90] flex flex-col justify-between overflow-hidden bg-ink p-[var(--gutter)]"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow">{site.name}</span>
            <span className="eyebrow">Portfolio</span>
          </div>

          <div className="pb-10">
            <div className="flex items-end justify-between gap-6">
              <p className="max-w-xs text-sm text-muted">Warming up the engine</p>
              <span className="font-mono text-[clamp(4rem,14vw,11rem)] leading-none font-light tracking-tighter text-fg tabular-nums">
                {count}
                <span className="text-cyan">%</span>
              </span>
            </div>

            {/* Road */}
            <div aria-hidden className="relative mt-10 h-16">
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/15" />
              <div className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-violet to-cyan" style={{ width: `${count}%` }} />
              <div className="absolute inset-x-0 bottom-0" style={{ transform: `translateX(${count}%)` }}>
                <svg viewBox="0 0 120 34" className="absolute bottom-0 left-0 w-[104px] -translate-x-full">
                  <defs>
                    <linearGradient id="loader-beam" x1="0" x2="1">
                      <stop offset="0" stopColor="#cfe4ff" stopOpacity="0.55" />
                      <stop offset="1" stopColor="#cfe4ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M3 25 C4 18 12 15 26 13 C38 5 52 3 64 4 C78 5 86 10 94 14 C106 15 115 18 117 24 L117 27 L4 27 Z" fill="#4a2df0" />
                  <path d="M36 13 C44 7 54 6.5 63 7 C73 7.5 80 10.5 86 14 Z" fill="#0b0b16" />
                  <path d="M108 19 L117 21" stroke="#e6f0ff" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4 20 L9 18.5" stroke="#ff2340" strokeWidth="1.8" strokeLinecap="round" />
                  {[27, 93].map((cx) => (
                    <g key={cx}>
                      <circle cx={cx} cy="26" r="7.4" fill="#08080c" stroke="#8b8fa8" strokeWidth="1.4" />
                      <g style={{ transform: `rotate(${count * 14}deg)`, transformOrigin: `${cx}px 26px` }}>
                        <path d={`M${cx - 5} 26H${cx + 5}M${cx} 21V31`} stroke="#8b8fa8" strokeWidth="1.2" />
                      </g>
                    </g>
                  ))}
                </svg>
                <span className="absolute bottom-[6px] left-0 h-[9px] w-[12vw] -translate-x-1 bg-gradient-to-r from-[#cfe4ff]/50 to-transparent [clip-path:polygon(0_35%,100%_0,100%_100%,0_65%)]" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
