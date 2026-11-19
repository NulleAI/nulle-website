import { Demonstration } from "@/components/practice/Demonstration";
import { Arrow } from "@/components/ui/Arrow";
import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Section 04. Four everyday examples, then the question they raise. */
export function Practice() {
  return (
    <section id="practice" data-header-theme="dark" className="theme-dark">
      <div className="shell section-y">
        <SectionLabel index="04">Intelligence in Practice</SectionLabel>

        <div className="mt-10 grid gap-x-6 gap-y-10 md:mt-14 md:grid-cols-12 md:items-end">
          <h2 className="display md:col-span-7">
            <Lines lines={["See what’s", "possible."]} />
          </h2>
          <p className="max-w-[40ch] text-fg-soft md:col-span-5 lg:col-span-4 lg:col-start-9" data-reveal>
            Four everyday examples of what changes when intelligent software takes on the work. Choose
            one to see it happen.
          </p>
        </div>

        <div className="mt-14 md:mt-20" data-reveal>
          <Demonstration />
        </div>

        <div className="mt-20 grid gap-x-6 gap-y-8 border-t border-line pt-12 md:mt-28 md:grid-cols-12 md:pt-16">
          <h3 className="title md:col-span-7 md:max-w-[16ch]" data-reveal>
            Imagine what this could do for your business.
          </h3>
          <div className="md:col-span-5 lg:col-span-4 lg:col-start-9" data-reveal>
            <p className="text-fg-soft">
              Every business works differently. We’ll help you identify where intelligent technology
              can make the biggest difference.
            </p>
            <a href="#contact" className="btn btn-primary mt-8">
              Explore a Solution
              <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
