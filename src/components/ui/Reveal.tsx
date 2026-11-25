"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Splits text into words that flip up from behind a mask, like a split-flap board.
 * Transform only: Safari can leave opacity/filter word animations stuck partway.
 * Use `animate` to control it manually (e.g. the hero waits for the loader),
 * otherwise it plays when scrolled into view.
 */
export function SplitReveal({
  text,
  as = "span",
  className,
  wordClassName,
  delay = 0,
  stagger = 0.045,
  animate,
}: {
  text: string;
  as?: "span" | "p" | "div";
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word: Variants = reduce
    ? { hidden: {}, show: {} } // reduced motion: words are simply shown
    : {
        hidden: { y: "115%", rotateX: -70 },
        show: { y: "0%", rotateX: 0, transition: { duration: 1.05, ease: EASE } },
      };

  const MotionTag = motion[as];
  const control =
    animate === undefined
      ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -8% 0px" } }
      : { animate: animate ? "show" : "hidden" };

  return (
    <MotionTag className={className} initial="hidden" variants={container} aria-label={text} {...control}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="-mb-[0.24em] inline-block overflow-hidden pb-[0.24em] align-bottom">
          <motion.span
            variants={word}
            style={{ transformPerspective: 700 }}
            className={cn("inline-block origin-bottom will-change-transform", wordClassName)}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/** Slides a block up into place. Transform only, for the same Safari reason. */
export function SlideIn({
  children,
  className,
  delay = 0,
  y = 34,
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
      initial={{ y: reduce ? 0 : y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px -4% 0px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}
