"use client";

import { useRef } from "react";

import { CalendarIcon, CheckIcon, DocumentIcon, LeadIcon, MailIcon } from "@/components/ui/Icons";

import { Outcome, SceneLayout, showOutcome, useScene, type SceneProps } from "./parts";
import { automationOutcome, automationSteps, demoById } from "./scenarios";

const demo = demoById("automation");
const icons = [LeadIcon, MailIcon, DocumentIcon, CalendarIcon] as const;

/**
 * A new lead, handled: four steps light up in turn along one line, each
 * ticked off as it completes, then the result. About 3.8s.
 */
export function AutomationScene({ play, run }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);

  useScene(root, play, [run], (scene, timeline) => {
    const steps = Array.from(scene.querySelectorAll<HTMLElement>("[data-step]"));
    steps.forEach((step, i) => {
      const at = 0.3 + i * 0.72;
      timeline
        .fromTo(step, { opacity: 0.32 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, at)
        .from(step.querySelector("[data-lit]"), { opacity: 0, scale: 0.7, duration: 0.45, ease: "back.out(2)" }, at)
        .from(step.querySelector("[data-tick]"), { opacity: 0, scale: 0.5, duration: 0.35, ease: "back.out(2.4)" }, at + 0.25);
      const fill = step.querySelector("[data-fill]");
      if (fill) timeline.from(fill, { scaleY: 0, duration: 0.5, ease: "power2.inOut" }, at + 0.3);
    });
    showOutcome(timeline, scene, 3.3);
  });

  return (
    <SceneLayout label={demo.label} title={demo.title} summary={demo.summary}>
      <div ref={root} className="mx-auto w-full max-w-[30rem]">
        <ol className="demo-card px-5 py-6 sm:px-6">
          {automationSteps.map((step, i) => {
            const Icon = icons[i];
            const last = i === automationSteps.length - 1;
            return (
              <li key={step.title} data-step className={`relative flex items-start gap-4 ${last ? "" : "pb-6"}`}>
                {!last && (
                  <span aria-hidden="true" className="absolute bottom-0 left-[1.3125rem] top-[2.75rem] w-px bg-line">
                    <span data-fill className="accent-fill absolute inset-0 origin-top" />
                  </span>
                )}
                <span className="step-chip">
                  <span data-lit aria-hidden="true" className="step-chip-lit" />
                  <Icon className="relative size-[1.125rem]" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="font-medium tracking-[-0.015em]">{step.title}</p>
                  <p className="mt-1 text-[0.875rem] leading-snug text-fg-mute">{step.detail}</p>
                </div>
                <span data-tick className="mt-2 text-mint">
                  <CheckIcon className="size-4" />
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-6">
          <Outcome title={automationOutcome.title} detail={automationOutcome.detail} />
        </div>
      </div>
    </SceneLayout>
  );
}
