"use client";

import { useRef, useState } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

import { Choices, Outcome, reachStep, resetOutcome, resetTrack, showOutcome, Track } from "./parts";
import { callRequests, type CallRequest } from "./scenarios";

type SceneProps = {
  /** True once the demonstration is on screen. */
  play: boolean;
  /** Changes when the visitor asks for a replay. */
  run: number;
};

/** Scenario A. Incoming call → AI answers → request understood → outcome. */
export function ReceptionistScene({ play, run }: SceneProps) {
  const [requestId, setRequestId] = useState(callRequests[0].id);
  const request = callRequests.find((item) => item.id === requestId) ?? callRequests[0];

  return (
    <div className="flex flex-1 flex-col gap-8">
      <Choices
        label="The caller wants to"
        options={callRequests}
        value={requestId}
        onChange={setRequestId}
      />
      <Call key={`${request.id}-${run}`} request={request} play={play} />
    </div>
  );
}

function Call({ request, play }: { request: CallRequest; play: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scene = root.current;
      if (!scene) return;

      const media = gsap.matchMedia();
      media.add(MOTION_OK, () => {
        const meta = scene.querySelector("[data-meta]");
        const ring = scene.querySelector("[data-ring]");
        const lines = gsap.utils.toArray<HTMLElement>("[data-say]", scene);
        const understood = scene.querySelector("[data-understood]");
        const understoodAt = lines.findIndex((line) => line.contains(understood));

        resetTrack(scene);
        resetOutcome(scene);
        gsap.set(meta, { opacity: 0 });
        gsap.set(ring, { opacity: 0, scale: 1 });
        gsap.set(lines, { opacity: 0, y: 12 });
        gsap.set(understood, { opacity: 0, x: -6 });

        const timeline = gsap.timeline({ paused: !play, delay: 0.25 });
        const enter = { opacity: 1, y: 0, duration: 0.55, ease: "expo.out" };

        // 1. The phone rings, twice.
        reachStep(timeline, scene, 0, 0);
        timeline
          .to(meta, { opacity: 1, duration: 0.4 }, 0)
          .fromTo(
            ring,
            { opacity: 0.7, scale: 1 },
            { opacity: 0, scale: 3.4, duration: 0.8, ease: "power1.out", repeat: 1 },
            0.1,
          );

        // 2. The AI answers.
        reachStep(timeline, scene, 1, ">-0.2");
        timeline.to(lines[0], enter, ">-0.15");

        // 3. The caller speaks, and the request is understood.
        lines.slice(1).forEach((line, offset) => {
          const index = offset + 1;
          timeline.to(line, enter, ">0.5");
          if (index === understoodAt) {
            reachStep(timeline, scene, 2, ">0.1");
            timeline.to(understood, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, "<0.2");
          }
        });

        // 4. Done.
        reachStep(timeline, scene, 3, ">0.3");
        showOutcome(timeline, scene, "<0.35");
      });
    },
    { scope: root, dependencies: [play], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="flex flex-1 flex-col gap-8">
      <Track steps={["Incoming call", "AI answers", "Request understood", request.finalStep]} />

      <div className="flex-1">
        <p data-meta className="label flex items-start gap-3 !leading-[1.5]">
          <span aria-hidden="true" className="relative mt-[0.35em] block size-[7px] shrink-0">
            <span className="absolute inset-0 rounded-full bg-fg-mute" />
            <span data-ring className="absolute inset-0 rounded-full border border-fg-mute opacity-0" />
          </span>
          Incoming call · 6:47 PM · After closing
        </p>

        <ol className="mt-6 space-y-4">
          {request.lines.map((line, index) => (
            <li
              key={index}
              data-say
              className="grid gap-x-5 gap-y-1 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
            >
              <span className="label pt-[0.5em] !text-[0.6875rem]">
                {line.speaker === "ai" ? "Receptionist" : "Caller"}
              </span>
              <div>
                <p
                  className={`max-w-[44ch] leading-snug tracking-[-0.012em] ${
                    line.speaker === "ai" ? "text-fg" : "text-fg-mute"
                  }`}
                >
                  {line.text}
                </p>
                {line.understood && (
                  <p
                    data-understood
                    className="mt-2 font-mono text-[0.75rem] leading-snug text-mint"
                  >
                    <span aria-hidden="true">↳ </span>
                    Understood: {line.understood}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <Outcome title={request.outcome.title} detail={request.outcome.detail} />
    </div>
  );
}
