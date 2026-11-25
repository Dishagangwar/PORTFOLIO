import { about } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SlideIn } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";

export function About() {
  return (
    <section id="about" data-drive="about" className="relative flex min-h-[110svh] items-center py-32">
      <div className="container-x">
        <Panel side="right" title="about.dart" className="w-full lg:ml-auto lg:w-[min(600px,46vw)]">
          <div className="p-6 md:p-10">
            <SectionHeader size="md" index="01" label="About" title="Engineering with" accent="intention." />
            <p className="text-lg leading-snug font-medium tracking-[-0.015em] text-fg">{about.lead}</p>
            <div className="mt-5 space-y-4 leading-relaxed text-fg/65">
              {about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {about.principles.map((p, i) => (
                <SlideIn
                  as="li"
                  key={p.title}
                  delay={i * 0.08}
                  className="rounded-2xl bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
                >
                  <h3 className="text-[15px] font-medium tracking-[-0.02em] text-cyan">{p.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-fg/60">{p.body}</p>
                </SlideIn>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </section>
  );
}
