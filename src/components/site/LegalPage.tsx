import { Footer } from "./Footer";
import { Header } from "./Header";
import { Logo } from "./Logo";

type LegalPageProps = {
  label: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: React.ReactNode }[];
};

/** Shared layout for the privacy notice and terms. */
export function LegalPage({ label, title, updated, intro, sections }: LegalPageProps) {
  return (
    <>
      <Header logo={<Logo priority />} />
      <main data-header-theme="light" className="theme-light">
        <div className="shell pb-[clamp(5rem,10vw,9rem)] pt-[clamp(8rem,14vw,12rem)]">
          <p className="label flex items-center gap-3">
            <span>{label}</span>
            <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
            <span>Updated {updated}</span>
          </p>
          <h1 className="display mt-10">{title}</h1>

          <div className="mt-16 grid gap-x-6 md:mt-24 md:grid-cols-12">
            <p className="lead md:col-span-10 lg:col-span-7">{intro}</p>
          </div>

          <div className="mt-16 md:mt-24">
            {sections.map((section) => (
              <section
                key={section.heading}
                className="grid gap-x-6 gap-y-4 border-t border-line py-9 md:grid-cols-12 md:py-12"
              >
                <h2 className="text-[1.375rem] font-medium leading-tight tracking-[-0.025em] md:col-span-4">
                  {section.heading}
                </h2>
                <div className="max-w-[62ch] space-y-4 text-fg-soft md:col-span-8 lg:col-span-7 lg:col-start-6">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
