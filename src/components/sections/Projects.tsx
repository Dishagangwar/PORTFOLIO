"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { projectCategories, site, type Project, type ProjectCategory } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SplitReveal, SlideIn } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";
import { ArrowIcon } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/Icons";
import { ProjectVisual } from "@/components/visuals/ProjectVisuals";
import { isPlaceholder, cn } from "@/lib/cn";
import { projectSide } from "@/lib/drive";
import { lockScroll } from "@/lib/scroll";

const EASE = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

type Selected = { project: Project; category: ProjectCategory; index: number };
type OpenFn = (s: Selected) => void;

/* ───────────────────────── Shared pieces ───────────────────────── */

function ProjectLink({ href, label, icon }: { href: string; label: string; icon?: "github" }) {
  if (href === "") return null; // e.g. no live demo for this app
  if (isPlaceholder(href)) {
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

function StatusPill({ status, accent }: { status: string; accent: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] tracking-wide text-fg/80">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: accent }} />
        <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
      </span>
      {status}
    </span>
  );
}

/** Tech badges. `max` caps how many show (cards); the rest collapse into a "+N" chip. */
function StackBadges({ stack, accent, max }: { stack: string[]; accent: string; max?: number }) {
  const shown = max && stack.length > max ? stack.slice(0, max) : stack;
  const hidden = stack.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Technology stack">
      {shown.map((t) =>
        isPlaceholder(t) ? (
          <li key={t} className="rounded-full border border-dashed border-white/15 px-3 py-1 font-mono text-[11px] text-dim">
            {t}
          </li>
        ) : (
          <li
            key={t}
            className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-fg/85 transition-colors duration-300 hover:bg-white/[0.09]"
          >
            <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
            {t}
          </li>
        ),
      )}
      {hidden > 0 && (
        <li
          title={stack.slice(shown.length).join(", ")}
          className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-muted"
        >
          +{hidden} more
        </li>
      )}
    </ul>
  );
}

/** One stop on the road: a window on one side, its app screens on giant phones on the other. */
function ProjectStop({ selected, order, onOpen }: { selected: Selected; order: number; onOpen: OpenFn }) {
  const { project, category, index } = selected;
  const side = projectSide(order);
  return (
    <article
      data-drive={`project-${project.id}`}
      className="relative flex min-h-[100svh] items-center py-[16svh] lg:py-16"
      aria-labelledby={`project-${project.id}`}
    >
      <div className="container-x">
        <Panel side={side} title={`${project.id}.app`} className={cn("w-full lg:w-[min(540px,42vw)]", side === "right" && "lg:ml-auto")}>
          {/* Phones stand in the 3D world on large screens; small screens get the preview inline */}
          <button
            type="button"
            onClick={() => onOpen(selected)}
            aria-label={`View details for ${project.name}`}
            className="drive-fallback relative block aspect-[4/3] w-full overflow-hidden"
          >
            <ProjectVisual project={project} category={category} index={index} />
          </button>

          <div className="p-6 md:p-9">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs whitespace-nowrap text-muted">
              <span style={{ color: category.accent }}>{category.label}</span>
              <span>{project.year}</span>
              {project.status && <StatusPill status={project.status} accent={category.accent} />}
            </div>
            <h3
              id={`project-${project.id}`}
              className="mt-5 text-[clamp(2.2rem,3.8vw,3.6rem)] leading-[0.95] font-medium tracking-[-0.05em]"
            >
              <SplitReveal text={project.name} stagger={0.06} />
            </h3>
            <p className="mt-3 font-serif text-xl text-fg/85 italic md:text-2xl">{project.tagline}</p>
            <p className="mt-4 leading-relaxed text-fg/65">{project.description}</p>
            <div className="mt-6">
              <StackBadges stack={project.stack} accent={category.accent} max={5} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpen(selected)}
                className="group/btn inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-[13px] font-medium text-ink transition-shadow duration-500 hover:shadow-[0_0_30px_-4px_rgb(91_233_255/0.7)]"
              >
                View Project
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
              <ProjectLink href={project.github} label="GitHub" icon="github" />
              <ProjectLink href={project.demo} label={project.demoLabel ?? "Live Demo"} />
            </div>
          </div>
        </Panel>
      </div>
    </article>
  );
}

function CategoryHeader({ category }: { category: ProjectCategory }) {
  const words = category.title.split(" ");
  const last = words.pop()!;
  return (
    <header className="container-x py-24">
      <p className="mb-4 font-mono text-xs" style={{ color: category.accent }}>
        {"// "}
        {category.index} <span className="text-fg/70">{category.label}</span>
      </p>
      <h3 className="max-w-3xl text-[clamp(2rem,4.2vw,3.8rem)] leading-[0.98] font-medium tracking-[-0.045em] [text-shadow:0_4px_40px_rgb(0_0_0/0.7)]">
        <SplitReveal text={words.join(" ")} />{" "}
        <SplitReveal
          text={last}
          delay={0.2}
          className="font-serif font-normal italic tracking-[-0.02em]"
          wordClassName="pr-[0.05em] text-accent-gradient"
        />
      </h3>
      <p className="mt-5 max-w-lg leading-relaxed text-fg/75 [text-shadow:0_1px_16px_rgb(0_0_0/0.9)]">{category.description}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {category.platforms.map((p) => (
          <li key={p} className="rounded-full border border-white/15 bg-ink/50 px-3 py-1 font-mono text-[11px] text-fg/80">
            {p}
          </li>
        ))}
      </ul>
    </header>
  );
}

/* ───────────────────────── Detail modal ───────────────────────── */

function ProjectModal({ selected, onClose }: { selected: Selected; onClose: () => void }) {
  const { project, category, index } = selected;
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
          <ProjectVisual project={project} category={category} index={index} priority />
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
            <p className="font-mono text-xs" style={{ color: category.accent }}>
              {category.index}.{pad(index + 1)} · {category.label} · {project.year}
            </p>
            {project.status && (
              <div className="mt-3">
                <StatusPill status={project.status} accent={category.accent} />
              </div>
            )}
            <h3 id="modal-title" className="mt-4 text-5xl font-medium tracking-[-0.05em] md:text-6xl">
              {project.name}
            </h3>
            <p className="mt-3 font-serif text-2xl text-fg/80 italic">{project.tagline}</p>
            <p className="mt-6 leading-relaxed text-muted">{project.description}</p>
            <ul className="mt-8 space-y-3">
              {project.details.map((d, i) => (
                <li key={i} className="flex gap-4 border-t border-white/[0.06] pt-3 text-fg/80">
                  <span className="font-mono text-xs text-dim">{pad(i + 1)}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-8">
            <div>
              <p className="eyebrow mb-3">Stack</p>
              <StackBadges stack={project.stack} accent={category.accent} />
            </div>
            <div>
              <p className="eyebrow mb-3">Links</p>
              <div className="flex flex-wrap gap-3">
                <ProjectLink href={project.github} label="GitHub" icon="github" />
                <ProjectLink href={project.demo} label={project.demoLabel ?? "Live Demo"} />
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot gallery */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="border-t border-white/[0.06] pt-8 pb-10">
            <p className="eyebrow mb-5 px-6 md:px-10">Screens</p>
            <div data-lenis-prevent className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:px-10 [scrollbar-width:thin]">
              {project.screenshots.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.3 + i * 0.07 }}
                  className="relative aspect-[738/1600] w-40 shrink-0 snap-start overflow-hidden rounded-[1.4rem] bg-ink shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_20px_40px_-20px_rgb(0_0_0/0.8)] md:w-48"
                >
                  <Image
                    src={src}
                    alt={`${project.name} screen ${i + 1}`}
                    fill
                    sizes="192px"
                    className="object-cover object-top"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export function Projects() {
  const [open, setOpen] = useState<Selected | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const onOpen = useCallback<OpenFn>((s) => setOpen(s), []);
  const offsets = projectCategories.map((_, i) => projectCategories.slice(0, i).reduce((n, c) => n + c.projects.length, 0));

  return (
    <section id="projects" className="relative">
      <div data-drive="projects" className="container-x flex min-h-[90svh] flex-col justify-end py-24 lg:justify-center">
        <SectionHeader
          index="03"
          label="Featured Projects"
          title="Selected"
          accent="work."
          description="Two showcases: cross-platform apps crafted with Flutter, and native Android apps built with Kotlin."
        />
      </div>

      {projectCategories.map((category, ci) => (
        <div key={category.id} id={`projects-${category.id}`} className="scroll-mt-16">
          <CategoryHeader category={category} />
          {category.projects.map((project, i) => (
            <ProjectStop key={project.id} selected={{ project, category, index: i }} order={offsets[ci] + i} onOpen={onOpen} />
          ))}
        </div>
      ))}

      {/* More on GitHub */}
      <SlideIn className="container-x py-24">
        <a href={site.socials.github} target="_blank" rel="noopener noreferrer" className="window group inline-flex items-center gap-5 rounded-full py-3 pr-8 pl-3">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 transition-all duration-500 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-cyan group-hover:to-violet group-hover:text-ink">
            <GithubIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm text-fg/60">Experiments, packages and works in progress.</span>
            <span className="text-lg text-fg">View all repositories</span>
          </span>
        </a>
      </SlideIn>

      <AnimatePresence>
        {open && <ProjectModal key={open.project.id} selected={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
