"use client";

import { useRef, useState } from "react";

import { PhoneIcon, SparkIcon } from "@/components/ui/Icons";

import { AnotherExample, SceneLayout, useScene, type SceneProps } from "./parts";
import { calls, demoById } from "./scenarios";

const demo = demoById("receptionist");

/**
 * An after-hours call: it rings, the AI receptionist answers, three short
 * exchanges, and the result lands on a confirmation card. About 3.5s.
 */
export function ReceptionistScene({ play, run }: SceneProps) {
  const [index, setIndex] = useState(0);
  const call = calls[index];
  const root = useRef<HTMLDivElement>(null);

  useScene(root, play, [run, index], (scene, timeline) => {
    const ring = scene.querySelector("[data-ring]");
    timeline
      .from(scene.querySelector("[data-call]"), { opacity: 0, y: 16, duration: 0.6, ease: "expo.out" }, 0)
      .fromTo(ring, { opacity: 0.7, scale: 1 }, { opacity: 0, scale: 2.1, duration: 0.8, ease: "power2.out", repeat: 1 }, 0.15)
      .fromTo(scene.querySelector("[data-ringing]"), { opacity: 1 }, { opacity: 0, duration: 0.25 }, 1.0)
      .from(scene.querySelector("[data-answered]"), { opacity: 0, x: 6, duration: 0.4, ease: "power2.out" }, 1.1)
      .from(scene.querySelectorAll("[data-bubble]"), { opacity: 0, y: 10, duration: 0.45, ease: "power2.out", stagger: 0.55 }, 1.25)
      .from(scene.querySelector("[data-confirm]"), { opacity: 0, y: 18, duration: 0.7, ease: "expo.out" }, 2.9)
      .fromTo(
        scene.querySelector("[data-confirm] [data-check]"),
        { attr: { "stroke-dashoffset": 1 } },
        { attr: { "stroke-dashoffset": 0 }, duration: 0.45, ease: "power2.out" },
        3.1,
      );
  });

  return (
    <SceneLayout
      label={demo.label}
      title={demo.title}
      summary={demo.summary}
      aside={<AnotherExample index={index} count={calls.length} onNext={() => setIndex((index + 1) % calls.length)} />}
    >
      <div ref={root} className="mx-auto w-full max-w-[30rem]">
        <div data-call className="demo-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-3">
            <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line-strong">
              <span data-ring aria-hidden="true" className="absolute inset-[-1px] rounded-full border border-mint opacity-0" />
              <PhoneIcon className="size-[1.125rem]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium tracking-[-0.015em]">Incoming call</p>
              <p className="label mt-1.5">7:42 PM · After hours</p>
            </div>
            <span className="grid basis-full justify-items-start text-[0.8125rem] sm:basis-auto sm:justify-items-end">
              <span data-ringing className="[grid-area:1/1] self-center text-fg-mute opacity-0">
                Ringing…
              </span>
              <span data-answered className="demo-status [grid-area:1/1]">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-mint" />
                Answered by AI
              </span>
            </span>
          </div>

          <ol className="mt-6 flex flex-col gap-2.5">
            {call.lines.map((line) => (
              <li key={line.text} data-bubble className={line.speaker === "ai" ? "bubble bubble-ai" : "bubble"}>
                {line.speaker === "ai" && (
                  <span className="bubble-by">
                    <SparkIcon className="size-3" />
                    AI receptionist
                  </span>
                )}
                {line.text}
              </li>
            ))}
          </ol>
        </div>

        <div data-confirm className="demo-card demo-card-raised relative mx-3 -mt-4 p-5 sm:mx-6">
          <div className="flex items-start gap-3.5">
            <span className="accent-fill grid size-9 shrink-0 place-items-center rounded-full text-ink">
              <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none">
                <path
                  data-check
                  d="M5 10.5l3.2 3.2L15 6.8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset="0"
                />
              </svg>
            </span>
            <div>
              <p className="font-medium tracking-[-0.015em]">{call.result.title}</p>
              <p className="mt-1 text-fg-soft">{call.result.detail}</p>
              <p className="label mt-3">{call.result.note}</p>
            </div>
          </div>
        </div>
      </div>
    </SceneLayout>
  );
}
