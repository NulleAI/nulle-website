"use client";

import { useEffect, useId, useRef, useState } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

import { PrivateScene } from "./PrivateScene";
import { ReceptionistScene } from "./ReceptionistScene";
import { scenarios } from "./scenarios";
import { WorkflowScene } from "./WorkflowScene";

const scenes = {
  receptionist: ReceptionistScene,
  workflow: WorkflowScene,
  private: PrivateScene,
} as const;

/**
 * The one interactive container on the site. A rail of three scenarios,
 * a stage that plays the selected one once it is on screen, and a quiet
 * footer that says plainly what this is.
 */
export function Demonstration() {
  const id = useId();
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const [inView, setInView] = useState(false);

  const panel = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const scenario = scenarios[active];
  const Scene = scenes[scenario.id];

  // Hold every timeline until the panel is actually on screen.
  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Each new scene eases in.
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(stage.current, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        stage.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", clearProps: "transform" },
      );
    },
    { dependencies: [active, run] },
  );

  const select = (index: number) => {
    if (index === active) return;
    if (prefersReducedMotion() || !stage.current) {
      setActive(index);
      return;
    }
    gsap.to(stage.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power1.out",
      overwrite: true,
      onComplete: () => setActive(index),
    });
  };

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = scenarios.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    tabs.current[next]?.focus();
    select(next);
  };

  return (
    <div
      ref={panel}
      className="overflow-hidden rounded-xl border border-line bg-ink-raised"
      style={{ "--bg": "var(--color-ink-raised)" } as React.CSSProperties}
    >
      <div className="grid lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
        {/* Rail */}
        <div className="flex flex-col border-b border-line lg:border-b-0 lg:border-r">
          <div role="tablist" aria-label="Business scenarios" className="flex lg:flex-col">
            {scenarios.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.id}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(index)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`group relative flex flex-1 cursor-pointer items-baseline justify-center gap-4 px-2 py-4 text-left transition-colors duration-300 focus-visible:-outline-offset-2 lg:flex-none lg:justify-start lg:border-b lg:border-line lg:px-8 lg:py-7 ${
                    selected ? "text-fg" : "text-fg-mute hover:text-fg-soft"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`accent-fill absolute inset-x-0 bottom-[-1px] h-[2px] transition-opacity duration-300 lg:inset-y-[-1px] lg:left-0 lg:right-auto lg:h-auto lg:w-[2px] ${
                      selected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="label hidden !text-current opacity-60 lg:inline">
                    {item.letter}
                  </span>
                  <span className="text-[0.875rem] tracking-[-0.01em] lg:hidden">{item.short}</span>
                  <span className="hidden text-[1.375rem] font-medium leading-tight tracking-[-0.03em] lg:inline">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto hidden p-8 lg:block">
            <p className="label">What it changes</p>
            <p className="mt-4 text-[1.1875rem] leading-[1.3] tracking-[-0.02em] text-fg-soft">
              {scenario.value}
            </p>
          </div>
        </div>

        {/* Stage */}
        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${scenario.id}`}
          className="flex min-h-[38rem] flex-col p-5 sm:p-8 md:min-h-[42rem] lg:min-h-[43rem] lg:p-10"
        >
          <div ref={stage} className="flex w-full max-w-[58rem] flex-1 flex-col">
            <Scene key={scenario.id} play={inView} run={run} />
          </div>
        </div>
      </div>

      {/* What it changes, on narrow screens */}
      <div className="border-t border-line p-5 sm:p-8 lg:hidden">
        <p className="label">What it changes</p>
        <p className="mt-3 text-[1.0625rem] leading-[1.35] tracking-[-0.015em] text-fg-soft md:min-h-[2.7em]">
          {scenario.value}
        </p>
      </div>

      {/* Plain statement of what this is */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line px-5 py-4 sm:px-8 lg:px-8">
        <p className="max-w-[72rem] flex-1 basis-[18rem] text-[0.8125rem] leading-snug text-fg-mute md:min-h-[2.75em] lg:min-h-0">
          {scenario.note}
        </p>
        <button
          type="button"
          onClick={() => setRun((count) => count + 1)}
          className="link !text-[0.8125rem] text-fg-soft transition-colors duration-300 hover:text-fg"
        >
          Replay
        </button>
      </div>
    </div>
  );
}
