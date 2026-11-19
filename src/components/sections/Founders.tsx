import Image from "next/image";
import Link from "next/link";

import { Arrow } from "@/components/ui/Arrow";
import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { founders } from "@/lib/founders";

/**
 * Section 07. The founders, introduced the way a studio introduces its
 * principals: the headline, one sentence and the way through to the
 * founders page on the left; two moderate headshots on the right, level,
 * with a hairline between them, each with name, role and one line on
 * their expertise. Stacked on phones. Everything reads without hover;
 * motion only brings it in (ScrollMotion).
 */
export function Founders() {
  return (
    <section id="founders" data-header-theme="light" className="theme-light">
      <div className="shell section-y">
        <SectionLabel index="07">Founders</SectionLabel>

        <div className="founders mt-10 md:mt-14">
          <div className="founders-intro">
            <h2 className="founders-heading">
              <Lines lines={["The minds", "behind Nulle."]} />
            </h2>
            <p className="founders-lede" data-reveal>
              Built by engineers who believe powerful technology should feel simple, purposeful, and
              accessible.
            </p>
            <div className="founders-more" data-reveal>
              <Link href="/founders" className="founders-link">
                <span className="founders-link-text">Meet the founders</span>
                <span aria-hidden="true" className="founders-link-arrow">
                  <Arrow />
                  <Arrow className="founders-link-next" />
                </span>
              </Link>
            </div>
          </div>

          <ul className="founders-list">
            {founders.map((founder, index) => {
              const [title, area] = founder.role.split(", ");
              return (
                <li key={founder.name} className="founder-profile">
                  <div
                    className="headshot"
                    data-reveal-portrait
                    data-reveal-delay={index * 0.16}
                    data-reveal-zoom={1.12}
                  >
                    <div className="headshot-crop" style={{ transformOrigin: founder.face }}>
                      <Image
                        src={founder.portrait}
                        alt={`Portrait of ${founder.name}`}
                        fill
                        sizes="(min-width: 64rem) 23rem, 19rem"
                        placeholder="blur"
                        className="headshot-image"
                      />
                    </div>
                  </div>
                  <div className="founder-meta" data-reveal>
                    <h3 className="founder-name">{founder.name}</h3>
                    <p className="label founder-role">
                      <span className="block">
                        {title}
                        {area && <span className="sr-only">,</span>}
                      </span>
                      {area && <span className="block">{area}</span>}
                    </p>
                    <p className="founder-summary">{founder.summary}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
