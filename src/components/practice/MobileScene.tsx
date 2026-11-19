"use client";

import { useEffect, useRef, useState } from "react";

import {
  AndroidLogo,
  AppleLogo,
  ArrowUpIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ComposeIcon,
  MicIcon,
  PhoneIcon,
  QuestionIcon,
  SparkIcon,
} from "@/components/ui/Icons";
import { prefersReducedMotion } from "@/lib/gsap";

import { SceneLayout, useScene, type SceneProps } from "./parts";
import { demoById } from "./scenarios";

const demo = demoById("mobile");

type Platform = "ios" | "android";
/** Where the conversation is: the welcome screen, a question asked, a time suggested, or booked. */
type Stage = "home" | "asking" | "suggest" | "booked";

/**
 * A product showcase: one AI assistant app concept, drawn natively for iOS
 * (light) and Android (dark). The phones rise in; "Book a visit" is
 * chosen; the assistant types, suggests a time on a card, and the visit is
 * confirmed. Visitors can tap through it themselves. About 3.5s.
 *
 * On phones a small toggle shows one platform at a time, so the screen
 * stays readable.
 */
export function MobileScene({ play, run }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  // Authored in its final state: booked. The timeline starts it from the beginning.
  const [stage, setStage] = useState<Stage>("booked");
  const [platform, setPlatform] = useState<Platform>("ios");

  // Once a question is asked, the assistant answers after a short pause.
  useEffect(() => {
    if (stage !== "asking") return;
    const reply = window.setTimeout(() => setStage("suggest"), prefersReducedMotion() ? 0 : 950);
    return () => window.clearTimeout(reply);
  }, [stage]);

  useScene(root, play, [run], (scene, timeline) => {
    setStage("home");
    timeline
      .from(scene.querySelectorAll("[data-phone]"), { opacity: 0, y: 28, duration: 0.8, ease: "expo.out", stagger: 0.15 }, 0)
      .to(scene.querySelectorAll("[data-suggest-first]"), { scale: 0.97, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1 }, 1.05)
      .call(() => setStage("asking"), undefined, 1.3)
      .call(() => setStage("booked"), undefined, 3.35);
  });

  const phoneProps = { stage, onAsk: () => setStage("asking"), onConfirm: () => setStage("booked"), onReset: () => setStage("home") };

  return (
    <SceneLayout
      label={demo.label}
      title={demo.title}
      summary={demo.summary}
      aside={
        <div className="flex flex-col gap-6">
          <ul aria-label="Platforms" className="flex flex-wrap gap-3">
            <li className="platform">
              <AppleLogo className="platform-logo" />
              iOS
            </li>
            <li className="platform platform-android">
              <AndroidLogo className="platform-logo" />
              Android
            </li>
          </ul>
          <p className="label leading-[1.6]">AI assistants · Business tools · Customer experiences</p>
        </div>
      }
    >
      <div ref={root} className="flex flex-col items-center gap-6">
        <div role="group" aria-label="Show platform" className="segmented sm:hidden">
          {(["ios", "android"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={platform === item}
              onClick={() => setPlatform(item)}
              className="segmented-option"
            >
              {item === "ios" ? <AppleLogo className="size-3.5" /> : <AndroidLogo className="size-3.5" />}
              {item === "ios" ? "iOS" : "Android"}
            </button>
          ))}
        </div>
        <div className="flex items-start justify-center gap-6 sm:gap-8">
          <Phone platform="ios" hidden={platform !== "ios"} {...phoneProps} />
          <Phone platform="android" hidden={platform !== "android"} className="sm:mt-12" {...phoneProps} />
        </div>
      </div>
    </SceneLayout>
  );
}

type PhoneProps = {
  platform: Platform;
  stage: Stage;
  /** Hidden on phones when the other platform is chosen; both always show from tablet up. */
  hidden: boolean;
  onAsk: () => void;
  onConfirm: () => void;
  onReset: () => void;
  className?: string;
};

function Phone({ platform, stage, hidden, onAsk, onConfirm, onReset, className = "" }: PhoneProps) {
  const name = platform === "ios" ? "iOS" : "Android";
  const home = stage === "home";
  const answered = stage === "suggest" || stage === "booked";
  return (
    <figure data-phone className={`phone phone-${platform} ${hidden ? "max-sm:hidden" : ""} ${className}`}>
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="phone-status" aria-hidden="true">
            <span>9:41</span>
            <span className="phone-camera" />
            <span className="phone-battery" />
          </div>

          <div className="app" data-stage={stage}>
            <div className="app-bar">
              <button
                type="button"
                className="app-icon-button"
                onClick={onReset}
                disabled={home}
                aria-label={`Back to start (demo, ${name})`}
              >
                <ChevronLeftIcon />
              </button>
              <span className="app-avatar" aria-hidden="true">
                <SparkIcon />
              </span>
              <span className="app-who">
                <span className="app-name">Assistant</span>
                <span className="app-online">
                  <span aria-hidden="true" className="app-online-dot" />
                  Always on
                </span>
              </span>
              <span aria-hidden="true" className="app-icon-button app-compose">
                <ComposeIcon />
              </span>
            </div>

            <div className="app-body">
              <div className="app-view app-view-home" aria-hidden={!home} inert={!home}>
                <p className="app-greeting">Good evening, Sam</p>
                <p className="app-headline">How can I help today?</p>
                <div className="app-suggestions">
                  <button type="button" data-suggest-first className="app-suggestion" onClick={onAsk}>
                    <CalendarIcon />
                    Book a visit
                  </button>
                  <span className="app-suggestion" aria-hidden="true">
                    <QuestionIcon />
                    Ask about pricing
                  </span>
                  <span className="app-suggestion" aria-hidden="true">
                    <PhoneIcon />
                    Talk to the team
                  </span>
                </div>
              </div>

              <div className="app-view app-view-chat" aria-hidden={home} inert={home}>
                {!home && (
                  <>
                    <p className="app-bubble-user app-in">Book a visit for next week</p>
                    <div className="app-ai app-in">
                      <span className="app-avatar app-avatar-small" aria-hidden="true">
                        <SparkIcon />
                      </span>
                      {answered ? (
                        <p className="app-ai-text app-in">Thursday at 2:00 PM is open. Shall I book it?</p>
                      ) : (
                        <span className="app-typing" aria-label="Assistant is typing">
                          <span />
                          <span />
                          <span />
                        </span>
                      )}
                    </div>

                    {answered && (
                      <div className="app-card app-in">
                        {stage === "booked" ? (
                          <div className="app-booked">
                            <span className="app-check accent-fill">
                              <CheckIcon />
                            </span>
                            <span>
                              <span className="app-booked-title">Booked</span>
                              <span className="app-booked-time">Thursday, 2:00 PM</span>
                              <span className="app-card-note">Added to your calendar</span>
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="app-card-label">Check-up · 30 min</p>
                            <p className="app-option is-on">
                              Thu, 2:00 PM
                              <span aria-hidden="true" className="app-radio" />
                            </p>
                            <p className="app-option">
                              Fri, 10:30 AM
                              <span aria-hidden="true" className="app-radio" />
                            </p>
                            <button type="button" className="app-confirm" onClick={onConfirm}>
                              Confirm<span className="sr-only"> (demo, {name})</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {stage === "booked" && (
                      <p className="app-ai-text app-follow app-in">You’re all set. I’ll send a reminder the day before.</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="app-composer" aria-hidden="true">
              <span className="app-composer-text">Ask anything</span>
              <MicIcon />
              <span className="app-send">
                <ArrowUpIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="label flex items-center gap-2 whitespace-nowrap !text-[0.6875rem] sm:!text-xs">
        {platform === "ios" ? <AppleLogo className="size-3.5" /> : <AndroidLogo className="size-3.5" />}
        {name} concept
      </figcaption>
    </figure>
  );
}
