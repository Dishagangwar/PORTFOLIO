"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { navItems, site } from "@/content/site";
import { scrollToId } from "@/lib/scroll";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 120, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/[0.06] pt-20 pb-8">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="eyebrow mb-4">Navigate</p>
            <ul className="space-y-2">
              {navItems.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(n.id);
                    }}
                    className="text-fg/70 transition-colors hover:text-fg"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Connect</p>
            <ul className="space-y-2">
              <li><a className="text-fg/70 hover:text-fg" href={site.socials.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a className="text-fg/70 hover:text-fg" href={site.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a className="text-fg/70 hover:text-fg" href={site.socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div>
          <div className="md:text-right">
            <p className="eyebrow mb-4">Based in</p>
            <p className="text-fg/70">{site.location}</p>
            <button
              type="button"
              onClick={() => scrollToId("home")}
              className="group mt-8 inline-flex items-center gap-3 text-sm text-fg/80 hover:text-fg"
            >
              Back to top
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-cyan/60">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                  <path d="M8 13V3m0 0L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <motion.p
        aria-hidden
        style={{ y, opacity }}
        className="mt-20 text-center text-[clamp(3rem,15vw,15rem)] leading-[0.85] font-medium tracking-[-0.06em] whitespace-nowrap text-gradient select-none"
      >
        {site.name}
      </motion.p>

      <div className="container-x mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-dim">
        <p>Designed &amp; engineered by {site.name}.</p>
        <p>Built with Next.js, React Three Fiber, GSAP &amp; Motion.</p>
      </div>
    </footer>
  );
}
