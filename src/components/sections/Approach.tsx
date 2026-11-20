import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";

const steps = [
  {
    index: "01",
    title: "Discover",
    body: "We learn how your business works, understand its challenges, and identify opportunities.",
  },
  {
    index: "02",
    title: "Design",
    body: "We create a practical strategy and engineer the right solution around your needs.",
  },
  {
    index: "03",
    title: "Build",
    body: "We develop, integrate, and deploy intelligent technology that works within your business.",
  },
  {
    index: "04",
    title: "Evolve",
    body: "We refine and improve solutions as your organization grows and its requirements change.",
  },
] as const;

/** Section 05. Four steps on one drawn line. */
export function Approach() {
  return (
    <section id="approach" data-header-theme="light" className="theme-light">
      <div className="shell section-y">
        <SectionLabel index="05">Our Approach</SectionLabel>
        <h2 className="display mt-10 md:mt-14">
          <Lines lines={["From possibility", "to reality."]} />
        </h2>

        <div className="relative mt-16 md:mt-28">
          {/* The line: horizontal on wide screens, vertical on narrow ones. */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-[5px] hidden h-px w-full bg-line-strong md:block"
            data-reveal-rule
          />
          <div
            aria-hidden="true"
            className="absolute bottom-2 left-[5px] top-2 w-px bg-line-strong md:hidden"
          />

          <ol className="grid gap-y-12 md:grid-cols-4 md:gap-x-6">
            {steps.map((step) => (
              <li key={step.index} className="relative pl-9 md:pl-0 md:pr-6" data-reveal>
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[0.35rem] block size-[11px] rounded-full bg-fg md:static md:top-auto"
                />
                <p className="label md:mt-9">{step.index}</p>
                <h3 className="title mt-4">{step.title}</h3>
                <p className="mt-4 max-w-[30ch] text-fg-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
