import { cacheLife } from "next/cache";
import Link from "next/link";

import { address, legalNavigation, navigation, site } from "@/lib/site";

import { InstagramIcon } from "@/components/ui/Icons";

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
            <a
              href={site.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Nulle on Instagram (opens in a new tab)"
              title="Nulle on Instagram"
              className="social-link mt-8"
            >
              <InstagramIcon className="size-[1.125rem]" />
            </a>
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
              <li>
                <Link href="/founders" className="nav-link">
                  Founders
                </Link>
              </li>
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
          <address className="not-italic leading-relaxed">
            <span className="whitespace-nowrap">{address.street}</span>
            {", "}
            <span className="whitespace-nowrap">{address.unit}</span>
            {", "}
            <span className="whitespace-nowrap">
              {address.locality}, {address.region} {address.postalCode}
            </span>
          </address>
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
