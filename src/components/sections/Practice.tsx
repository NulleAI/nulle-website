import { Demonstration } from "@/components/practice/Demonstration";
import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Section 04. The site's one interactive moment. */
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
            Three everyday situations, and what changes when intelligent software takes on the
            routine. Choose one, then change what happens.
          </p>
        </div>

        <div className="mt-14 md:mt-20" data-reveal>
          <Demonstration />
        </div>
      </div>
    </section>
  );
}
