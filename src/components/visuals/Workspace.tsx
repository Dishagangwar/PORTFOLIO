"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { TiltCard } from "@/components/ui/TiltCard";

const CODE = `@injectable
class ProjectsBloc extends Bloc<ProjectsEvent, ProjectsState> {
  ProjectsBloc(this._repository) : super(const ProjectsState.initial()) {
    on<ProjectsRequested>(_onRequested);
  }

  final ProjectsRepository _repository;

  Future<void> _onRequested(
    ProjectsRequested event,
    Emitter<ProjectsState> emit,
  ) async {
    emit(const ProjectsState.loading());
    final result = await _repository.fetchAll();
    result.fold(
      (failure) => emit(ProjectsState.error(failure.message)),
      (projects) => emit(ProjectsState.loaded(projects)),
    );
  }
}`;

type Token = { text: string; cls: string };

const KEYWORDS = new Set([
  "class", "extends", "final", "const", "async", "await", "this", "super", "on", "void",
]);

function tokenize(src: string): Token[] {
  const re = /(@\w+)|(\b[A-Z]\w*\b)|(\b[a-z_]\w*\b)|(\s+)|([^\w\s])/g;
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [t, ann, type, word] = m;
    let cls = "text-fg/70";
    if (ann) cls = "text-amber-300/90";
    else if (type) cls = "text-cyan";
    else if (word && KEYWORDS.has(word)) cls = "text-violet";
    else if (word && /^_/.test(word)) cls = "text-fg/90";
    else if (word) cls = "text-[#c6d0ff]";
    else if (/[(){}<>]/.test(t)) cls = "text-fg/40";
    out.push({ text: t, cls });
  }
  return out;
}

/** Animated developer workspace: a code editor typing a BLoC, a phone preview and floating tags. */
export function Workspace() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();
  const tokens = useMemo(() => tokenize(CODE), []);
  const [count, setCount] = useState(0);
  const shown = reduce ? CODE.length : count;

  useEffect(() => {
    if (!inView || reduce) return;
    let n = 0;
    const id = setInterval(() => {
      n += 3;
      setCount(Math.min(n, CODE.length));
      if (n >= CODE.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);
  const chipY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 90, reduce ? 0 : -90]);

  // Render tokens up to `shown` characters
  let remaining = shown;
  const rendered = [];
  for (let i = 0; i < tokens.length && remaining > 0; i++) {
    const t = tokens[i];
    const text = t.text.slice(0, remaining);
    remaining -= text.length;
    rendered.push(
      <span key={i} className={t.cls}>
        {text}
      </span>,
    );
  }
  const lines = CODE.slice(0, shown).split("\n").length;

  return (
    <div ref={ref} aria-label="Illustration of a code editor and phone preview" role="img" className="relative mx-auto h-[600px] w-full max-w-[520px] sm:h-[640px]">
      <div aria-hidden className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgb(91_233_255/0.18),rgb(139_123_255/0.12)_40%,transparent_70%)] blur-2xl" />

      <TiltCard className="absolute top-0 left-0 w-[92%] rounded-2xl" max={6}>
        <div className="glass overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
            <span className="ml-3 font-mono text-[11px] text-dim">lib/features/projects/bloc/projects_bloc.dart</span>
          </div>
          <div className="flex font-mono text-[10.5px] leading-[1.7] sm:text-[11.5px]">
            <div aria-hidden className="select-none py-4 pr-3 pl-4 text-right text-dim/60">
              {Array.from({ length: 21 }, (_, i) => (
                <div key={i} className={i < lines ? "" : "opacity-0"}>{i + 1}</div>
              ))}
            </div>
            <pre className="min-w-0 flex-1 overflow-hidden py-4 pr-4 whitespace-pre">
              <code>
                {rendered}
                <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-[caret_1s_steps(1)_infinite] bg-cyan" />
              </code>
            </pre>
          </div>
        </div>
      </TiltCard>

      {/* Phone preview */}
      <motion.div style={{ y: phoneY }} className="absolute right-0 bottom-0 w-[42%]">
        <div className="relative aspect-[9/19] rounded-[2rem] bg-gradient-to-b from-white/15 to-white/5 p-[5px] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9),0_0_60px_-20px_rgb(91_233_255/0.4)]">
          <div className="relative h-full overflow-hidden rounded-[1.7rem] bg-ink-2">
            <div className="mx-auto mt-2 h-4 w-16 rounded-full bg-black" />
            <div className="space-y-2.5 p-3">
              <div className="h-2 w-1/2 rounded-full bg-white/20" />
              <div className="h-1.5 w-3/4 rounded-full bg-white/10" />
              <div className="mt-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-cyan/50 via-blue/40 to-violet/60" />
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.04] p-2"
                >
                  <span className="h-5 w-5 shrink-0 rounded-md bg-gradient-to-br from-cyan/60 to-violet/60" />
                  <span className="flex-1 space-y-1">
                    <span className="block h-1.5 w-4/5 rounded-full bg-white/20" />
                    <span className="block h-1.5 w-1/2 rounded-full bg-white/10" />
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="absolute inset-x-3 bottom-3 flex justify-around rounded-full bg-white/[0.05] py-2">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-cyan" : "bg-white/25"}`} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating architecture tags */}
      <motion.div style={{ y: chipY }} aria-hidden className="absolute bottom-0 left-0 flex flex-col items-start gap-2">
        {["Clean Architecture", "BLoC · MVVM", "GetIt + Injectable"].map((t, i) => (
          <span
            key={t}
            className="glass rounded-full px-3 py-1.5 font-mono text-[10.5px] text-fg/80"
            style={{ marginLeft: i * 18 }}
          >
            <span className="mr-2 text-cyan">◆</span>
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
