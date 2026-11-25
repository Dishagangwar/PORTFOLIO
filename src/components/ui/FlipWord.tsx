"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** Cycles through words, each flipping up like a split-flap board. */
export function FlipWord({ words, className }: { words: readonly string[]; className?: string }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [reduce, words.length]);
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      <span className="sr-only">{words.join(", ")}</span>
      {/* Reserve the widest word so the line never reflows */}
      {words.map((w) => (
        <span key={w} aria-hidden className="invisible col-start-1 row-start-1 font-medium whitespace-nowrap">
          {w}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          aria-hidden
          className={`col-start-1 row-start-1 font-medium whitespace-nowrap ${className ?? ""}`}
          style={{ transformPerspective: 500 }}
          initial={{ y: "105%", rotateX: -80 }}
          animate={{ y: "0%", rotateX: 0 }}
          exit={{ y: "-105%", rotateX: 80 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
