import Image from "next/image";
import Link from "next/link";

import { Arrow } from "@/components/ui/Arrow";
import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { founders } from "@/lib/founders";

/**
 * Section 07. The founders, kept brief: two small portraits, names and
 * roles, and a way to read more on the founders page. Each portrait is
 * revealed as it scrolls in (ScrollMotion: data-reveal-portrait).
 */
export function Founders() {
  return (
    <section id="founders" data-header-theme="light" className="theme-light">
      <div className="shell section-y">
        <SectionLabel index="07">Founders</SectionLabel>

        <div className="mt-10 grid gap-x-6 gap-y-12 md:mt-14 md:grid-cols-12 md:items-end">
          <h2 className="display md:col-span-7">
            <Lines lines={["The minds", "behind Nulle."]} />
          </h2>

          <div className="md:col-span-5 lg:col-span-4 lg:col-start-9">
            <p className="max-w-[34ch] text-fg-soft" data-reveal>
              Built by engineers who believe powerful technology should feel simple, purposeful, and
              accessible.
            </p>

            <ul className="mt-9 flex flex-col gap-5">
              {founders.map((founder) => (
                <li key={founder.name} className="founder flex items-center gap-4">
                  <div className="founder-portrait founder-portrait-small" data-reveal-portrait>
                    <div className="founder-drift" data-portrait-drift>
                      <Image
                        src={founder.portrait}
                        alt={`Portrait of ${founder.name}`}
                        sizes="5rem"
                        placeholder="blur"
                        className="founder-image"
                      />
                    </div>
                  </div>
                  <div data-reveal>
                    <p className="text-[1.1875rem] font-medium tracking-[-0.02em]">{founder.name}</p>
                    <p className="label mt-1.5">{founder.role}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link href="/founders" className="link mt-9" data-reveal>
              Meet the founders
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
