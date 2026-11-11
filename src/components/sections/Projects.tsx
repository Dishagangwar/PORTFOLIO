"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "motion/react";
import { projects, site, type Project } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard } from "@/components/ui/TiltCard";
import { ArrowIcon } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/Icons";
import { ProjectVisual } from "@/components/visuals/ProjectVisuals";
import { isPlaceholder, cn } from "@/lib/cn";
import { lockScroll } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.16, 1, 0.3, 1] as const;

function ProjectLink({ href, label, icon }: { href: string; label: string; icon?: "github" | "external" }) {
  const missing = isPlaceholder(href) || !href;
  if (missing) {
    return (
      <span
        title="Placeholder: add the URL in src/content/site.ts"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-white/15 px-4 py-2 text-[13px] text-dim"
      >
        {label}
        <span className="font-mono text-[10px]">[add link]</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] text-fg/90 transition-colors duration-300 hover:border-cyan/60 hover:text-fg"
    >
      {icon === "github" && <GithubIcon className="h-3.5 w-3.5" />}
      {label}
      <ArrowIcon diagonal className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article
      className="project-card group relative flex w-full shrink-0 flex-col gap-8 lg:h-[min(72vh,720px)] lg:w-[min(80vw,1180px)] lg:flex-row lg:gap-12"
      aria-labelledby={`project-${project.id}`}
    >
      <TiltCard className="relative aspect-[4/3] w-full rounded-[1.75rem] lg:aspect-auto lg:h-full lg:w-[60%]" max={5}>
        <button
          type="button"
          onClick={onOpen}
          data-cursor="View"
          aria-label={`View details for ${project.name}`}
          className="absolute inset-0 overflow-hidden rounded-[1.75rem] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
        >
          <div className="project-parallax absolute inset-[-6%] transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.04]">
            <ProjectVisual project={project} />
          </div>
          <div aria-hidden className="absolute inset-0 rounded-[1.75rem] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]" />
        </button>
      </TiltCard>

      <div className="flex flex-1 flex-col justify-between lg:py-4">
        <div>
          <div className="flex items-center gap-4 font-mono text-xs text-muted">
            <span style={{ color: project.accent }}>{project.index}</span>
            <span className="h-px w-8 bg-white/15" />
            <span>{project.category}</span>
          </div>
          <h3
            id={`project-${project.id}`}
            className="mt-6 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.05em]"
          >
            {project.name}
          </h3>
          <p className="mt-4 font-serif text-2xl text-fg/80 italic">{project.tagline}</p>
          <p className="mt-6 max-w-md leading-relaxed text-muted">{project.description}</p>
        </div>

        <div className="mt-8">
          <ul className="flex flex-wrap gap-2" aria-label="Technology stack">
            {project.stack.map((t) => (
              <li key={t} className="rounded-full bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-fg/80">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpen}
              className="group/btn inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-[13px] font-medium text-ink transition-shadow duration-500 hover:shadow-[0_0_30px_-4px_rgb(91_233_255/0.7)]"
            >
              View Project
              <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
            <ProjectLink href={project.github} label="GitHub" icon="github" />
            <ProjectLink href={project.demo} label="Live Demo" />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/80 backdrop-blur-md" tabIndex={-1} />
      <motion.div
        data-lenis-prevent
        initial={{ y: "8%", opacity: 0, clipPath: "inset(10% 4% 0% 4% round 28px)" }}
        animate={{ y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0% round 28px)" }}
        exit={{ y: "6%", opacity: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative max-h-[92svh] w-full max-w-5xl overflow-y-auto rounded-t-[28px] bg-ink-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] md:rounded-[28px]"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <ProjectVisual project={project} priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-transparent to-transparent" />
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-ink/70 text-fg backdrop-blur-xl transition-colors hover:bg-fg hover:text-ink"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="grid gap-10 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <p className="font-mono text-xs" style={{ color: project.accent }}>
              {project.index} · {project.category} · {project.year}
            </p>
            <h3 id="modal-title" className="mt-4 text-5xl font-medium tracking-[-0.05em] md:text-6xl">
              {project.name}
            </h3>
            <p className="mt-3 font-serif text-2xl text-fg/80 italic">{project.tagline}</p>
            <p className="mt-6 leading-relaxed text-muted">{project.description}</p>
            <ul className="mt-8 space-y-3">
              {project.details.map((d, i) => (
                <li key={i} className="flex gap-4 border-t border-white/[0.06] pt-3 text-fg/80">
                  <span className="font-mono text-xs text-dim">0{i + 1}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-8">
            <div>
              <p className="eyebrow mb-3">Stack</p>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((t) => (
                  <li key={t} className="rounded-full bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-fg/80">{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3">Links</p>
              <div className="flex flex-wrap gap-3">
                <ProjectLink href={project.github} label="GitHub" icon="github" />
                <ProjectLink href={project.demo} label="Live Demo" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Projects() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const [current, setCurrent] = useState(0);
  const close = useCallback(() => setOpen(null), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            pin: true,
            scrub: 0.8,
            start: "top top",
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              setCurrent(Math.min(projects.length - 1, Math.round(self.progress * projects.length - 0.3)));
            },
          },
        });

        // Inner parallax on each visual while the track moves
        gsap.utils.toArray<HTMLElement>(".project-card").forEach((card) => {
          const inner = card.querySelector(".project-parallax");
          if (!inner) return;
          gsap.fromTo(
            inner,
            { xPercent: 5 },
            {
              xPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="projects" ref={section} className="relative py-32 md:py-44 lg:pb-0">
      <div className="container-x">
        <SectionHeader
          index="03"
          label="Featured Projects"
          title="Selected"
          accent="work."
          description="A few things I've designed and engineered, from predictive ML systems to mobile apps with real-world impact."
        />
      </div>

      <div ref={pin} className="relative lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div
          ref={track}
          className="container-x flex flex-col gap-24 will-change-transform lg:w-max lg:max-w-none lg:flex-row lg:items-center lg:gap-[8vw] lg:pr-[10vw]"
        >
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={() => setOpen(p)} />
          ))}

          {/* End panel */}
          <div className="flex shrink-0 flex-col items-start justify-center gap-6 lg:w-[32vw]">
            <p className="eyebrow">More on GitHub</p>
            <p className="max-w-sm text-3xl leading-tight font-medium tracking-[-0.03em]">
              Experiments, packages and works in progress.
            </p>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Open"
              className="group inline-flex items-center gap-3 text-lg text-fg"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 transition-all duration-500 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-cyan group-hover:to-violet group-hover:text-ink">
                <GithubIcon className="h-5 w-5" />
              </span>
              <span className="border-b border-white/20 pb-0.5 transition-colors group-hover:border-cyan">View all repositories</span>
            </a>
          </div>
        </div>

        {/* Desktop progress */}
        <div className="container-x pointer-events-none absolute inset-x-0 bottom-8 hidden items-center gap-6 lg:flex">
          <span className="font-mono text-xs text-muted tabular-nums">
            0{current + 1} <span className="text-dim">/ 0{projects.length}</span>
          </span>
          <div className="h-px flex-1 bg-white/10">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-cyan to-violet" />
          </div>
          <span className={cn("eyebrow")}>Scroll</span>
        </div>
      </div>

      <AnimatePresence>
        {open && <ProjectModal key={open.id} project={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
