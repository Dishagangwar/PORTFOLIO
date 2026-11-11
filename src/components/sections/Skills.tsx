"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { alsoExploring, skillCategories, site } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Two-letter monogram used as a neutral technology glyph. */
function glyph(name: string) {
  const parts = name.replace(/[^A-Za-z ]/g, " ").trim().split(/\s+/);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).replace(/^./, (c) => c.toUpperCase());
}

// Ring radii as a percentage of the orbit container's half-size
const RINGS = [34, 54, 74, 94];
const DURATIONS = [46, 64, 82, 104];

export function Skills() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <section id="skills" className="relative overflow-hidden py-32 md:py-44">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-x">
        <SectionHeader
          index="02"
          label="Skills & Technologies"
          title="A connected"
          accent="ecosystem."
          description="Every tool here has a role in how I design, build and ship. Hover the orbit or pick a layer to explore it."
        />

        <div className="grid items-center gap-16 lg:grid-cols-12">
          {/* Category selector */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {skillCategories.map((cat, i) => {
                const isActive = active === i;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                      aria-expanded={isActive}
                      className="group flex w-full items-start gap-5 py-6 text-left"
                    >
                      <span className={cn("mt-2 font-mono text-xs transition-colors", isActive ? "text-cyan" : "text-dim")}>
                        0{i + 1}
                      </span>
                      <span className="flex-1">
                        <span
                          className={cn(
                            "block text-2xl font-medium tracking-[-0.03em] transition-colors duration-500 md:text-3xl",
                            isActive ? "text-fg" : "text-fg/35 group-hover:text-fg/70",
                          )}
                        >
                          {cat.title}
                        </span>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.span
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.6, ease: EASE }}
                              className="block overflow-hidden"
                            >
                              <span className="block pt-3 text-muted">{cat.blurb}</span>
                              <span className="flex flex-wrap gap-2 pt-4">
                                {cat.items.map((item) => (
                                  <span
                                    key={item}
                                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[13px] text-fg/85"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "mt-3 h-2 w-2 rounded-full transition-all duration-500",
                          isActive ? "bg-cyan shadow-[0_0_12px_var(--color-cyan)]" : "bg-white/15",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Orbital system */}
          <FadeIn className="order-1 lg:order-2 lg:col-span-7" y={40}>
            <div
              className="relative mx-auto aspect-square w-full max-w-[640px]"
              role="img"
              aria-label="Orbital diagram of technologies grouped by category"
            >
              <div aria-hidden className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgb(139_123_255/0.22),rgb(91_233_255/0.06)_45%,transparent_70%)] blur-xl" />

              {/* Core */}
              <div className="absolute top-1/2 left-1/2 z-10 grid h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#bdf6ff_12%,#5be9ff_35%,#8b7bff_75%,#2a1f6b_100%)] shadow-[0_0_80px_-10px_rgb(91_233_255/0.7),inset_0_-10px_30px_rgb(0_0_0/0.35)]">
                <span className="text-center font-mono text-[clamp(8px,1.4vw,11px)] leading-tight font-semibold text-ink">
                  {site.initials}
                  <br />
                  <span className="font-normal opacity-70">mobile</span>
                </span>
                <span aria-hidden className="absolute inset-0 animate-[pulse-ring_3s_ease-out_infinite] rounded-full border border-cyan/50" />
              </div>

              {skillCategories.map((cat, ci) => {
                const r = RINGS[ci];
                const isActive = active === ci;
                const dur = DURATIONS[ci];
                const dir = ci % 2 === 0 ? "orbit" : "orbit-rev";
                const counter = ci % 2 === 0 ? "orbit-rev" : "orbit";
                return (
                  <div
                    key={cat.id}
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
                    style={{
                      width: `${r}%`,
                      height: `${r}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full border transition-[border-color,box-shadow] duration-700",
                        isActive
                          ? "border-cyan/35 shadow-[0_0_40px_-10px_rgb(91_233_255/0.35),inset_0_0_40px_-10px_rgb(91_233_255/0.2)]"
                          : "border-dashed border-white/[0.08]",
                      )}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        animation: reduce ? "none" : `${dir} ${dur}s linear infinite`,
                        animationPlayState: hovered ? "paused" : "running",
                      }}
                    >
                      {cat.items.map((item, ii) => {
                        const angle = ((ii / cat.items.length) * 360 + ci * 23) * (Math.PI / 180);
                        const isHovered = hovered === item;
                        return (
                          <div
                            key={item}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{
                              left: `${50 + 50 * Math.cos(angle)}%`,
                              top: `${50 + 50 * Math.sin(angle)}%`,
                            }}
                          >
                            <div
                              style={{
                                animation: reduce ? "none" : `${counter} ${dur}s linear infinite`,
                                animationPlayState: hovered ? "paused" : "running",
                              }}
                            >
                              <div
                                onPointerEnter={() => {
                                  setHovered(item);
                                  setActive(ci);
                                }}
                                onPointerLeave={() => setHovered(null)}
                                className={cn(
                                  "pointer-events-auto flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-all duration-500 ease-[var(--ease-expo)] sm:pr-3",
                                  isActive
                                    ? "glass scale-100 opacity-100"
                                    : "scale-90 bg-ink-2/80 opacity-45 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
                                  isHovered && "scale-110 shadow-[0_0_30px_-4px_rgb(91_233_255/0.6)]",
                                )}
                                data-cursor-hover
                              >
                                <span
                                  className={cn(
                                    "grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-semibold transition-colors duration-500 sm:h-8 sm:w-8",
                                    isActive
                                      ? "bg-gradient-to-br from-cyan to-violet text-ink"
                                      : "bg-white/[0.06] text-fg/70",
                                  )}
                                >
                                  {glyph(item)}
                                </span>
                                <span className="hidden text-[12px] whitespace-nowrap text-fg/90 sm:inline">
                                  {item}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>

        <FadeIn className="mt-24 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/[0.06] pt-8">
          <span className="eyebrow">Also working with</span>
          {alsoExploring.map((t) => (
            <span key={t} className="text-fg/70">{t}</span>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
