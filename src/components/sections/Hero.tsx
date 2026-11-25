"use client";

import { motion, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import { useIntro } from "@/components/providers/IntroProvider";
import { SplitReveal } from "@/components/ui/Reveal";
import { FlipWord } from "@/components/ui/FlipWord";
import { Button, ArrowIcon } from "@/components/ui/Button";
import { scrollToId } from "@/lib/scroll";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const { ready } = useIntro();
  const reduce = useReducedMotion();

  const show = (delay: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : -36 },
    animate: ready ? { opacity: 1, x: 0 } : {},
    transition: { duration: 1, ease: EASE, delay },
  });

  return (
    <section id="home" data-drive="home" className="relative isolate flex min-h-[100svh] flex-col">
      {/* Keeps the copy readable where it overlaps the scene */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -bottom-[35svh] -z-10 max-lg:bg-[linear-gradient(to_bottom,transparent_25%,rgb(5_5_7/0.65)_42%,rgb(5_5_7/0.92)_60%,transparent)] lg:bottom-0 lg:[mask-image:linear-gradient(black_60%,transparent)] lg:bg-[linear-gradient(90deg,rgb(3_3_12/0.78),rgb(3_3_12/0.35)_42%,transparent_62%)]" />

      <div className="container-x relative flex flex-1 flex-col justify-end pt-32 pb-28 lg:justify-center lg:pb-24">
        <motion.p {...show(0.1)} className="mb-5 font-mono text-xs text-cyan sm:text-sm">
          {site.role}
        </motion.p>

        <p className="text-[clamp(1.1rem,1.8vw,1.5rem)] text-fg/85">
          <SplitReveal text="Hi, I'm" animate={ready} delay={0.15} />{" "}
          <SplitReveal
            text={site.name}
            animate={ready}
            delay={0.2}
            className="font-serif text-[1.25em] italic"
            wordClassName="pr-[0.06em] text-accent-gradient"
          />
        </p>

        <h1 className="mt-3 max-w-[12ch] text-[clamp(2.6rem,5.8vw,6rem)] leading-[0.94] font-medium tracking-[-0.05em]">
          <SplitReveal text="Building Digital Experiences That Feel" animate={ready} delay={0.3} stagger={0.06} />{" "}
          <SplitReveal
            text="Different."
            animate={ready}
            delay={0.65}
            className="font-serif font-normal italic tracking-[-0.03em]"
            wordClassName="pr-[0.06em] text-accent-gradient"
          />
        </h1>

        <motion.p {...show(0.8)} className="mt-6 text-lg text-fg/90">
          I build mobile apps with <FlipWord words={site.flipWords} className="text-cyan" />
        </motion.p>

        <motion.p {...show(0.9)} className="mt-3 max-w-md leading-relaxed text-fg/65">
          {site.intro}
        </motion.p>

        <motion.div {...show(1)} className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
          <Button onClick={() => scrollToId("projects")} icon={<ArrowIcon />}>
            Explore My Work
          </Button>
          <Button variant="ghost" onClick={() => scrollToId("contact")}>
            Let&apos;s Connect
          </Button>
        </motion.div>
      </div>

      <motion.div {...show(1.15)} className="container-x absolute inset-x-0 bottom-8 flex items-center gap-10">
        <button
          type="button"
          onClick={() => scrollToId("about")}
          className="group flex items-center gap-3 text-xs text-muted transition-colors hover:text-fg"
          aria-label="Scroll to About section"
        >
          <span className="relative flex h-10 w-6 justify-center rounded-full border border-white/25 pt-2">
            <span className="h-2 w-[2px] animate-[scroll-dot_1.8s_var(--ease-expo)_infinite] rounded-full bg-cyan" />
          </span>
          <span className="font-mono text-[11px]">Scroll to drive</span>
        </button>
        <p className="hidden text-xs text-fg/55 md:block">
          {site.location} <span className="mx-2 text-white/25">/</span> {site.availability}
        </p>
      </motion.div>
    </section>
  );
}
