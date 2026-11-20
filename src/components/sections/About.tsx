import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";

const principles = [
  {
    term: "Strategy",
    detail: "We start with how your business works, not with the technology.",
  },
  {
    term: "Engineering",
    detail: "We build carefully, so what we make keeps working as you grow.",
  },
  {
    term: "Design",
    detail: "If it isn’t simple to use, it isn’t finished.",
  },
] as const;

/** Section 06. No history, headcount, or client names: only what Nulle does and how. */
export function About() {
  return (
    <section id="about" data-header-theme="stone" className="theme-stone">
      <div className="shell section-y">
        <SectionLabel index="06">About Nulle</SectionLabel>
        <h2 className="display mt-10 md:mt-14">
          <Lines lines={["Built for", "what’s next."]} />
        </h2>

        <div className="mt-16 grid gap-x-6 gap-y-16 md:mt-28 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="lead" data-reveal>
              Nulle is a technology company with one focus: making advanced intelligence useful in
              the real world.
            </p>
            <p className="mt-8 max-w-[48ch] text-fg-soft" data-reveal>
              We bring together strategic thinking, technical engineering, and a deep appreciation
              for thoughtful design. That means understanding a business before choosing its
              technology, and caring as much about how something feels to use as how it is built.
            </p>
          </div>

          <dl className="md:col-span-6 lg:col-span-5 lg:col-start-8">
            {principles.map((principle) => (
              <div
                key={principle.term}
                className="grid grid-cols-[7.5rem_1fr] gap-x-6 border-t border-line py-6 last:border-b sm:grid-cols-[9rem_1fr]"
                data-reveal
              >
                <dt className="label pt-[0.45em]">{principle.term}</dt>
                <dd className="text-fg-soft">{principle.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
