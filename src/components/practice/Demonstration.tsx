"use client";

import { useEffect, useId, useRef, useState } from "react";

import { DeviceIcon, FlowIcon, LockIcon, PhoneIcon } from "@/components/ui/Icons";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

import { AutomationScene } from "./AutomationScene";
import { MobileScene } from "./MobileScene";
import type { SceneProps } from "./parts";
import { PrivateScene } from "./PrivateScene";
import { ReceptionistScene } from "./ReceptionistScene";
import { demos, type DemoId } from "./scenarios";

const scenes: Record<DemoId, React.ComponentType<SceneProps>> = {
  receptionist: ReceptionistScene,
  automation: AutomationScene,
  private: PrivateScene,
  mobile: MobileScene,
};

const icons: Record<DemoId, React.ComponentType<{ className?: string }>> = {
  receptionist: PhoneIcon,
  automation: FlowIcon,
  private: LockIcon,
  mobile: DeviceIcon,
};

/**
 * Four examples, chosen from a row of tabs, one shown at a time. Each
 * plays once when it comes into view (or when chosen), finishes on its
 * result, and keeps it on screen. Nothing rotates on its own.
 */
export function Demonstration() {
  const id = useId();
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const [inView, setInView] = useState(false);

  const panel = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const demo = demos[active];
  const Scene = scenes[demo.id];

  // Hold every animation until the panel is actually on screen.
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
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Each newly chosen example eases in.
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(stage.current, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        stage.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55, ease: "expo.out", clearProps: "transform" },
      );
    },
    { dependencies: [active] },
  );

  const select = (index: number) => {
    if (index === active) return;
    if (prefersReducedMotion() || !stage.current) {
      setActive(index);
      return;
    }
    gsap.to(stage.current, {
      opacity: 0,
      duration: 0.18,
      ease: "power1.out",
      overwrite: true,
      onComplete: () => setActive(index),
    });
  };

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = demos.length - 1;
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
    <div ref={panel}>
      <div role="tablist" aria-label="Examples" className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {demos.map((item, index) => {
          const selected = index === active;
          const Icon = icons[item.id];
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
              className="demo-tab"
            >
              <span className="demo-tab-icon">
                <Icon className="size-[1.0625rem]" />
              </span>
              <span className="min-w-0 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${demo.id}`}
        className="mt-3 overflow-hidden rounded-xl border border-line bg-ink-raised md:mt-4"
        style={{ "--bg": "var(--color-ink-raised)" } as React.CSSProperties}
      >
        <div className="p-5 sm:p-8 lg:px-12 lg:py-12">
          <div ref={stage} className="flex flex-col lg:min-h-[31rem] lg:justify-center">
            <Scene key={demo.id} play={inView} run={run} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line px-5 py-4 sm:px-8 lg:px-12">
          <p className="max-w-[60rem] flex-1 basis-[18rem] text-[0.8125rem] leading-snug text-fg-mute">{demo.note}</p>
          <button
            type="button"
            onClick={() => setRun((count) => count + 1)}
            className="link !text-[0.8125rem] text-fg-soft transition-colors duration-300 hover:text-fg"
          >
            Replay
          </button>
        </div>
      </div>
    </div>
  );
}
