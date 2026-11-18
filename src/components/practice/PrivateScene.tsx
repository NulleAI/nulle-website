"use client";

import { useRef, useState } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

import { Choices, Outcome, reachStep, resetOutcome, resetTrack, showOutcome, Track } from "./parts";
import { knowledgeQuestions, type KnowledgeQuestion } from "./scenarios";

type SceneProps = {
  play: boolean;
  run: number;
};

/** Scenario C. Question asked → sources retrieved → answer grounded in a source. */
export function PrivateScene({ play, run }: SceneProps) {
  const [questionId, setQuestionId] = useState(knowledgeQuestions[0].id);
  const question = knowledgeQuestions.find((item) => item.id === questionId) ?? knowledgeQuestions[0];

  return (
    <div className="flex flex-1 flex-col gap-8">
      <Choices
        label="Ask about"
        options={knowledgeQuestions}
        value={questionId}
        onChange={setQuestionId}
      />
      <Query key={`${question.id}-${run}`} item={question} play={play} />
    </div>
  );
}

function Query({ item, play }: { item: KnowledgeQuestion; play: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scene = root.current;
      if (!scene) return;

      const media = gsap.matchMedia();
      media.add(MOTION_OK, () => {
        const meta = scene.querySelector("[data-meta]");
        const question = scene.querySelector("[data-question]");
        const sources = gsap.utils.toArray<HTMLElement>("[data-source]", scene);
        const others = sources.filter((source) => !source.hasAttribute("data-match"));
        const marker = scene.querySelector("[data-marker]");
        const tag = scene.querySelector("[data-tag]");
        const answer = scene.querySelector("[data-answer]");
        const citation = scene.querySelector("[data-citation]");

        resetTrack(scene);
        resetOutcome(scene);
        gsap.set(meta, { opacity: 0 });
        gsap.set(question, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(sources, { opacity: 0, y: 10 });
        gsap.set(marker, { scaleY: 0 });
        gsap.set(tag, { opacity: 0 });
        gsap.set([answer, citation], { opacity: 0, y: 10 });

        const timeline = gsap.timeline({ paused: !play, delay: 0.25 });

        // 1. The question is asked.
        reachStep(timeline, scene, 0, 0);
        timeline
          .to(meta, { opacity: 1, duration: 0.4 }, 0)
          .to(question, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.inOut" }, 0.2);

        // 2. Internal sources are retrieved, and the relevant one is found.
        reachStep(timeline, scene, 1, ">0.15");
        timeline
          .to(sources, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.12 }, "<0.3")
          .to(others, { opacity: 0.62, duration: 0.5, ease: "power1.out" }, ">0.35")
          .to(marker, { scaleY: 1, duration: 0.45, ease: "power2.out" }, "<")
          .to(tag, { opacity: 1, duration: 0.4 }, "<0.1");

        // 3. The answer arrives with its source attached.
        reachStep(timeline, scene, 2, ">0.25");
        timeline
          .to(answer, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, "<0.3")
          .to(citation, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, ">-0.2");
        showOutcome(timeline, scene, ">0.1");
      });
    },
    { scope: root, dependencies: [play], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="flex flex-1 flex-col gap-8">
      <Track steps={["Question asked", "Sources retrieved", "Answer grounded"]} />

      <div className="flex-1">
        <p data-meta className="label flex items-start gap-3 !leading-[1.5]">
          <span
            aria-hidden="true"
            className="mt-[0.35em] block size-[7px] shrink-0 rounded-full bg-fg-mute"
          />
          Authorized team member · Internal documents only
        </p>

        <p
          data-question
          className="mt-6 max-w-[30ch] text-[1.25rem] leading-[1.2] tracking-[-0.025em] sm:text-[1.5rem]"
        >
          {item.question}
        </p>

        <ul className="mt-7 border-b border-line">
          {item.sources.map((source) => (
            <li
              key={source.title}
              data-source
              data-match={source.match ? "" : undefined}
              className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-line py-2.5 pl-4 text-[0.9375rem]"
            >
              {source.match && (
                <span
                  data-marker
                  aria-hidden="true"
                  className="absolute inset-y-[-1px] left-0 w-[2px] origin-top bg-mint"
                />
              )}
              <span className={source.match ? "text-fg" : "text-fg-soft"}>{source.title}</span>
              <span className="flex items-baseline gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-fg-mute">
                {source.kind}
                {source.match && (
                  <span data-tag className="text-mint">
                    Relevant
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <p data-answer className="mt-7 max-w-[46ch] leading-snug tracking-[-0.012em]">
          {item.answer}
          <sup className="ml-0.5 font-mono text-[0.625rem] text-mint">1</sup>
        </p>
        <p data-citation className="mt-3 font-mono text-[0.75rem] leading-snug text-fg-mute">
          <span className="text-mint">1</span> Source: {item.citation}
        </p>
      </div>

      <Outcome
        title="Answered from internal knowledge"
        detail="Grounded in a named document · Source attached for checking"
      />
    </div>
  );
}
