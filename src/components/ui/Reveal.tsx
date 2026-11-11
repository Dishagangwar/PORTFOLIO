"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Splits text into words, each sliding up from behind a mask.
 * Use `animate` to control it manually (e.g. hero waits for the loader),
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
  const word: Variants = {
    hidden: { y: reduce ? 0 : "110%", opacity: reduce ? 0 : 1 },
    show: { y: "0%", opacity: 1, transition: { duration: reduce ? 0.3 : 1.1, ease: EASE } },
  };

  const MotionTag = motion[as];
  const control =
    animate === undefined
      ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } }
      : { animate: animate ? "show" : "hidden" };

  return (
    <MotionTag
      className={className}
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
          <motion.span variants={word} className={cn("inline-block will-change-transform", wordClassName)}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
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
