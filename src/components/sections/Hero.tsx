"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { site } from "@/content/site";
import { useIntro } from "@/components/providers/IntroProvider";
import { SplitReveal } from "@/components/ui/Reveal";
import { Button, ArrowIcon } from "@/components/ui/Button";
import { scrollToId } from "@/lib/scroll";
import { PhotoBackdrop } from "@/components/visuals/PhotoBackdrop";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => null,
});

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const { ready } = useIntro();
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [sceneMounted, setSceneMounted] = useState(false);

  // Pause the WebGL loop when the hero is offscreen
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Defer the 3D bundle until the browser is idle so text paints first
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const start = () => setSceneMounted(true);
    if (w.requestIdleCallback) {
      w.requestIdleCallback(start, { timeout: 1200 });
    } else {
      const t = setTimeout(start, 300);
      return () => clearTimeout(t);
    }
  }, []);

  // Mouse-following spotlight on the backdrop
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = section.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 220]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.85]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
  const hasBg = !!site.heroBackground;

  const show = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.1, ease: EASE, delay },
  });

  return (
    <section
      id="home"
      ref={section}
      onPointerMove={onPointerMove}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
      style={{ ["--mx" as string]: "70%", ["--my" as string]: "40%" }}
    >
      {/* Backdrop: glows, grid, spotlight */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {!hasBg && (
          <div className="absolute top-[-20%] right-[-10%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgb(139_123_255/0.16),transparent_60%)]" />
        )}
        <div className="absolute bottom-[-30%] left-[-20%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgb(91_233_255/0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(500px_circle_at_var(--mx)_var(--my),rgb(91_233_255/0.09),transparent_60%)] transition-[background] duration-200" />
      </div>

      {/* Background photo: the exact same backdrop as the About section */}
      {hasBg && (
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-[6]"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 1.8, ease: EASE }}
        >
          <PhotoBackdrop src={site.heroBackground} y={bgY} priority />
        </motion.div>
      )}

      {/* 3D scene */}
      <motion.div
        aria-hidden
        style={{ y: sceneY, scale: sceneScale }}
        className="absolute inset-0 -z-[5]"
      >
        {/* CSS fallback orb shown until WebGL is ready (and for no-WebGL browsers) */}
        {!hasBg && <div className="absolute top-[30%] left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(91_233_255/0.5),rgb(139_123_255/0.35)_45%,transparent_70%)] blur-2xl lg:top-1/2 lg:left-[70%] lg:h-80 lg:w-80" />}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: sceneMounted && ready ? 1 : 0 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
        >
          {sceneMounted && <HeroScene active={inView} particlesOnly={hasBg} />}
        </motion.div>
      </motion.div>

      {/* Readability scrim for small screens */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-[4] h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent lg:hidden" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x relative flex flex-1 flex-col justify-end pt-32 pb-28 lg:justify-center lg:pb-24"
      >
        <motion.div {...show(0.1)} className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 sm:mb-7">
          <span className="text-[clamp(1rem,1.6vw,1.25rem)] text-fg/90">
            Hi, I&apos;m <span className="font-serif text-[1.25em] italic text-accent-gradient">{site.name}</span>
          </span>
          <span className="hidden h-px w-10 bg-white/20 sm:block" />
          <span className="eyebrow !text-cyan/90">{site.role}</span>
        </motion.div>

        <h1 className="max-w-[13ch] text-[clamp(2.7rem,8.6vw,8.6rem)] leading-[0.9] font-medium tracking-[-0.055em] lg:max-w-[11ch]">
          <SplitReveal text="Building Digital Experiences That Feel" animate={ready} delay={0.15} stagger={0.06} wave={0.55} wordClassName="text-gradient-flow" />{" "}
          <SplitReveal
            text="Different."
            animate={ready}
            delay={0.5}
            swash
            className="font-serif font-normal italic tracking-[-0.03em]"
            wordClassName="pr-[0.06em] text-accent-flow"
          />
        </h1>

        <motion.p
          {...show(0.75)}
          className="mt-6 max-w-md text-[1rem] leading-relaxed text-muted sm:mt-8 md:text-lg"
        >
          {site.intro}
        </motion.p>

        <motion.div {...show(0.9)} className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
          <Button onClick={() => scrollToId("projects")} icon={<ArrowIcon />}>
            Explore My Work
          </Button>
          <Button variant="ghost" onClick={() => scrollToId("contact")}>
            Let&apos;s Connect
          </Button>
        </motion.div>
      </motion.div>

      {/* Footer row: scroll cue + meta */}
      <motion.div
        {...show(1.1)}
        className="container-x absolute inset-x-0 bottom-8 flex items-end justify-between"
      >
        <button
          type="button"
          onClick={() => scrollToId("about")}
          className="group flex items-center gap-3 text-xs text-muted transition-colors hover:text-fg"
          aria-label="Scroll to About section"
        >
          <span className="relative flex h-10 w-6 justify-center rounded-full border border-white/20 pt-2">
            <span className="h-2 w-[2px] animate-[scroll-dot_1.8s_var(--ease-expo)_infinite] rounded-full bg-cyan" />
          </span>
          <span className="eyebrow hidden sm:inline">Scroll to explore</span>
        </button>
        <div className="hidden text-right md:block">
          <p className="eyebrow">{site.location}</p>
          <p className="mt-1 text-xs text-dim">{site.availability}</p>
        </div>
      </motion.div>
    </section>
  );
}
