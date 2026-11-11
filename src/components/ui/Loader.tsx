"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useIntro } from "@/components/providers/IntroProvider";
import { site } from "@/content/site";

/** Short intro: a counter and wordmark, then a curtain that lifts to reveal the hero. */
export function Loader() {
  const { setReady } = useIntro();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visited = false;
    try {
      visited = sessionStorage.getItem("intro-seen") === "1";
    } catch {}
    const duration = reduce || visited ? 0 : 1300;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
      setCount(100);
      setDone(true);
      setReady(true);
    };

    if (duration === 0) {
      const id = setTimeout(finish, 0);
      return () => clearTimeout(id);
    }

    // Safety net: rAF is paused in background tabs, so never let the intro block the page.
    const fallback = setTimeout(finish, duration + 900);

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(step);
      else setTimeout(finish, 180);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [setReady]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink p-[var(--gutter)]"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow">{site.name}</span>
            <span className="eyebrow">Portfolio</span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <motion.p
              className="max-w-xs text-sm text-muted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Crafting the experience
              <span className="ml-1 inline-block animate-[caret_1s_steps(1)_infinite] text-cyan">_</span>
            </motion.p>
            <span className="font-mono text-[clamp(4rem,14vw,11rem)] leading-none font-light tracking-tighter text-fg tabular-nums">
              {count}
              <span className="text-cyan">%</span>
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-px bg-line">
            <div
              className="h-full bg-gradient-to-r from-cyan to-violet"
              style={{ width: `${count}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
