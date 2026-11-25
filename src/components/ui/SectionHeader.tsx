import { SplitReveal } from "./Reveal";

/** Consistent section opener: index, label and a split headline. */
export function SectionHeader({
  index,
  label,
  title,
  accent,
  description,
  size = "lg",
}: {
  index: string;
  label: string;
  title: string;
  accent?: string;
  description?: string;
  /** "md" sits inside a Panel, "lg" stands alone over the road. */
  size?: "lg" | "md";
}) {
  return (
    <header className={size === "md" ? "mb-8" : ""}>
      <p className="mb-4 font-mono text-xs text-cyan">
        {"// "}
        {index} <span className="text-muted">{label}</span>
      </p>
      <h2
        className={
          size === "md"
            ? "text-[clamp(2rem,3.6vw,3.2rem)] leading-[1] font-medium tracking-[-0.04em]"
            : "text-[clamp(2.4rem,5.6vw,5.2rem)] leading-[0.95] font-medium tracking-[-0.045em] [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]"
        }
      >
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
      {description && <p className="mt-6 max-w-xl leading-relaxed text-fg/75">{description}</p>}
    </header>
  );
}
