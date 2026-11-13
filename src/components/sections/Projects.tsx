"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { projectCategories, site, type Project, type ProjectCategory } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SplitReveal, FadeIn } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ArrowIcon } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/Icons";
import { ProjectVisual } from "@/components/visuals/ProjectVisuals";
import { isPlaceholder, cn } from "@/lib/cn";
import { lockScroll, scrollToId } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

function ProjectInfo({
  selected,
  onOpen,
  size = "lg",
}: {
  selected: Selected;
  onOpen: OpenFn;
  size?: "lg" | "md";
}) {
  const { project, category, index } = selected;
  return (
    <div className="flex flex-1 flex-col justify-between lg:py-4">
      <div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs whitespace-nowrap text-muted">
          <span style={{ color: category.accent }}>{pad(index + 1)}</span>
          <span className="h-px w-8 bg-white/15" />
          <span>{category.label}</span>
          <span className="text-dim">· {project.year}</span>
          {project.status && <StatusPill status={project.status} accent={category.accent} />}
        </div>
        <h3
          id={`project-${project.id}`}
          className={cn(
            "mt-6 leading-[0.95] font-medium tracking-[-0.05em] lg:mt-4",
            size === "lg" ? "text-[clamp(2.5rem,4.2vw,4.5rem)]" : "text-[clamp(2.5rem,4.4vw,4rem)]",
          )}
        >
          {project.name}
        </h3>
        <p className="mt-4 font-serif text-2xl text-fg/80 italic lg:mt-3 lg:text-xl xl:text-2xl">{project.tagline}</p>
        <p className="mt-6 max-w-md leading-relaxed text-muted lg:mt-4">{project.description}</p>
      </div>

      <div className="mt-8 lg:mt-6">
        <StackBadges stack={project.stack} accent={category.accent} max={5} />
        <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-5">
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
    </div>
  );
}

/** Clickable, tilting preview. `parallaxClass` lets the GSAP track drive inner parallax. */
function PreviewButton({
  selected,
  onOpen,
  className,
  parallaxClass,
}: {
  selected: Selected;
  onOpen: OpenFn;
  className?: string;
  parallaxClass?: string;
}) {
  const { project, category, index } = selected;
  return (
    <TiltCard className={cn("relative rounded-[1.75rem]", className)} max={5}>
      <button
        type="button"
        onClick={() => onOpen(selected)}
        data-cursor="View"
        aria-label={`View details for ${project.name}`}
        className="group/preview absolute inset-0 overflow-hidden rounded-[1.75rem]"
      >
        <div
          className={cn(
            "absolute inset-[-6%] transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover/preview:scale-[1.05]",
            parallaxClass,
          )}
        >
          <ProjectVisual project={project} category={category} index={index} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-700 group-hover/preview:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${category.accent}55, inset 0 -80px 120px -60px ${category.accent}40` }}
        />
        <div aria-hidden className="absolute inset-0 rounded-[1.75rem] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]" />
      </button>
    </TiltCard>
  );
}

function CategoryHeader({ category, count }: { category: ProjectCategory; count: number }) {
  const words = category.title.split(" ");
  const last = words.pop()!;
  return (
    <header className="container-x mb-16 md:mb-24">
      <FadeIn className="mb-8 flex flex-wrap items-center gap-4">
        <span className="font-mono text-xs" style={{ color: category.accent }}>
          {category.index}
        </span>
        <span className="h-px w-12" style={{ background: `linear-gradient(90deg, ${category.accent}b3, transparent)` }} />
        <span className="eyebrow">{category.label}</span>
      </FadeIn>
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <h3 className="text-[clamp(2.2rem,5.2vw,4.8rem)] leading-[0.98] font-medium tracking-[-0.045em] lg:col-span-8">
          <SplitReveal text={words.join(" ")} />{" "}
          <SplitReveal
            text={last}
            delay={0.2}
            className="font-serif font-normal italic tracking-[-0.02em]"
            wordClassName="pr-[0.05em] text-accent-gradient"
          />
        </h3>
        <div className="lg:col-span-4">
          <FadeIn delay={0.25}>
            <p className="leading-relaxed text-muted">{category.description}</p>
          </FadeIn>
          <FadeIn delay={0.35} className="mt-6 flex flex-wrap items-center gap-2">
            {category.platforms.map((p) => (
              <span key={p} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-fg/70">
                {p}
              </span>
            ))}
            <span className="ml-1 font-mono text-[11px] text-dim">{pad(count)} projects</span>
          </FadeIn>
        </div>
      </div>
    </header>
  );
}

/* ───────────── Showcase 01: pinned horizontal track (Flutter) ───────────── */

function TrackShowcase({ category, next, onOpen }: { category: ProjectCategory; next?: ProjectCategory; onOpen: OpenFn }) {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const total = category.projects.length;

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
              setCurrent(Math.min(total - 1, Math.max(0, Math.round(self.progress * total - 0.3))));
            },
          },
        });

        // Inner parallax on each visual while the track moves
        gsap.utils.toArray<HTMLElement>(".track-card", root.current).forEach((card) => {
          const inner = card.querySelector(".track-parallax");
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
    { scope: root },
  );

  return (
    <div ref={root} id={`projects-${category.id}`} className="relative scroll-mt-24">
      <CategoryHeader category={category} count={total} />

      <div ref={pin} className="relative lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div
          ref={track}
          className="container-x flex flex-col gap-24 will-change-transform lg:w-max lg:max-w-none lg:flex-row lg:items-center lg:gap-[8vw] lg:pr-[10vw]"
        >
          {category.projects.map((project, i) => {
            const selected = { project, category, index: i };
            return (
              <FadeIn key={project.id} y={40} className="lg:contents">
                <article
                  className="track-card relative flex w-full shrink-0 flex-col gap-8 lg:h-[min(72vh,720px)] lg:w-[min(80vw,1180px)] lg:flex-row lg:gap-10"
                  aria-labelledby={`project-${project.id}`}
                >
                  <PreviewButton
                    selected={selected}
                    onOpen={onOpen}
                    parallaxClass="track-parallax"
                    className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:w-[54%]"
                  />
                  <ProjectInfo selected={selected} onOpen={onOpen} />
                </article>
              </FadeIn>
            );
          })}

          {/* End panel: hand-off to the next showcase */}
          {next && (
            <div className="hidden shrink-0 flex-col items-start justify-center gap-6 lg:flex lg:w-[34vw]">
              <p className="eyebrow">Up next · {next.index}</p>
              <p className="max-w-sm text-4xl leading-tight font-medium tracking-[-0.03em]">
                From cross-platform to <span className="font-serif font-normal italic text-accent-gradient">native.</span>
              </p>
              <button
                type="button"
                onClick={() => scrollToId(`projects-${next.id}`)}
                data-cursor="Next"
                className="group inline-flex items-center gap-3 text-lg text-fg"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 transition-all duration-500 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-cyan group-hover:to-violet group-hover:text-ink">
                  <ArrowIcon className="h-5 w-5 rotate-90" />
                </span>
                <span className="border-b border-white/20 pb-0.5 transition-colors group-hover:border-cyan">
                  {next.label} projects
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop progress */}
        <div className="container-x pointer-events-none absolute inset-x-0 bottom-8 hidden items-center gap-6 lg:flex">
          <span className="font-mono text-xs text-muted tabular-nums">
            {pad(current + 1)} <span className="text-dim">/ {pad(total)}</span>
          </span>
          <div className="h-px flex-1 bg-white/10">
            <div
              ref={bar}
              className="h-full origin-left scale-x-0"
              style={{ background: `linear-gradient(90deg, ${category.accent}, var(--color-violet))` }}
            />
          </div>
          <span className="eyebrow">{category.label}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Transition band between the two showcases ───────────── */

function CategoryTransition({ from, to }: { from: ProjectCategory; to: ProjectCategory }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-30%", reduce ? "-30%" : "0%"]);
  const line = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

  const row = (words: string[]) => Array.from({ length: 4 }, () => words).flat();
  const fromWords = row(["Flutter", "Dart", "Cross-platform"]);
  const toWords = row(["Kotlin", "XML", "Native Android"]);

  return (
    <div ref={ref} aria-hidden className="relative my-28 overflow-hidden py-10 select-none md:my-40">
      <motion.div style={{ x: x1 }} className="flex gap-10 whitespace-nowrap">
        {fromWords.map((w, i) => (
          <span
            key={i}
            className="text-[clamp(3rem,9vw,8rem)] leading-none font-medium tracking-[-0.05em] text-transparent"
            style={{ WebkitTextStroke: `1px ${from.accent}55` }}
          >
            {w} <span className="font-serif italic">/</span>
          </span>
        ))}
      </motion.div>

      <div className="container-x relative my-8 flex items-center gap-6">
        <motion.span style={{ scaleX: line }} className="h-px flex-1 origin-right bg-gradient-to-l from-cyan/70 to-transparent" />
        <span className="glass flex shrink-0 items-center gap-3 rounded-full px-4 py-2 font-mono text-[11px] text-fg/80">
          <span style={{ color: from.accent }}>{from.index}</span>
          <ArrowIcon className="h-3 w-3 text-muted" />
          <span style={{ color: to.accent }}>{to.index}</span>
          <span className="text-muted">{to.label}</span>
        </span>
        <motion.span style={{ scaleX: line }} className="h-px flex-1 origin-left bg-gradient-to-r from-violet/70 to-transparent" />
      </div>

      <motion.div style={{ x: x2 }} className="flex gap-10 whitespace-nowrap">
        {toWords.map((w, i) => (
          <span
            key={i}
            className="text-[clamp(3rem,9vw,8rem)] leading-none font-medium tracking-[-0.05em] text-transparent"
            style={{ WebkitTextStroke: `1px ${to.accent}66` }}
          >
            {w} <span className="font-serif italic">/</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ───────────── Showcase 02: alternating editorial rows (Kotlin) ───────────── */

function EditorialRow({ selected, onOpen }: { selected: Selected; onOpen: OpenFn }) {
  const reduce = useReducedMotion();
  const reverse = selected.index % 2 === 1;
  return (
    <article
      className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
      aria-labelledby={`project-${selected.project.id}`}
    >
      <motion.div
        className={cn("lg:col-span-7", reverse && "lg:order-2")}
        initial={reduce ? { opacity: 0 } : { clipPath: "inset(14% 10% 14% 10% round 28px)", opacity: 0.4 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <motion.div
          initial={{ scale: reduce ? 1 : 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 1.8, ease: EASE }}
        >
          <PreviewButton selected={selected} onOpen={onOpen} className="aspect-[4/3] w-full lg:aspect-[5/4]" />
        </motion.div>
      </motion.div>

      <FadeIn delay={0.15} y={40} className={cn("flex lg:col-span-5", reverse && "lg:order-1")}>
        <ProjectInfo selected={selected} onOpen={onOpen} size="md" />
      </FadeIn>
    </article>
  );
}

function EditorialShowcase({ category, onOpen }: { category: ProjectCategory; onOpen: OpenFn }) {
  return (
    <div id={`projects-${category.id}`} className="relative scroll-mt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full opacity-60"
        style={{ background: `radial-gradient(circle, ${category.accent}14, transparent 60%)` }}
      />
      <CategoryHeader category={category} count={category.projects.length} />
      <div className="container-x relative space-y-28 md:space-y-40">
        {category.projects.map((project, i) => (
          <EditorialRow key={project.id} selected={{ project, category, index: i }} onOpen={onOpen} />
        ))}
      </div>
    </div>
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
  const [flutter, kotlin] = projectCategories;

  return (
    <section id="projects" className="relative pt-32 pb-12 md:pt-44 md:pb-16">
      <div className="container-x">
        <SectionHeader
          index="03"
          label="Featured Projects"
          title="Selected"
          accent="work."
          description="Two showcases: cross-platform apps crafted with Flutter, and native Android apps built with Kotlin."
        />
      </div>

      <TrackShowcase category={flutter} next={kotlin} onOpen={onOpen} />
      <CategoryTransition from={flutter} to={kotlin} />
      <EditorialShowcase category={kotlin} onOpen={onOpen} />

      {/* More on GitHub */}
      <FadeIn className="container-x mt-32 md:mt-44">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-white/[0.06] pt-10 md:flex-row md:items-center">
          <p className="max-w-md text-3xl leading-tight font-medium tracking-[-0.03em]">
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
      </FadeIn>

      <AnimatePresence>
        {open && <ProjectModal key={open.project.id} selected={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
