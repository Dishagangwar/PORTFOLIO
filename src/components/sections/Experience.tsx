"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";
import { experience } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.16, 1, 0.3, 1] as const;

export function Experience() {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) {
        gsap.set(line.current, { scaleY: 1 });
        return;
      }
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        },
      );
    },
    { scope: list, dependencies: [reduce] },
  );

  return (
    <section id="experience" className="relative py-32 md:py-44">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-x">
        <SectionHeader index="04" label="Experience & Leadership" title="Where I've" accent="grown." />

        <ol ref={list} className="relative">
          {/* Track + animated progress line */}
          <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-white/[0.08] md:left-[calc(30%+7px)]" />
          <div
            ref={line}
            aria-hidden
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-gradient-to-b from-cyan via-violet to-blue md:left-[calc(30%+7px)]"
            style={{ transform: "scaleY(0)" }}
          />

          {experience.map((item, i) => (
            <li key={i} className="relative grid gap-4 pb-20 pl-10 last:pb-0 md:grid-cols-[30%_1fr] md:gap-0 md:pl-0">
              {/* Meta column */}
              <motion.div
                initial={{ opacity: 0, x: reduce ? 0 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1, ease: EASE }}
                className="md:pr-12 md:text-right"
              >
                <p className="font-mono text-sm text-fg/80">{item.period}</p>
                <p className="eyebrow mt-2 !text-[10px]">{item.type}</p>
              </motion.div>

              {/* Node */}
              <motion.span
                aria-hidden
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
                className="absolute top-1 left-0 grid h-[15px] w-[15px] place-items-center rounded-full bg-ink shadow-[0_0_0_1px_rgb(91_233_255/0.6),0_0_20px_rgb(91_233_255/0.5)] md:left-[30%]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              </motion.span>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
                className="group md:pl-14"
              >
                <h3 className="text-[clamp(1.75rem,3.2vw,2.75rem)] leading-tight font-medium tracking-[-0.04em]">
                  {item.role}
                </h3>
                <p className="mt-1 font-serif text-2xl text-accent-gradient italic">{item.org}</p>
                <p className="mt-5 max-w-2xl leading-relaxed text-muted">{item.summary}</p>
                <ul className="mt-6 max-w-2xl space-y-3">
                  {item.points.map((pt, j) => (
                    <li key={j} className="flex gap-3 text-fg/80">
                      <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-cyan/60" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Skills used">
                  {item.tags.map((t, j) => (
                    <li key={j} className="rounded-full bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-fg/70">
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
