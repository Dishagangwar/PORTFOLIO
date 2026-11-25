"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { experience } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SlideIn } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";

export function Experience() {
  const list = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.7", "end 0.6"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const top = useTransform(p, (v) => `${v * 100}%`);

  return (
    <section id="experience" data-drive="experience" className="relative flex min-h-[110svh] items-center py-32">
      <div className="container-x">
        <Panel side="left" title="journey.log" className="w-full lg:w-[min(620px,48vw)]">
          <div className="p-6 md:p-10">
            <SectionHeader size="md" index="04" label="Experience & Leadership" title="Where I've" accent="grown." />

            <ol ref={list} className="relative space-y-12">
              {/* A lane with a little car that drives down it */}
              <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-white/12">
                <motion.div style={{ scaleY: reduce ? 1 : p }} className="h-full origin-top bg-gradient-to-b from-cyan to-violet" />
                <motion.svg viewBox="0 0 16 28" style={{ top }} className="absolute left-1/2 z-10 motion-reduce:hidden h-7 w-4 -translate-x-1/2 -translate-y-1/2">
                    <rect x="2" y="1" width="12" height="26" rx="5" fill="#4a2df0" />
                    <path d="M4 9 h8 l-1 5 h-6z" fill="#0b0b16" />
                    <path d="M4 20h8" stroke="#0b0b16" strokeWidth="2" />
                    <path d="M4 25.6h2.4M9.6 25.6H12" stroke="#dfeaff" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M4 2.4h2.4M9.6 2.4H12" stroke="#ff2340" strokeWidth="1.6" strokeLinecap="round" />
                </motion.svg>
              </div>

              {experience.map((item, i) => (
                <li key={i} className="relative pl-10">
                  <span aria-hidden className="absolute top-1.5 left-0 grid h-[15px] w-[15px] place-items-center rounded-full bg-ink shadow-[0_0_0_1px_rgb(91_233_255/0.6)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                  </span>
                  <SlideIn>
                    <p className="font-mono text-xs text-muted">
                      {item.period && <span className="text-fg/85">{item.period} · </span>}
                      {item.type}
                    </p>
                    <h3 className="mt-2 text-2xl leading-tight font-medium tracking-[-0.03em]">{item.role}</h3>
                    <p className="font-serif text-xl text-accent-gradient italic">{item.org}</p>
                    {item.summary && <p className="mt-3 leading-relaxed text-fg/65">{item.summary}</p>}
                    <ul className="mt-4 space-y-2.5">
                      {item.points.map((pt, j) => (
                        <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-fg/75">
                          <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-cyan/60" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Skills used">
                      {item.tags.map((t, j) => (
                        <li key={j} className="rounded-full bg-white/[0.06] px-3 py-1 font-mono text-[11px] text-fg/70">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </SlideIn>
                </li>
              ))}
            </ol>
          </div>
        </Panel>
      </div>
    </section>
  );
}
