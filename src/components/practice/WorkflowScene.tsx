"use client";

import { useEffect, useRef, useState } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

import { Choices, Outcome } from "./parts";
import { workflowOutcome, workflowStatus, workflowTasks } from "./scenarios";

type SceneProps = {
  play: boolean;
  run: number;
};

type Mode = "before" | "connected";

const modes = [
  { id: "before", label: "Before" },
  { id: "connected", label: "Connected" },
] as const;

/** Where each task sits before it is connected: [x, y, rotation]. */
const scatter = {
  wide: [
    [-6, 38, -3],
    [10, -22, 2.5],
    [-12, 54, -2],
    [8, -6, 3.5],
  ],
  narrow: [
    [0, 0, -2],
    [34, 0, 2],
    [12, 0, -1.5],
    [46, 0, 2.5],
  ],
} as const;

/**
 * Scenario B. One timeline describes the whole transformation, from
 * four scattered tasks to a single connected flow. "Connected" plays it
 * forwards and "Before" plays it backwards.
 */
export function WorkflowScene({ play, run }: SceneProps) {
  return <Flow key={run} play={play} />;
}

function Flow({ play }: { play: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [mode, setMode] = useState<Mode>("before");
  const modeRef = useRef<Mode>(mode);

  useGSAP(
    () => {
      const scene = root.current;
      if (!scene) return;

      const media = gsap.matchMedia();
      media.add({ wide: "(min-width: 48rem)", narrow: "(max-width: 47.999rem)" }, (context) => {
        const wide = Boolean(context.conditions?.wide);
        const offsets = wide ? scatter.wide : scatter.narrow;

        const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", scene);
        const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", scene);
        const rails = gsap.utils.toArray<HTMLElement>("[data-rail]", scene);
        const segments = gsap.utils.toArray<HTMLElement>("[data-segment]", scene);
        const before = gsap.utils.toArray<HTMLElement>("[data-before]", scene);
        const after = gsap.utils.toArray<HTMLElement>("[data-after]", scene);
        const statusBefore = scene.querySelector("[data-status-before]");
        const statusAfter = scene.querySelector("[data-status-after]");
        const outcome = scene.querySelector("[data-outcome]");
        const check = scene.querySelector("[data-check]");
        const grow = wide ? { scaleX: 1 } : { scaleY: 1 };

        // The "before" state.
        nodes.forEach((node, index) => {
          const [x, y, rotation] = offsets[index];
          gsap.set(node, { x, y, rotation, opacity: 0.72 });
        });
        gsap.set(dots, { opacity: 0, scale: 0.3 });
        gsap.set(rails, { opacity: 0 });
        gsap.set(segments, wide ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 });
        gsap.set(before, { opacity: 1 });
        gsap.set(after, { opacity: 0 });
        gsap.set(statusBefore, { opacity: 1 });
        gsap.set(statusAfter, { opacity: 0 });
        gsap.set(outcome, { opacity: 0, y: 10 });
        gsap.set(check, { strokeDashoffset: 1 });

        // The transformation.
        const flow = gsap.timeline({ paused: true });
        flow
          .to(statusBefore, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0)
          .to(statusAfter, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.3)
          .to(
            nodes,
            {
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 1,
              duration: 1.1,
              ease: "expo.inOut",
              stagger: 0.06,
            },
            0,
          )
          .to(rails, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.75);

        nodes.forEach((_, index) => {
          const at = 1.05 + index * 0.42;
          flow
            .to(dots[index], { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, at)
            .to(before[index], { opacity: 0, duration: 0.25 }, at)
            .to(after[index], { opacity: 1, duration: 0.35 }, at + 0.12);
          if (segments[index]) {
            flow.to(segments[index], { ...grow, duration: 0.42, ease: "power2.inOut" }, at + 0.1);
          }
        });

        flow
          .to(outcome, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, ">-0.1")
          .to(check, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, "<0.15");

        // Rebuilt at a breakpoint: stay in whichever state was showing.
        if (modeRef.current === "connected") flow.progress(1);

        timeline.current = flow;
        return () => {
          timeline.current = null;
        };
      });
    },
    { scope: root },
  );

  // Once on screen, show "before" for a beat, then connect.
  useEffect(() => {
    if (!play) return;
    const beat = gsap.delayedCall(prefersReducedMotion() ? 0 : 1.1, () => setMode("connected"));
    return () => {
      beat.kill();
    };
  }, [play]);

  // Follow the selected mode.
  useEffect(() => {
    modeRef.current = mode;
    const flow = timeline.current;
    if (!flow) return;
    const connected = mode === "connected";
    if (prefersReducedMotion()) {
      flow.progress(connected ? 1 : 0).pause();
    } else if (connected) {
      flow.timeScale(1).play();
    } else {
      flow.timeScale(1.6).reverse();
    }
  }, [mode]);

  const connected = mode === "connected";

  return (
    <div ref={root} className="flex flex-1 flex-col gap-8">
      <Choices label="View" options={modes} value={mode} onChange={setMode} />

      <p className="grid text-[1.1875rem] leading-snug tracking-[-0.02em] sm:text-[1.375rem]">
        <span
          data-status-before
          aria-hidden={connected}
          className="col-start-1 row-start-1 opacity-0"
        >
          {workflowStatus.before}
        </span>
        <span data-status-after aria-hidden={!connected} className="col-start-1 row-start-1">
          {workflowStatus.after}
        </span>
      </p>

      <ol className="grid flex-1 content-center gap-y-7 py-4 md:grid-cols-4 md:gap-x-3 md:py-12">
        {workflowTasks.map((task, index) => (
          <li key={task.title} data-node className="relative pl-7 md:pl-0">
            <span className="absolute left-0 top-[0.4rem] block size-[9px] md:relative md:top-0">
              <span className="block size-[9px] rounded-full border border-line-strong" />
              <span data-dot className="accent-fill absolute inset-0 rounded-full" />
            </span>
            {index < workflowTasks.length - 1 && (
              <span
                data-rail
                aria-hidden="true"
                className="absolute bottom-[calc(-2.15rem+6px)] left-[4px] top-[calc(0.4rem+15px)] w-px bg-line md:bottom-auto md:left-[15px] md:right-[-6px] md:top-[4px] md:h-px md:w-auto"
              >
                <span data-segment className="absolute inset-0 origin-top bg-mint md:origin-left" />
              </span>
            )}
            <h4 className="text-[1.0625rem] font-medium leading-tight tracking-[-0.02em] md:mt-5 md:pr-3 lg:text-[1.1875rem]">
              {task.title}
            </h4>
            <p className="mt-1.5 grid text-[0.875rem] leading-snug md:pr-3">
              <span
                data-before
                aria-hidden={connected}
                className="col-start-1 row-start-1 text-fg-mute opacity-0"
              >
                {task.before}
              </span>
              <span data-after aria-hidden={!connected} className="col-start-1 row-start-1 text-fg-soft">
                {task.after}
              </span>
            </p>
          </li>
        ))}
      </ol>

      <Outcome title={workflowOutcome.title} detail={workflowOutcome.detail} />
    </div>
  );
}
