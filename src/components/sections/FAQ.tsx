import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { faq } from "@/lib/faq";
import { company, engagement } from "@/lib/site";

const facts = [
  { value: company.foundingYear, label: "Founded" },
  { value: "Atlanta", label: "Based in Atlanta, Georgia" },
  { value: "Southeast", label: "Working across Atlanta and the Southeast" },
  { value: `${engagement.consultationMinutes} min`, label: "Free first consultation" },
] as const;

/**
 * Section 08. The plain facts and the questions people ask, answered in
 * full sentences. Every answer is visible: nothing to open or click, so
 * people, search engines, and AI assistants all read the same text. The
 * FAQPage structured data repeats it word for word.
 */
export function FAQ() {
  return (
    <section id="faq" data-header-theme="stone" className="theme-stone">
      <div className="shell section-y">
        <SectionLabel index="08">Questions</SectionLabel>
        <h2 className="display mt-10 md:mt-14">
          <Lines lines={["Questions,", "answered."]} />
        </h2>

        <dl className="mt-16 grid grid-cols-2 border-t border-line md:mt-24 md:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="border-b border-line py-7 pr-6 md:border-b-0 md:py-9" data-reveal>
              <dt className="title">{fact.value}</dt>
              <dd className="mt-3 max-w-[22ch] text-[0.9375rem] leading-snug text-fg-mute">{fact.label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 md:mt-20">
          {faq.map((item) => (
            <div
              key={item.question}
              className="grid gap-x-6 gap-y-4 border-t border-line py-8 last:border-b md:grid-cols-12 md:py-10"
              data-reveal
            >
              <h3 className="text-[1.375rem] font-medium leading-tight tracking-[-0.025em] md:col-span-5 lg:col-span-4">
                {item.question}
              </h3>
              <p className="max-w-[62ch] text-fg-soft md:col-span-7 lg:col-span-7 lg:col-start-6">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
