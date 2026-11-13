"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Splits text into words, each rising from behind a mask with a slight tilt
 * (transform only, which Safari handles reliably). Use `animate` to control
 * it manually (e.g. hero waits for the loader), otherwise it plays when
 * scrolled into view.
 *
 * `wave` offsets each word's CSS animation (e.g. a flowing gradient) by that
 * many seconds so the colour ripples across the line instead of moving in sync.
 * `swash` draws a hand-drawn underline beneath the text once the words land.
 */
export function SplitReveal({
  text,
  as = "span",
  className,
  wordClassName,
  delay = 0,
  stagger = 0.045,
  animate,
  wave = 0,
  swash = false,
}: {
  text: string;
  as?: "span" | "p" | "div";
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  animate?: boolean;
  wave?: number;
  swash?: boolean;
}) {
  const reduce = useReducedMotion();
  const gradientId = useId();
  const words = text.split(" ");

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word: Variants = reduce
    ? { hidden: {}, show: {} } // reduced motion: words are simply shown
    : {
        // Transform only: the mask hides the word until it rises. Safari can
        // leave opacity/filter word animations stuck partway, so avoid them.
        hidden: { y: "110%", rotate: 7 },
        show: { y: "0%", rotate: 0, transition: { duration: 1.2, ease: EASE } },
      };
  const line: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: reduce ? 0.3 : 1.3, ease: [0.65, 0, 0.35, 1], delay: reduce ? 0 : 0.45 },
    },
  };

  const MotionTag = motion[as];
  const control =
    animate === undefined
      ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } }
      : { animate: animate ? "show" : "hidden" };

  return (
    <MotionTag
      className={cn(swash && "relative inline-block", className)}
      initial="hidden"
      variants={container}
      aria-label={text}
      {...control}
    >
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
        >
          <motion.span
            variants={word}
            style={wave ? { animationDelay: `${-i * wave}s` } : undefined}
            className={cn("inline-block origin-bottom-left will-change-transform", wordClassName)}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
      {swash && (
        <svg
          aria-hidden
          viewBox="0 0 300 24"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -bottom-[0.1em] left-[2%] h-[0.2em] w-[96%] overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--color-cyan)" />
              <stop offset="100%" stopColor="var(--color-violet)" />
            </linearGradient>
          </defs>
          <motion.path
            variants={line}
            d="M3 16 C 60 6, 120 4, 180 9 S 270 18, 297 7"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </MotionTag>
  );
}

/** Fades and lifts a block into view. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}
