"use client";

import Image from "next/image";
import type { Project, ProjectCategory } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Project preview: app screenshots shown inside device frames on a lit backdrop.
 * Add `screenshots` to a project in src/content/site.ts to show real screens;
 * until then each device shows a clearly marked placeholder screen.
 *
 * Flutter (cross-platform) previews pair an iOS-style and an Android-style frame;
 * Kotlin (native Android) previews use Android punch-hole frames only.
 */
export function ProjectVisual({
  project,
  category,
  index = 0,
  priority,
}: {
  project: Project;
  category: ProjectCategory;
  index?: number;
  priority?: boolean;
}) {
  const shots = project.screenshots ?? [];
  const accent = category.accent;
  const second = category.id === "flutter" ? "#4f8bff" : "#5be9ff";
  const cross = category.device === "cross-platform";
  // Alternate which side the secondary device sits on for variety
  const flip = index % 2 === 1;

  const devices = [
    { role: "back", style: "android", shot: shots[1] },
    { role: "front", style: cross ? "ios" : "android", shot: shots[0] },
    { role: "far", style: "android", shot: shots[2] },
  ] as const;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink-2" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(70% 70% at ${flip ? "30%" : "70%"} 30%, ${accent}38, transparent 60%), radial-gradient(60% 60% at ${flip ? "85%" : "15%"} 95%, ${second}2a, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 aspect-square h-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
      />

      {/* Devices */}
      <div className={cn("absolute inset-0 flex items-center justify-center", flip && "flex-row-reverse")}>
        <Device
          variant={devices[0].style}
          shot={devices[0].shot}
          project={project}
          accent={second}
          className={cn(
            "z-0 h-[64%] opacity-80 animate-[float_7s_ease-in-out_infinite]",
            flip ? "-ml-[4%] rotate-[8deg]" : "-mr-[4%] -rotate-[8deg]",
          )}
          priority={priority}
        />
        <Device
          variant={devices[1].style}
          shot={devices[1].shot}
          project={project}
          accent={accent}
          className="z-10 h-[80%] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)]"
          priority={priority}
          primary
        />
        {shots.length > 2 && (
          <Device
            variant={devices[2].style}
            shot={devices[2].shot}
            project={project}
            accent={second}
            className={cn(
              "z-0 h-[64%] opacity-80 animate-[float_8s_ease-in-out_infinite_-3s]",
              flip ? "-mr-[4%] -rotate-[8deg]" : "-ml-[4%] rotate-[8deg]",
            )}
            priority={priority}
          />
        )}
      </div>

      {/* Platform chip */}
      <div
        className={cn(
          "glass absolute top-[7%] hidden items-center gap-2 sm:flex rounded-full px-3 py-1.5 font-mono text-[10px] text-fg/80",
          flip ? "left-[6%]" : "right-[6%]",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        {category.platforms.join(" · ")}
      </div>
    </div>
  );
}

function Device({
  variant,
  shot,
  project,
  accent,
  className,
  primary,
  priority,
}: {
  variant: "ios" | "android";
  shot?: string;
  project: Project;
  accent: string;
  className?: string;
  primary?: boolean;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19] shrink-0 bg-gradient-to-b from-white/25 to-white/5 p-[0.35%]  shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)]",
        variant === "ios" ? "rounded-[14%/6.6%]" : "rounded-[11%/5.2%]",
        className,
      )}
      style={{ padding: "1.6%" }}
    >
      <div
        className={cn(
          "relative h-full overflow-hidden bg-ink",
          variant === "ios" ? "rounded-[12.5%/5.9%]" : "rounded-[9.5%/4.5%]",
        )}
      >
        {shot ? (
          <Image
            src={shot}
            alt={`${project.name} screenshot`}
            fill
            sizes="(min-width: 1024px) 20vw, 40vw"
            className="object-cover object-top"
            priority={priority && primary}
          />
        ) : (
          <PlaceholderScreen project={project} accent={accent} primary={primary} />
        )}

        {/* Camera cut-out */}
        {variant === "ios" ? (
          <span className="absolute top-[2.2%] left-1/2 h-[3.4%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
        ) : (
          <span className="absolute top-[2.2%] left-1/2 aspect-square w-[5.5%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
        )}
      </div>
    </div>
  );
}

/** Neutral app-shell skeleton; deliberately shows no invented features. */
function PlaceholderScreen({ project, accent, primary }: { project: Project; accent: string; primary?: boolean }) {
  const initials = project.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-full flex-col gap-[3.5%] px-[8%] pt-[16%] pb-[7%]">
      <div className="flex items-center gap-[6%]">
        <span
          className="grid aspect-square w-[22%] place-items-center rounded-[28%] font-mono text-[clamp(6px,0.9vw,11px)] font-semibold text-ink"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}66)` }}
        >
          {initials}
        </span>
        <span className="flex-1 space-y-[6%]">
          <span className="block truncate text-[clamp(6px,0.85vw,11px)] font-medium text-fg/90">{project.name}</span>
          <span className="block h-[3px] w-2/3 rounded-full bg-white/15" />
        </span>
      </div>
      <div
        className="aspect-[4/3] w-full rounded-[10%]"
        style={{ background: `linear-gradient(140deg, ${accent}aa, ${accent}1a 70%)` }}
      />
      {[0.85, 0.6, 0.75].map((w, i) => (
        <div key={i} className="flex items-center gap-[6%] rounded-[14%/40%] bg-white/[0.04] p-[5%]">
          <span className="aspect-square w-[14%] shrink-0 rounded-[30%]" style={{ background: `${accent}70` }} />
          <span className="h-[3px] rounded-full bg-white/20" style={{ width: `${w * 70}%` }} />
        </div>
      ))}
      <div className="mt-auto text-center font-mono text-[clamp(5px,0.65vw,9px)] text-dim">
        {primary ? "[add screenshot]" : ""}
      </div>
    </div>
  );
}
