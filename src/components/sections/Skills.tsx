import { alsoExploring, skillCategories } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SlideIn } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";

function Chip({ children }: { children: string }) {
  return (
    <li className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-sm text-fg/85 transition-[transform,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-cyan hover:text-cyan">
      {children}
    </li>
  );
}

export function Skills() {
  return (
    <section id="skills" data-drive="skills" className="relative flex min-h-[110svh] items-center py-32">
      <div className="container-x">
        <Panel side="left" title="toolkit.yaml" className="w-full lg:w-[min(560px,44vw)]">
          <div className="p-6 md:p-10">
            <SectionHeader size="md" index="02" label="Skills & Technologies" title="A connected" accent="ecosystem." />
            <div className="space-y-7">
              {skillCategories.map((cat, i) => (
                <SlideIn key={cat.id} delay={i * 0.06}>
                  <h3 className="font-medium tracking-[-0.02em]">
                    <span className="mr-3 font-mono text-xs text-cyan">0{i + 1}</span>
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm text-fg/55">{cat.blurb}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {cat.items.map((item) => (
                      <Chip key={item}>{item}</Chip>
                    ))}
                  </ul>
                </SlideIn>
              ))}
            </div>
            <p className="mt-8 border-t border-white/[0.08] pt-5 text-sm text-fg/60">
              Also working with {alsoExploring.join(", ")}.
            </p>
          </div>
        </Panel>
      </div>
    </section>
  );
}
