"use client";

import { useRef, useState } from "react";

import { DocumentIcon, LockIcon, SparkIcon } from "@/components/ui/Icons";

import { AnotherExample, SceneLayout, useScene, type SceneProps } from "./parts";
import { demoById, knowledgeQuestions } from "./scenarios";

const demo = demoById("private");

/**
 * A team member asks a question; the answer is found in approved company
 * documents, and comes back short, with its source. About 3.2s.
 */
export function PrivateScene({ play, run }: SceneProps) {
  const [index, setIndex] = useState(0);
  const item = knowledgeQuestions[index];
  const root = useRef<HTMLDivElement>(null);

  useScene(root, play, [run, index], (scene, timeline) => {
    const others = scene.querySelectorAll("[data-source]:not([data-match])");
    timeline
      .from(scene.querySelector("[data-question]"), { opacity: 0, y: 12, duration: 0.55, ease: "expo.out" }, 0)
      .from(scene.querySelector("[data-sources-label]"), { opacity: 0, duration: 0.4 }, 0.6)
      .from(scene.querySelectorAll("[data-source]"), { opacity: 0, y: 8, duration: 0.4, ease: "power2.out", stagger: 0.12 }, 0.7)
      .fromTo(others, { opacity: 1 }, { opacity: 0.42, duration: 0.5 }, 1.6)
      .from(scene.querySelector("[data-match] [data-lit]"), { opacity: 0, duration: 0.5 }, 1.6)
      .from(scene.querySelector("[data-match] [data-tag]"), { opacity: 0, x: -4, duration: 0.4 }, 1.75)
      .from(scene.querySelector("[data-answer]"), { opacity: 0, y: 14, duration: 0.65, ease: "expo.out" }, 2.2)
      .from(scene.querySelector("[data-citation]"), { opacity: 0, y: 6, duration: 0.45, ease: "power2.out" }, 2.65);
  });

  return (
    <SceneLayout
      label={demo.label}
      title={demo.title}
      summary={demo.summary}
      aside={
        <AnotherExample
          index={index}
          count={knowledgeQuestions.length}
          onNext={() => setIndex((index + 1) % knowledgeQuestions.length)}
        />
      }
    >
      <div ref={root} className="mx-auto flex w-full max-w-[30rem] flex-col gap-4">
        <div data-question className="flex flex-col items-end gap-2">
          <span className="label">A team member asks</span>
          <p className="bubble bubble-question">{item.question}</p>
        </div>

        <div className="demo-card p-4 sm:p-5">
          <p data-sources-label className="label flex items-center gap-2">
            <LockIcon className="size-3.5" />
            Approved company documents
          </p>
          <ul className="mt-3.5 flex flex-col gap-2">
            {item.sources.map((source) => (
              <li
                key={source.title}
                data-source
                data-match={source.match ? "" : undefined}
                className="relative flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                {source.match && (
                  <span data-lit aria-hidden="true" className="absolute inset-0 rounded-lg border border-[rgb(175_254_159/0.4)] bg-[rgb(175_254_159/0.06)]" />
                )}
                <DocumentIcon className={`relative size-4 ${source.match ? "text-mint" : "text-fg-mute"}`} />
                <span className="relative min-w-0 flex-1 truncate text-[0.9375rem]">{source.title}</span>
                <span className="label relative">{source.kind}</span>
                {source.match && (
                  <span data-tag className="label relative !text-mint">
                    Used
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div data-answer className="demo-card demo-card-raised p-5">
          <p className="label flex items-center gap-2 !text-fg">
            <SparkIcon className="size-3.5 text-mint" />
            Answer
          </p>
          <p className="mt-3 text-[1.0625rem] leading-[1.4] tracking-[-0.015em]">{item.answer}</p>
          <p data-citation className="demo-status mt-4 !text-fg-soft">
            <DocumentIcon className="size-3.5 text-mint" />
            Source: {item.citation}
          </p>
        </div>
      </div>
    </SceneLayout>
  );
}
