"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Arrow } from "@/components/ui/Arrow";
import { navigation } from "@/lib/site";

type Theme = "dark" | "light" | "stone";

/**
 * Fixed site header. It reads the theme of whichever section sits
 * beneath it and matches that surface, so the logo and navigation keep
 * their contrast all the way down the page.
 */
export function Header({ logo }: { logo: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);

  // Track the section under the header.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const probe = (headerRef.current?.offsetHeight ?? 72) / 2;
      let next: Theme = "dark";
      for (const section of document.querySelectorAll<HTMLElement>("[data-header-theme]")) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom > probe) {
          next = section.dataset.headerTheme as Theme;
          break;
        }
      }
      setTheme(next);
      setScrolled(window.scrollY > 12);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Mobile menu: lock scrolling, close on Escape, manage focus.
  useEffect(() => {
    if (!menuOpen) return;

    const button = menuButtonRef.current;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    firstMenuLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnDesktop = window.matchMedia("(min-width: 64rem)");
    const onBreakpoint = () => closeOnDesktop.matches && setMenuOpen(false);

    window.addEventListener("keydown", onKeyDown);
    closeOnDesktop.addEventListener("change", onBreakpoint);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      closeOnDesktop.removeEventListener("change", onBreakpoint);
      button?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  const activeTheme: Theme = menuOpen ? "dark" : theme;

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled && !menuOpen}
      className={`site-header theme-${activeTheme} enter-fade fixed inset-x-0 top-0 z-50`}
    >
      <div className="shell relative z-10 grid h-16 grid-cols-[1fr_auto] items-center lg:h-[4.5rem] lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/#top"
          aria-label="Nulle, back to top"
          className="justify-self-start"
          onClick={() => setMenuOpen(false)}
        >
          {logo}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href="/#contact"
            className="btn btn-outline btn-sm"
            onClick={() => setMenuOpen(false)}
          >
            Let&rsquo;s Talk
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="btn btn-sm -mr-3 px-3 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="site-menu"
        hidden={!menuOpen}
        className="theme-dark fixed inset-0 z-0 flex flex-col overflow-y-auto pt-16 lg:hidden"
      >
        <nav aria-label="Menu" className="shell flex flex-1 flex-col justify-between pb-10 pt-10">
          <ul>
            {navigation.map((item, index) => (
              <li key={item.href} className="border-b border-line first:border-t">
                <Link
                  ref={index === 0 ? firstMenuLinkRef : undefined}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline gap-5 py-5"
                >
                  <span className="label w-6">0{index + 1}</span>
                  <span className="text-[2.5rem] font-medium leading-none tracking-[-0.045em]">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className="btn btn-primary mt-10 self-start"
          >
            Start a Conversation
            <Arrow />
          </Link>
        </nav>
      </div>
    </header>
  );
}
