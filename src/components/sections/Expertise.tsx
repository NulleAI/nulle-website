import Image from "next/image";

import { Arrow } from "@/components/ui/Arrow";
import { AndroidLogo, AppleLogo } from "@/components/ui/Icons";
import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { apps } from "@/lib/site";

const capabilities = [
  {
    index: "01",
    title: "AI Agents & Automation",
    summary:
      "Calls answered, questions handled, and appointments booked, without adding to your team’s day.",
    includes: [
      "AI receptionists",
      "Customer support agents",
      "Automated scheduling",
      "Lead qualification",
      "Business process automation",
    ],
  },
  {
    index: "02",
    title: "AI Strategy & Consulting",
    summary:
      "We look at how your business really runs, find where AI will make a difference, and give you a practical plan to get there.",
    includes: [
      "Operations review",
      "Opportunity mapping",
      "Workflow improvement",
      "Implementation planning",
    ],
  },
  {
    index: "03",
    title: "Private AI & Infrastructure",
    summary:
      "AI that works with your own knowledge, in an environment you control. Designed for teams that handle confidential information, such as law firms and healthcare practices.",
    includes: [
      "Private AI assistants",
      "Internal knowledge systems",
      "Controlled AI deployments",
    ],
  },
  {
    index: "04",
    title: "Custom Software & Mobile Apps",
    summary:
      "From intelligent business tools to beautifully engineered iOS and Android applications, we turn ambitious ideas into production-ready software.",
    includes: [
      "Native iOS & Android apps",
      "Custom business apps",
      "Consumer digital products",
      "AI integrations",
      "Internal platforms",
    ],
    platforms: true,
  },
] as const;

/** Section 03. An editorial list in place of service cards. */
export function Expertise() {
  return (
    <section id="expertise" data-header-theme="light" className="theme-light">
      <div className="shell pb-[clamp(6rem,13vw,12.5rem)]">
        <div className="border-t border-line pt-[clamp(4rem,8vw,7rem)]">
          <SectionLabel index="03">Expertise</SectionLabel>
          <h2 className="display mt-10 md:mt-14">
            <Lines lines={["Intelligence,", "where it matters."]} />
          </h2>
        </div>

        <ol className="mt-16 md:mt-28">
          {capabilities.map((capability) => (
            <li
              key={capability.index}
              className="row-rule grid gap-x-6 gap-y-6 py-9 md:grid-cols-12 md:py-14"
              data-reveal
            >
              <span className="label pt-[0.4em] md:col-span-1">{capability.index}</span>
              <h3 className="title md:col-span-6 md:max-w-[13ch]">{capability.title}</h3>
              <div className="md:col-span-5">
                <p className="max-w-[46ch] text-fg-soft">{capability.summary}</p>
                <ul className="mt-6 grid max-w-[34rem] grid-cols-1 gap-x-6 gap-y-1.5 text-[0.9375rem] text-fg-mute sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                  {capability.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {"platforms" in capability && (
                  <ul aria-label="Platforms we build for" className="mt-8 flex flex-wrap gap-3">
                    <li className="platform">
                      <AppleLogo className="platform-logo" />
                      iOS
                    </li>
                    <li className="platform platform-android">
                      <AndroidLogo className="platform-logo" />
                      Android
                    </li>
                  </ul>
                )}
                {"platforms" in capability && (
                  <div className="mt-10">
                    <p className="label">Our apps on the App Store</p>
                    <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                      {apps.map((app) => (
                        <li key={app.name}>
                          <a href={app.url} target="_blank" rel="noreferrer" className="app-tile">
                            <Image
                              src={app.icon}
                              alt=""
                              width={56}
                              height={56}
                              sizes="56px"
                              className="app-tile-icon"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium tracking-[-0.015em]">{app.name}</span>
                              <span className="mt-0.5 block text-[0.8125rem] leading-snug text-fg-mute">
                                {app.summary}
                              </span>
                            </span>
                            <Arrow direction="up-right" />
                            <span className="sr-only"> on the App Store (opens in a new tab)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div aria-hidden="true" className="border-t border-line" />
      </div>
    </section>
  );
}
