"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { about } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn, SplitReveal } from "@/components/ui/Reveal";
import { Workspace } from "@/components/visuals/Workspace";
import { PhotoBackdrop } from "@/components/visuals/PhotoBackdrop";

/** Words light up one by one as the paragraph scrolls through the viewport. */
function ScrollHighlight({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p
      ref={ref}
      aria-label={text}
      className="text-[clamp(1.6rem,3.4vw,3rem)] leading-[1.15] font-medium tracking-[-0.03em]"
    >
      {words.map((w, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          static={!!reduce}
        >
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  static: isStatic,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  static: boolean;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span aria-hidden style={{ opacity: isStatic ? 1 : opacity }} className="inline">
      {children}{" "}
    </motion.span>
  );
}

export function About() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const bgX = useTransform(scrollYProgress, [0, 1], ["5%", reduce ? "5%" : "-25%"]);
  const photoY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <section id="about" ref={section} className="relative overflow-hidden py-32 md:py-44">
      {/* Subtle photo backdrop (shared with the hero so both look identical) */}
      {about.photo && <PhotoBackdrop src={about.photo} y={photoY} />}

      {/* Parallax backdrop word */}
      <motion.span
        aria-hidden
        style={{ x: bgX }}
        className="pointer-events-none absolute top-24 left-0 font-serif text-[22vw] leading-none whitespace-nowrap text-white/[0.025] italic select-none"
      >
        engineer × designer
      </motion.span>

      <div className="container-x relative">
        <SectionHeader index="01" label="About" title="Engineering with" accent="intention." />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ScrollHighlight text={about.lead} />

            <div className="mt-14 grid gap-8 text-[1.05rem] leading-relaxed text-muted md:grid-cols-2">
              {about.paragraphs.map((p, i) => (
                <FadeIn key={i} delay={i * 0.08} className={i === 2 ? "md:col-span-2 md:max-w-[70%]" : ""}>
                  <p>{p}</p>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Workspace />
          </div>
        </div>

        {/* Principles */}
        <div className="mt-28 grid gap-px overflow-hidden rounded-3xl bg-line md:grid-cols-3">
          {about.principles.map((p, i) => (
            <FadeIn
              key={p.title}
              delay={i * 0.1}
              className="group relative bg-ink p-8 transition-colors duration-700 hover:bg-ink-2 md:p-10"
            >
              <span className="font-mono text-xs text-dim">0{i + 1}</span>
              <h3 className="mt-10 text-2xl font-medium tracking-[-0.03em]">
                <SplitReveal text={p.title} delay={0.1 + i * 0.1} />
              </h3>
              <p className="mt-3 max-w-xs leading-relaxed text-muted">{p.body}</p>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan to-violet transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100"
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
