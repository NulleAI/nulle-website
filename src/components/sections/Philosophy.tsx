import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * Section 02. The one typographic gesture here: "Complexity" is struck
 * through and dims, leaving "simplified." The struck state is the
 * resting state, so the idea reads with motion switched off too.
 */
export function Philosophy() {
  return (
    <section id="philosophy" data-header-theme="light" className="theme-light">
      <div className="shell section-y">
        <SectionLabel index="02">Philosophy</SectionLabel>

        <h2 className="display mt-10 md:mt-14" data-reveal-lines data-strike>
          <span className="mask">
            <span data-line>
              <span className="strike" data-strike-word>
                Complexity
                <span aria-hidden="true" className="strike-line" data-strike-line />
              </span>
              <span className="text-mute" data-strike-word>
                ,
              </span>
            </span>
          </span>{" "}
          <span className="mask">
            <span data-line>simplified.</span>
          </span>
        </h2>

        <div className="mt-16 grid gap-x-6 md:mt-28 md:grid-cols-12">
          <p className="lead md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-7" data-reveal>
            Technology should move your business forward, not get in its way. We find the
            opportunities, build the solutions, and make intelligence work for you.
          </p>
        </div>
      </div>
    </section>
  );
}
