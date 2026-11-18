import { cacheLife } from "next/cache";
import Link from "next/link";

import { legalNavigation, navigation, site } from "@/lib/site";

import { Logo } from "./Logo";

async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await currentYear();

  return (
    <footer data-header-theme="dark" className="theme-dark">
      <div className="shell">
        <div className="grid gap-x-6 gap-y-12 border-t border-line pb-16 pt-14 md:grid-cols-12 md:pb-24 md:pt-16">
          <div className="md:col-span-6">
            <Link href="/#top" aria-label="Nulle, back to top" className="inline-block">
              <Logo />
            </Link>
            <p className="mt-5 text-fg-mute">{site.tagline}</p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="label">Explore</p>
            <ul className="mt-5 space-y-2.5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="label">Contact</p>
            <ul className="mt-5 space-y-2.5">
              <li>
                <Link href="/#contact" className="nav-link">
                  Start a conversation
                </Link>
              </li>
              {site.contactEmail && (
                <li>
                  <a href={`mailto:${site.contactEmail}`} className="nav-link">
                    {site.contactEmail}
                  </a>
                </li>
              )}
              {site.schedulingUrl && (
                <li>
                  <a href={site.schedulingUrl} target="_blank" rel="noreferrer" className="nav-link">
                    Book a consultation
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line py-6 text-[0.8125rem] text-fg-mute">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-link !text-[0.8125rem] !text-fg-mute hover:!text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
