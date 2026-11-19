import { HeroWorkflow } from "@/components/hero/HeroWorkflow";
import { Arrow } from "@/components/ui/Arrow";
import { site } from "@/lib/site";

const capabilities = [
  "Agents & Automation",
  "Strategy & Consulting",
  "Private AI",
  "Custom Software",
] as const;

const delay = (index: number) => ({ "--i": index }) as React.CSSProperties;

/**
 * Section 01. From incoming chaos to intelligent action, played by the
 * visitor.
 *
 * Above the words, five loose words: missed calls, emails, new leads,
 * scheduling, questions. The section is a short scroll track: its
 * contents hold still while the visitor scrolls through it, and that
 * scroll lines the words up, draws them into one point of AI, and carries
 * a single line on to the outcome. When the point lights,
 * "intelligence." takes its colour.
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

        <div className="shell relative pb-6 md:pb-7">
          <div data-hero-content>
            <p className="label enter-fade-up flex items-center gap-3" style={delay(0)}>
              <span aria-hidden="true" className="hero-dot" />
              AI consulting, engineering &amp; innovation
            </p>

            <h1 className="hero-title mt-6 md:mt-8">
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

            <div className="mt-7 grid gap-x-6 gap-y-8 md:mt-9 lg:grid-cols-12 lg:items-end">
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

          {/* What Nulle does, at a glance, and a cue to keep going. */}
          <div className="mt-10 hidden md:mt-12 md:block">
            <div aria-hidden="true" className="enter-draw h-px bg-line" style={delay(9)} />
            <div
              className="enter-fade flex items-center justify-between gap-8 pt-5"
              style={delay(14)}
            >
              <ul aria-label="What we do" className="label hidden gap-x-10 lg:flex">
                {capabilities.map((capability, index) => (
                  <li key={capability} className="flex items-baseline gap-2.5">
                    <span aria-hidden="true" className="opacity-55">
                      0{index + 1}
                    </span>
                    {capability}
                  </li>
                ))}
              </ul>
              <a href="#philosophy" className="label ml-auto flex items-center gap-3.5 transition-colors duration-300 hover:text-fg">
                Scroll
                <span aria-hidden="true" className="scroll-cue" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
