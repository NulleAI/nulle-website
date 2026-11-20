import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/site/Logo";
import { Arrow } from "@/components/ui/Arrow";
import { Lines } from "@/components/ui/Lines";
import { beliefs, facts, founders } from "@/lib/founders";

export const metadata: Metadata = {
  title: "Founders",
  description:
    "Jerry Cox and Rahiem Klugh, co-founders of Nulle: two software engineers with 30 years of combined experience building enterprise software, based in Atlanta.",
  alternates: { canonical: "/founders" },
};

/** The founders in full: who they are, what they lead, and what they believe. */
export default function FoundersPage() {
  return (
    <>
      <a href="#main" className="btn btn-primary btn-sm skip-link">
        Skip to content
      </a>
      <Header logo={<Logo priority />} />
      <main id="main">
        {/* Introduction */}
        <section data-header-theme="light" className="theme-light">
          <div className="shell pb-[clamp(4rem,9vw,8rem)] pt-[clamp(8rem,14vw,12rem)]">
            <p className="label">Founders</p>
            <h1 className="display mt-10 md:mt-14">
              <Lines lines={["Built by two.", "For everyone who builds."]} />
            </h1>
            <div className="mt-12 grid gap-x-6 md:mt-20 md:grid-cols-12">
              <p className="lead md:col-span-9 lg:col-span-7" data-reveal>
                Two software engineers with 30 years of combined experience building enterprise
                software. No committee and no venture play. Just two people who saw a problem, shared a
                conviction, and decided to do something about it.
              </p>
            </div>

            <dl className="mt-16 grid grid-cols-2 border-t border-line md:mt-24 md:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.value} className="border-b border-line py-7 pr-6 md:border-b-0 md:py-9" data-reveal>
                  <dt className="title">{fact.value}</dt>
                  <dd className="mt-3 max-w-[22ch] text-[0.9375rem] leading-snug text-fg-mute">{fact.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* In their words */}
        <section data-header-theme="stone" className="theme-stone">
          <div className="shell py-[clamp(5rem,10vw,9rem)]">
            <figure className="max-w-[58rem]" data-reveal>
              <blockquote className="text-[clamp(1.75rem,3.4vw,3.25rem)] font-medium leading-[1.12] tracking-[-0.035em]">
                “Intelligence should belong to the people using it — not the platforms selling it.
                Everything we’re building at Nulle comes from that one idea.”
              </blockquote>
              <figcaption className="label mt-8">Jerry Cox &amp; Rahiem Klugh · Co-founders</figcaption>
            </figure>
          </div>
        </section>

        {/* The founders */}
        <section data-header-theme="light" className="theme-light">
          <div className="shell section-y">
            <ul className="flex flex-col gap-24 md:gap-36">
              {founders.map((founder, index) => (
                <li
                  key={founder.name}
                  className="founder grid gap-x-6 gap-y-10 md:grid-cols-12 md:items-start"
                >
                  <div
                    className={`md:col-span-5 lg:col-span-4 ${index % 2 ? "md:order-2 md:col-start-8 lg:col-start-9" : ""}`}
                  >
                    <div className="founder-portrait founder-portrait-large" data-reveal-portrait>
                      <div className="founder-drift" data-portrait-drift>
                        <Image
                          src={founder.portrait}
                          alt={`Portrait of ${founder.name}`}
                          sizes="(min-width: 768px) 24rem, 100vw"
                          placeholder="blur"
                          className="founder-image"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`md:col-span-7 lg:col-span-6 ${index % 2 ? "md:order-1 md:col-start-1" : "lg:col-start-6"}`}
                  >
                    <p className="label" data-reveal>
                      {founder.role}
                    </p>
                    <h2 className="display mt-6" data-reveal>
                      {founder.name}
                    </h2>
                    <p className="lead mt-8" data-reveal>
                      {founder.leads}
                    </p>
                    <p className="mt-6 max-w-[56ch] text-fg-soft" data-reveal>
                      {founder.bio}
                    </p>
                    <ul aria-label="Focus" className="mt-8 flex flex-wrap gap-2" data-reveal>
                      {founder.focus.map((area) => (
                        <li key={area} className="focus-tag">
                          {area}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={founder.profile}
                      target="_blank"
                      rel="noreferrer"
                      className="link mt-9"
                      data-reveal
                    >
                      Connect on LinkedIn
                      <Arrow direction="up-right" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What we believe */}
        <section data-header-theme="dark" className="theme-dark">
          <div className="shell section-y">
            <p className="label">What we believe</p>
            <h2 className="display mt-10 md:mt-14">
              <Lines lines={["Three ideas behind", "everything we build."]} />
            </h2>
            <ol className="mt-16 grid gap-x-6 md:mt-24 md:grid-cols-3">
              {beliefs.map((belief, index) => (
                <li key={belief.title} className="border-t border-line py-8 pr-6 md:py-10" data-reveal>
                  <span className="label">0{index + 1}</span>
                  <h3 className="mt-6 text-[1.625rem] font-medium leading-tight tracking-[-0.03em]">
                    {belief.title}
                  </h3>
                  <p className="mt-4 max-w-[36ch] text-fg-soft">{belief.detail}</p>
                </li>
              ))}
            </ol>

            <div className="mt-20 grid gap-x-6 gap-y-8 border-t border-line pt-12 md:mt-28 md:grid-cols-12 md:pt-16">
              <h2 className="title md:col-span-7" data-reveal>
                Ready to talk?
              </h2>
              <div className="md:col-span-5 lg:col-span-4 lg:col-start-9" data-reveal>
                <p className="text-fg-soft">Partnership, product, or a problem worth solving. We’re listening.</p>
                <Link href="/#contact" className="btn btn-primary mt-8">
                  Start a Conversation
                  <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollMotion />
    </>
  );
}
