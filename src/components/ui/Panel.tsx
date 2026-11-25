"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * A dark glass window that swings up out of the road as it scrolls in and settles flat.
 * Transform only: Safari can leave opacity/filter reveals stuck partway.
 */
export function Panel({
  children,
  className,
  side = "left",
  title,
  id,
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
  /** Window-bar caption, e.g. "about.dart". Omit to hide the bar. */
  title?: string;
  id?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.5 });
  const dir = side === "left" ? -1 : 1;
  const rotateX = useTransform(p, [0, 1], [26, 0]);
  const rotateY = useTransform(p, [0, 1], [dir * -10, 0]);
  const rotateZ = useTransform(p, [0, 1], [dir * 3.5, 0]);
  const y = useTransform(p, [0, 1], [90, 0]);
  const still = reduce || !tilt;

  return (
    // The outer box is never transformed, so scroll and stop measurements stay stable
    <div ref={ref} id={id} className={cn("relative", className)}>
      <motion.div
        style={still ? undefined : { rotateX, rotateY, rotateZ, y, transformPerspective: 1300 }}
        className="window origin-bottom rounded-3xl will-change-transform"
      >
        {title && (
          <div aria-hidden className="flex items-center gap-1.5 border-b border-white/[0.07] px-6 py-3.5">
            <span className="h-2 w-2 rounded-full bg-cyan/70" />
            <span className="h-2 w-2 rounded-full bg-violet/70" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="ml-3 font-mono text-[11px] text-muted">{title}</span>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
