import { HeroWorkflow } from "@/components/hero/HeroWorkflow";
import { Arrow } from "@/components/ui/Arrow";
import { site } from "@/lib/site";

const delay = (index: number) => ({ "--i": index }) as React.CSSProperties;

/**
 * Section 01. From incoming chaos to intelligent action, played by the
 * visitor.
 *
 * Above the words, five everyday inputs float loose on arrival. The
 * section is a short scroll track: its contents hold still while the
 * visitor scrolls through it, and that scroll lines the inputs up, runs
 * light through one point of AI, and carries a beam on to the outcome.
 * When the point lights, "intelligence." takes its colour. Below it, only
 * the message: the headline, one supporting paragraph, and the next step.
 *
 * Text entrances run on CSS alone, so they begin at first paint. With
 * reduced motion, or a window too short to hold the hero, the track
 * collapses to an ordinary section.
 */
export function Hero() {
  return (
    <section id="top" data-header-theme="dark" className="hero-track theme-dark relative isolate">
      <div data-hero-pin className="hero-pin">
        <HeroWorkflow />
        <div aria-hidden="true" className="hero-grain" />

        <div className="shell relative pb-12 md:pb-16">
          <div data-hero-content>
            <h1 className="hero-title">
              <span className="sr-only">{site.tagline}</span>
              <span aria-hidden="true" className="block">
                <span className="mask">
                  <span className="enter-rise" style={delay(1)}>
                    Nothing between
                  </span>
                </span>
                <span className="flex flex-col md:flex-row md:gap-[0.24em]">
                  <span className="mask">
                    <span className="enter-rise" style={delay(2)}>
                      you and
                    </span>
                  </span>
                  <span className="mask">
                    <span className="enter-rise" style={delay(3)}>
                      <span className="accent-text hero-accent">intelligence.</span>
                    </span>
                  </span>
                </span>
              </span>
            </h1>

            <div className="mt-7 grid gap-x-6 gap-y-8 md:mt-10 lg:grid-cols-12 lg:items-end">
              <p
                className="hero-lead enter-fade-up max-w-[25em] text-fg-soft lg:col-span-7 lg:max-w-[30em]"
                style={delay(6)}
              >
                <span className="text-fg">From incoming chaos to intelligent action.</span>{" "}
                We design and build practical AI that answers, schedules, updates and reports.
              </p>
              <div
                className="enter-fade-up flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-5 lg:justify-self-end"
                style={delay(8)}
              >
                <a href="#contact" className="btn btn-primary">
                  Start a Conversation
                  <Arrow />
                </a>
                <a href="#expertise" className="link">
                  Explore What We Do
                  <Arrow direction="down" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
