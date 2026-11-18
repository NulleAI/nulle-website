import { HeroSignal } from "@/components/hero/HeroSignal";
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
 * Section 01. A living signal above, the tagline below.
 *
 * The ribbon is the image: one unbroken line of light running from edge
 * to edge, with nothing in its way. The words stay calm beneath it. Text
 * entrances run on CSS alone, so they begin at first paint.
 */
export function Hero() {
  return (
    <section
      id="top"
      data-header-theme="dark"
      className="theme-dark relative isolate flex min-h-svh flex-col overflow-hidden"
    >
      <HeroSignal />
      <div aria-hidden="true" className="hero-grain" />

      <div className="shell relative flex flex-1 flex-col justify-end pb-6 pt-28 md:pb-7">
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
                    <span className="accent-text">intelligence.</span>
                  </span>
                </span>
              </span>
            </span>
          </h1>

          <div className="mt-7 grid gap-x-6 gap-y-8 md:mt-9 lg:grid-cols-12 lg:items-end">
            <p
              className="hero-lead enter-fade-up max-w-[25em] text-fg-soft lg:col-span-6"
              style={delay(6)}
            >
              We design and build intelligent solutions that simplify how businesses work.
            </p>
            <div
              className="enter-fade-up flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-6 lg:justify-self-end"
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
        <div className="mt-10 hidden md:mt-14 md:block">
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
    </section>
  );
}
