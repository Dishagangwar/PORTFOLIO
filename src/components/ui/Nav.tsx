"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navItems, site, type SectionId } from "@/content/site";
import { scrollToId, lockScroll } from "@/lib/scroll";
import { useIntro } from "@/components/providers/IntroProvider";
import { cn } from "@/lib/cn";
import { Magnetic } from "./Magnetic";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const { ready } = useIntro();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<SectionId>("home");
  const [open, setOpen] = useState(false);

  // Blurred background once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    const els = navItems
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as SectionId);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // Let the menu close (and scroll unlock) before scrolling
    setTimeout(() => scrollToId(id), open ? 350 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: EASE, delay: ready && !scrolled ? 0.6 : 0 }}
        className="fixed inset-x-0 top-0 z-50 pt-4"
      >
        <nav
          aria-label="Primary"
          className={cn(
            "mx-auto flex max-w-[1440px] items-center justify-between gap-4 rounded-full px-[var(--gutter)] transition-all duration-700 ease-[var(--ease-expo)]",
          )}
        >
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              go("home");
            }}
            className={cn(
              "group flex items-center gap-3 rounded-full p-1 pr-1 transition-[background-color,box-shadow] duration-700 sm:pr-5",
              scrolled
                ? "bg-ink-2/60 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] backdrop-blur-xl"
                : "",
            )}
            aria-label={`${site.name}, back to top`}
          >
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan/90 to-violet/90 font-mono text-[11px] font-semibold text-ink">
              {site.initials}
              <span className="absolute inset-0 rounded-full bg-cyan/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <span className="hidden text-sm font-medium tracking-tight sm:block">{site.name}</span>
          </a>

          <div
            className={cn(
              "hidden items-center rounded-full p-1.5 transition-[background-color,box-shadow,backdrop-filter] duration-700 md:flex",
              // A hero photo can put bright areas behind the links, so keep the glass on from the start
              scrolled || site.heroBackground
                ? "bg-ink-2/60 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl"
                : "bg-transparent",
            )}
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.id);
                }}
                aria-current={active === item.id ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[13px] transition-colors duration-300",
                  active === item.id ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {active === item.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Magnetic className="hidden md:block">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  go("contact");
                }}
                className="flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-[13px] font-medium text-ink transition-shadow duration-500 hover:shadow-[0_0_30px_-4px_rgb(91_233_255/0.7)]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Available
              </a>
            </Magnetic>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "relative grid h-11 w-11 place-items-center rounded-full transition-colors md:hidden",
                scrolled || open
                  ? "bg-ink-2/70 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)] backdrop-blur-xl"
                  : "",
              )}
            >
              <span
                className={cn(
                  "absolute h-px w-5 bg-fg transition-transform duration-500 ease-[var(--ease-expo)]",
                  open ? "rotate-45" : "-translate-y-1",
                )}
              />
              <span
                className={cn(
                  "absolute h-px w-5 bg-fg transition-transform duration-500 ease-[var(--ease-expo)]",
                  open ? "-rotate-45" : "translate-y-1",
                )}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink/95 px-[var(--gutter)] pt-28 pb-10 backdrop-blur-2xl md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.6rem) 2.6rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-1">
              {navItems.map((item, i) => (
                <li key={item.id} className="overflow-hidden">
                  <motion.a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(item.id);
                    }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.05 }}
                    className={cn(
                      "flex items-baseline gap-4 py-1 text-5xl font-medium tracking-[-0.04em]",
                      active === item.id ? "text-fg" : "text-muted",
                    )}
                  >
                    <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
            >
              <a href={site.socials.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
