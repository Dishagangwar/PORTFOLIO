import { SplitReveal, FadeIn } from "./Reveal";

/** Consistent section opener: index, label, rule and a large split headline. */
export function SectionHeader({
  index,
  label,
  title,
  accent,
  description,
}: {
  index: string;
  label: string;
  title: string;
  accent?: string;
  description?: string;
}) {
  return (
    <header className="mb-16 md:mb-24">
      <FadeIn className="mb-8 flex items-center gap-4">
        <span className="font-mono text-xs text-cyan">{index}</span>
        <span className="h-px w-12 bg-gradient-to-r from-cyan/70 to-transparent" />
        <span className="eyebrow">{label}</span>
      </FadeIn>
      <h2 className="max-w-5xl text-[clamp(2.4rem,6.5vw,6rem)] leading-[0.95] font-medium tracking-[-0.045em]">
        <SplitReveal text={title} />
        {accent && (
          <>
            {" "}
            <SplitReveal
              text={accent}
              delay={0.15}
              className="font-serif font-normal italic tracking-[-0.02em]"
              wordClassName="pr-[0.04em] text-accent-gradient"
            />
          </>
        )}
      </h2>
      {description && (
        <FadeIn delay={0.2} className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          <p>{description}</p>
        </FadeIn>
      )}
    </header>
  );
}
