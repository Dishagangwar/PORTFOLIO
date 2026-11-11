"use client";

import Image from "next/image";
import type { Project } from "@/content/site";

/**
 * Generated, animated previews for each project. Supply `image` on a project in
 * src/content/site.ts to replace these with a real screenshot.
 */
export function ProjectVisual({ project, priority }: { project: Project; priority?: boolean }) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={`${project.name} preview`}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover"
        priority={priority}
      />
    );
  }
  if (project.id === "netguard") return <NetguardVisual />;
  if (project.id === "carelink") return <CareLinkVisual />;
  return <AffirmVisual />;
}

function Backdrop({ from, to }: { from: string; to: string }) {
  return (
    <>
      <div className="absolute inset-0 bg-ink-2" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(80% 70% at 75% 20%, ${from}33, transparent 60%), radial-gradient(60% 60% at 15% 90%, ${to}2e, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    </>
  );
}

/* ─────────── Netguard AI: live network topology with a predicted fault ─────────── */
const NODES = [
  [80, 90], [200, 60], [320, 110], [450, 70], [540, 160],
  [120, 210], [250, 190], [380, 230], [500, 280], [170, 320], [310, 310], [430, 360],
] as const;
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 6], [2, 7], [3, 7], [4, 8],
  [5, 6], [6, 7], [7, 8], [5, 9], [6, 10], [9, 10], [10, 11], [7, 11], [8, 11],
] as const;
const FAULT = 7;

function NetguardVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Backdrop from="#5be9ff" to="#4f8bff" />
      <svg viewBox="0 0 620 420" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="ng-edge" x1="0" x2="1">
            <stop offset="0" stopColor="#5be9ff" stopOpacity="0.15" />
            <stop offset="1" stopColor="#8b7bff" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="ng-fault">
            <stop offset="0" stopColor="#ff5d7a" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ff5d7a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {EDGES.map(([a, b], i) => {
          const [x1, y1] = NODES[a];
          const [x2, y2] = NODES[b];
          const hot = a === FAULT || b === FAULT;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? "#ff5d7a" : "url(#ng-edge)"} strokeOpacity={hot ? 0.45 : 1} strokeWidth="1.2" />
              <circle r="2.2" fill={hot ? "#ff9fb0" : "#bdf6ff"}>
                <animateMotion dur={`${2.4 + (i % 5) * 0.6}s`} repeatCount="indefinite" path={`M${x1},${y1} L${x2},${y2}`} />
              </circle>
            </g>
          );
        })}
        <circle cx={NODES[FAULT][0]} cy={NODES[FAULT][1]} r="46" fill="url(#ng-fault)">
          <animate attributeName="r" values="30;56;30" dur="2.4s" repeatCount="indefinite" />
        </circle>
        {NODES.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={i === FAULT ? 9 : 6} fill="#0b0b10" stroke={i === FAULT ? "#ff5d7a" : "#5be9ff"} strokeWidth="1.5" />
            <circle cx={x} cy={y} r="2.4" fill={i === FAULT ? "#ff5d7a" : "#5be9ff"} />
          </g>
        ))}
      </svg>

      {/* Prediction card */}
      <div className="glass absolute top-[8%] left-[6%] w-[42%] max-w-[240px] rounded-xl p-3.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted">
          <span>FAULT RISK · NODE 08</span>
          <span className="text-[#ff8ea2]">● alert</span>
        </div>
        <svg viewBox="0 0 200 60" className="mt-3 h-auto w-full" aria-hidden>
          <path d="M0 50 L20 46 L40 48 L60 40 L80 42 L100 34 L120 30 L140 22 L160 18 L180 10 L200 6" fill="none" stroke="#ff5d7a" strokeWidth="1.6" strokeDasharray="260" strokeDashoffset="260">
            <animate attributeName="stroke-dashoffset" values="260;0" dur="2.2s" fill="freeze" />
          </path>
          <path d="M0 50 L20 46 L40 48 L60 40 L80 42 L100 34 L120 30 L140 22 L160 18 L180 10 L200 6 L200 60 L0 60Z" fill="#ff5d7a" opacity="0.08" />
        </svg>
        <p className="mt-2 font-mono text-[9.5px] text-dim">[sample visual · not real data]</p>
      </div>

      <div className="glass absolute right-[5%] bottom-[8%] rounded-xl px-3.5 py-2.5 font-mono text-[10px] text-fg/80">
        <span className="text-cyan">XGBoost</span> · predictive maintenance
      </div>
    </div>
  );
}

/* ─────────── CareLink: donor ↔ NGO mobile app ─────────── */
function CareLinkVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Backdrop from="#8b7bff" to="#5be9ff" />
      <div className="absolute inset-0 flex items-center justify-center gap-[4%] px-[6%]">
        {/* Donor phone */}
        <Phone className="h-[74%] -rotate-6" accent="#8b7bff" title="Donate" />
        {/* Link pulse */}
        <div className="relative flex w-[22%] max-w-[200px] items-center" aria-hidden>
          <div className="h-px flex-1 bg-gradient-to-r from-violet/70 via-white/40 to-cyan/70" />
          <span className="absolute h-2 w-2 -translate-x-1/2 animate-[travel_2.6s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_12px_white]" />
          <span className="absolute top-1/2 left-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15),0_0_30px_-4px_rgb(139_123_255/0.8)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-fg" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 5 6.6 5c2 0 3.4 1.1 4.2 2.3h2.4C14 6.1 15.4 5 17.4 5 21 5 23.1 8.5 21.6 11.8 19.5 16.4 12 21 12 21z" /></svg>
          </span>
        </div>
        {/* NGO phone */}
        <Phone className="h-[74%] rotate-6" accent="#5be9ff" title="NGO" />
      </div>
      <div className="glass absolute top-[8%] right-[6%] rounded-full px-3 py-1.5 font-mono text-[10px] text-fg/80">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        Firebase Realtime · synced
      </div>
    </div>
  );
}

function Phone({ className, accent, title }: { className?: string; accent: string; title: string }) {
  return (
    <div className={`relative aspect-[9/18] shrink-0 rounded-[1.6rem] bg-gradient-to-b from-white/20 to-white/5 p-[4px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] ${className}`}>
      <div className="relative h-full overflow-hidden rounded-[1.4rem] bg-ink">
        <div className="mx-auto mt-1.5 h-3 w-10 rounded-full bg-black" />
        <div className="space-y-2 p-2.5">
          <div className="font-mono text-[8px] text-muted">{title}</div>
          <div className="aspect-[5/3] rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}aa, ${accent}22)` }} />
          {[0.9, 0.7, 0.8].map((w, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-md bg-white/[0.04] p-1.5">
              <span className="h-3.5 w-3.5 shrink-0 rounded" style={{ background: `${accent}88` }} />
              <span className="h-1 rounded-full bg-white/20" style={{ width: `${w * 70}%` }} />
            </div>
          ))}
          <div className="mt-2 rounded-full py-1.5 text-center text-[8px] font-semibold text-ink" style={{ background: accent }}>
            {title === "NGO" ? "Request" : "Give now"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Affirm: abstract typographic placeholder ─────────── */
function AffirmVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Backdrop from="#4f8bff" to="#8b7bff" />
      <div aria-hidden className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,#5be9ff,#8b7bff,#4f8bff,#5be9ff)] opacity-30 blur-3xl" style={{ animation: "orbit 18s linear infinite" }} />
      <div aria-hidden className="absolute top-1/2 left-1/2 aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" style={{ animation: "orbit 30s linear infinite" }}>
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_14px_var(--color-cyan)]" />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-serif text-[clamp(3rem,9vw,7.5rem)] leading-none text-fg/90 italic">Affirm</span>
      </div>
      <div className="glass absolute bottom-[8%] left-1/2 -translate-x-1/2 rounded-full px-4 py-2 font-mono text-[10px] text-muted">
        [Replace with a screenshot: set <span className="text-cyan">image</span> in site.ts]
      </div>
    </div>
  );
}
