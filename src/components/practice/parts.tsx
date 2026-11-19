"use client";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { Arrow } from "@/components/ui/Arrow";

/* ------------------------------------------------------------------
   Shared building blocks for the four demonstrations. Each one reads
   the same way: a plain headline on the left, a short visual on the
   right that ends on its result, and the result stays on screen.
   ------------------------------------------------------------------ */

export type SceneProps = {
  /** True once the demonstration is on screen. */
  play: boolean;
  /** Changes when the visitor asks for a replay. */
  run: number;
};

/**
 * Build and play a scene's timeline. Scenes are authored complete, in
 * their final state; the timeline only animates toward it. Without
 * motion nothing is hidden, so the outcome is simply there.
 */
export function useScene(
  root: React.RefObject<HTMLElement | null>,
  play: boolean,
  dependencies: unknown[],
  build: (scene: HTMLElement, timeline: gsap.core.Timeline) => void,
) {
  useGSAP(
    () => {
      const scene = root.current;
      if (!scene) return;
      const media = gsap.matchMedia();
      media.add(MOTION_OK, () => {
        const timeline = gsap.timeline({ paused: true, delay: 0.15 });
        build(scene, timeline);
        if (play) timeline.play();
        return () => timeline.kill();
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [play, ...dependencies], revertOnUpdate: true },
  );
}

type LayoutProps = {
  label: string;
  title: string;
  summary: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
};

/** A plain headline on the left, the visual on the right (stacked on narrow screens). */
export function SceneLayout({ label, title, summary, aside, children }: LayoutProps) {
  return (
    <div className="grid flex-1 gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
      <div className="max-w-[30rem]">
        <p className="label">{label}</p>
        <h3 className="mt-4 text-[clamp(1.75rem,2.7vw,2.625rem)] font-medium leading-[1.04] tracking-[-0.035em]">
          {title}
        </h3>
        <p className="mt-4 text-fg-soft">{summary}</p>
        {aside && <div className="mt-8">{aside}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** A discreet way to see another case of the same demonstration. */
export function AnotherExample({
  index,
  count,
  onNext,
}: {
  index: number;
  count: number;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-5">
      <button type="button" onClick={onNext} className="link !text-[0.875rem] text-fg-soft hover:text-fg">
        Another example
        <Arrow />
      </button>
      <span className="label tabular-nums" aria-live="polite">
        {index + 1} / {count}
      </span>
    </div>
  );
}

/** The result of a demonstration: a drawn check, a title, and what it means. */
export function Outcome({ title, detail }: { title: string; detail: string }) {
  return (
    <div data-outcome className="flex items-start gap-3.5 border-t border-line pt-5">
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-[2px] shrink-0">
        <circle cx="10" cy="10" r="9.25" stroke="var(--color-mint)" strokeOpacity="0.45" />
        <path
          data-check
          d="M6.2 10.4l2.6 2.6 5-5.6"
          stroke="var(--color-mint)"
          strokeWidth="1.5"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="0"
        />
      </svg>
      <p>
        <span className="block font-medium tracking-[-0.015em]">{title}</span>
        <span className="mt-1 block text-[0.875rem] leading-snug text-fg-mute">{detail}</span>
      </p>
    </div>
  );
}

/** Bring an Outcome in, at the given point of a timeline. */
export function showOutcome(timeline: gsap.core.Timeline, scene: HTMLElement, position: gsap.Position) {
  timeline
    .from(scene.querySelector("[data-outcome]"), { opacity: 0, y: 10, duration: 0.6, ease: "expo.out" }, position)
    .fromTo(
      scene.querySelector("[data-outcome] [data-check]"),
      { attr: { "stroke-dashoffset": 1 } },
      { attr: { "stroke-dashoffset": 0 }, duration: 0.5, ease: "power2.out" },
      "<0.15",
    );
}
