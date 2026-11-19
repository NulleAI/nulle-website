"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";

import { AndroidLogo, AppleLogo } from "@/components/ui/Icons";
import { prefersReducedMotion } from "@/lib/gsap";

import {
  ArrowLeftIcon,
  ArrowUpIcon,
  BedIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  CompassIcon,
  DiningIcon,
  GuestsIcon,
  LeafIcon,
  MoonIcon,
  PinIcon,
  ProfileIcon,
  SparkleIcon,
  SuitcaseIcon,
  TeaIcon,
  TrainIcon,
} from "./AtlasIcons";
import { KyotoMap } from "./AtlasMap";
import { photoOrder, photos } from "./atlasPhotos";
import { SceneLayout, useScene, type SceneProps } from "./parts";
import { atlas, demoById, type PhotoId, type Stop, type StopKind } from "./scenarios";

const demo = demoById("mobile");

type Platform = "ios" | "android";
/** Where the visitor is: Discover (asking), Curate (Atlas at work), Explore (the plan). */
type Stage = "ask" | "thinking" | "result";

/** How long Atlas takes to curate; the map and steps in CSS are timed to it. */
const THINKING_MS = 2600;

const requestWords = atlas.request.split(" ");
const heldCount = atlas.days.flatMap((day) => day.stops).filter((stop) => stop.held).length;

const kindIcon: Record<StopKind, React.ComponentType<{ className?: string }>> = {
  stay: BedIcon,
  dining: DiningIcon,
  sight: PinIcon,
  tea: TeaIcon,
  nature: LeafIcon,
  transfer: TrainIcon,
};

const kindLabel: Record<StopKind, string> = {
  stay: "Stay",
  dining: "Dining",
  sight: "Sight",
  tea: "Tea",
  nature: "Walk",
  transfer: "Travel",
};

/** Device widths the photos are drawn at, for next/image. */
const sizes = {
  full: "(min-width: 64rem) 18rem, 74vw",
  wide: "(min-width: 64rem) 16rem, 66vw",
  card: "(min-width: 64rem) 10rem, 40vw",
  thumb: "5rem",
};

/**
 * Atlas, a concept AI travel concierge, in one phone. Discover: a request
 * is chosen. Curate: Atlas picks the stay, the table and the walks while
 * the route draws across Kyoto. Explore: the weekend, told in photographs,
 * to scroll, browse by day and reserve. About 5s to the plan, and every
 * step can be tapped through by hand.
 *
 * The same app is drawn natively for iOS and for Android; the switch
 * changes the device and the platform details, never the app.
 */
export function MobileScene({ play, run }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // Once the visitor taps anything, the timeline stops steering.
  const visitor = useRef(false);

  const [platform, setPlatform] = useState<Platform>("ios");
  // Authored in its final state: the plan. The timeline starts it from Discover.
  const [stage, setStage] = useState<Stage>("result");
  const [chosen, setChosen] = useState(true);
  const [day, setDay] = useState(0);
  const [direction, setDirection] = useState(1);
  const [browsed, setBrowsed] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Curating takes a moment, then the weekend appears, from the top.
  useEffect(() => {
    if (stage !== "thinking") return;
    scroller.current?.scrollTo({ top: 0 });
    const done = window.setTimeout(() => setStage("result"), prefersReducedMotion() ? 0 : THINKING_MS);
    return () => window.clearTimeout(done);
  }, [stage]);

  const restart = () => {
    setStage("ask");
    setChosen(false);
  };
  const plan = () => {
    setDay(0);
    setDirection(1);
    setBrowsed(false);
    setReserved(false);
    setScrolled(false);
    setStage("thinking");
  };
  const pickDay = (index: number) => {
    setDirection(index > day ? 1 : -1);
    setDay(index);
    setBrowsed(true);
  };
  /** A visitor's tap: take over from the timeline, then act. */
  const tap = (action: () => void) => () => {
    visitor.current = true;
    action();
  };

  useScene(root, play, [run], (scene, timeline) => {
    visitor.current = false;
    restart();
    const auto = (action: () => void) => () => {
      if (!visitor.current) action();
    };
    timeline
      .from(scene.querySelector("[data-device]"), { opacity: 0, y: 32, duration: 1, ease: "expo.out" }, 0)
      .to(scene.querySelector("[data-atlas-suggest]"), { scale: 0.97, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1 }, 1.05)
      .call(auto(() => setChosen(true)), undefined, 1.15)
      .to(scene.querySelector("[data-atlas-send]"), { scale: 0.86, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1 }, 2.1)
      .call(auto(plan), undefined, 2.25);
  });

  const name = platform === "ios" ? "iOS" : "Android";
  const BackIcon = platform === "ios" ? ChevronLeftIcon : ArrowLeftIcon;
  const current = atlas.days[day];
  // Status bar: white over the opening photograph, ink everywhere else.
  const tone = stage === "result" && !scrolled ? "light" : "dark";

  return (
    <SceneLayout
      label={demo.label}
      title={demo.title}
      summary={demo.summary}
      aside={
        <div>
          <p className="label">Interactive concept · Atlas</p>
          <p className="mt-3 max-w-[34ch] text-[0.9375rem] leading-snug text-fg-mute">
            An AI travel concierge, designed for this demonstration. Not a released product.
          </p>
          <div role="group" aria-label="Show the app on" className="segmented mt-6">
            {(["ios", "android"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={platform === item}
                onClick={() => setPlatform(item)}
                className="segmented-option"
              >
                {item === "ios" ? <AppleLogo className="size-3.5" /> : <AndroidLogo className="size-4" />}
                {item === "ios" ? "iOS" : "Android"}
              </button>
            ))}
          </div>
          <details className="atlas-credits mt-6">
            <summary className="label">Photo credits</summary>
            <ul>
              {photoOrder.map((id) => {
                const { credit } = photos[id];
                return (
                  <li key={id}>
                    <a href={credit.source} target="_blank" rel="noreferrer">
                      {credit.title}
                    </a>{" "}
                    by {credit.author},{" "}
                    <a href={credit.licenceUrl} target="_blank" rel="noreferrer">
                      {credit.licence}
                    </a>
                  </li>
                );
              })}
            </ul>
            <p>All from Wikimedia Commons, resized and cropped for display.</p>
          </details>
        </div>
      }
    >
      <div ref={root} className="atlas-stage">
        <figure
          data-device
          data-platform={platform}
          className="atlas-device"
          aria-label={`Atlas, an interactive concept app, on ${name}`}
        >
          <span aria-hidden="true" className="atlas-key atlas-key-1" />
          <span aria-hidden="true" className="atlas-key atlas-key-2" />
          <span aria-hidden="true" className="atlas-key atlas-key-3" />
          <span aria-hidden="true" className="atlas-key atlas-key-4" />

          <div className="atlas-frame">
            <div className="atlas-screen" data-tone={tone}>
              <div className="atlas-app" data-stage={stage}>
                {/* 1. Discover */}
                <section
                  data-view="ask"
                  className="atlas-view atlas-discover"
                  aria-hidden={stage !== "ask"}
                  inert={stage !== "ask"}
                >
                  <div className="atlas-top atlas-in">
                    <span className="atlas-masthead">Atlas</span>
                    <span aria-hidden="true" className="atlas-avatar">
                      S
                    </span>
                  </div>

                  <div className="atlas-discover-body">
                    <p className="atlas-greeting atlas-in" style={{ "--k": 1 } as React.CSSProperties}>
                      Good evening, Sam
                    </p>
                    <p className="atlas-headline atlas-in" style={{ "--k": 2 } as React.CSSProperties}>
                      Where to next?
                    </p>

                    <div className="atlas-in" style={{ "--k": 3 } as React.CSSProperties}>
                      <div className="atlas-field" data-filled={chosen || undefined}>
                        <SparkleIcon className="atlas-field-icon" />
                        <p className="atlas-field-text">
                          {chosen ? (
                            requestWords.map((word, index) => (
                              <Fragment key={index}>
                                <span className="atlas-word" style={{ "--w": index } as React.CSSProperties}>
                                  {word}
                                </span>{" "}
                              </Fragment>
                            ))
                          ) : (
                            <span className="atlas-placeholder">Describe a journey</span>
                          )}
                        </p>
                        <button
                          type="button"
                          data-atlas-send
                          disabled={!chosen}
                          onClick={tap(plan)}
                          className="atlas-send"
                          aria-label="Plan my trip (demo)"
                        >
                          <ArrowUpIcon />
                        </button>
                      </div>
                    </div>

                    <p className="atlas-kicker atlas-in" style={{ "--k": 4 } as React.CSSProperties}>
                      Curated for you
                    </p>
                    <ul className="atlas-journeys">
                      {atlas.journeys.map((journey, index) => {
                        const content = (
                          <>
                            <span className="atlas-journey-photo">
                              <Photo id={journey.photo} sizes={sizes.card} decorative />
                            </span>
                            <span className="atlas-journey-text">
                              <span className="atlas-journey-place">{journey.place}</span>
                              <span className="atlas-journey-prompt">{journey.prompt}</span>
                            </span>
                            {journey.request && (
                              <span aria-hidden="true" className="atlas-journey-check">
                                <CheckIcon />
                              </span>
                            )}
                          </>
                        );
                        return (
                          <li key={journey.place} className="atlas-in" style={{ "--k": 5 + index } as React.CSSProperties}>
                            {journey.request ? (
                              <button
                                type="button"
                                data-atlas-suggest
                                aria-pressed={chosen}
                                onClick={tap(() => setChosen(true))}
                                className="atlas-journey"
                              >
                                {content}
                              </button>
                            ) : (
                              <span aria-hidden="true" className="atlas-journey">
                                {content}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <nav aria-hidden="true" className="atlas-tabbar">
                    {[
                      { label: "Discover", Icon: CompassIcon },
                      { label: "Trips", Icon: SuitcaseIcon },
                      { label: "Saved", Icon: BookmarkIcon },
                      { label: "Profile", Icon: ProfileIcon },
                    ].map(({ label, Icon }, index) => (
                      <span key={label} className="atlas-tab" data-active={index === 0 || undefined}>
                        <span className="atlas-tab-icon">
                          <Icon />
                        </span>
                        {label}
                      </span>
                    ))}
                  </nav>
                </section>

                {/* 2. Curate */}
                <section
                  data-view="thinking"
                  className="atlas-view atlas-curate"
                  aria-hidden={stage !== "thinking"}
                  inert={stage !== "thinking"}
                >
                  <div className="atlas-curate-head">
                    <SparkleIcon className="atlas-curate-spark" />
                    Curating your weekend
                  </div>
                  <span aria-hidden="true" className="atlas-progress" />
                  <p className="atlas-curate-request">{atlas.request}</p>
                  <div className="atlas-map">
                    <KyotoMap />
                  </div>
                  <ol className="atlas-picks">
                    {atlas.curating.map((pick, index) => (
                      <li key={pick.text} className="atlas-pick" style={{ "--k": index } as React.CSSProperties}>
                        <span className="atlas-pick-photo">
                          <Photo id={pick.photo} sizes={sizes.thumb} decorative />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="atlas-pick-label">{pick.label}</span>
                          <span className="atlas-pick-text">{pick.text}</span>
                        </span>
                        <span aria-hidden="true" className="atlas-pick-status">
                          <span className="atlas-spinner" />
                          <CheckIcon className="atlas-pick-check" />
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* 3. Explore */}
                <section
                  data-view="result"
                  className="atlas-view atlas-explore"
                  aria-hidden={stage !== "result"}
                  inert={stage !== "result"}
                >
                  <div
                    ref={scroller}
                    className="atlas-scroll"
                    onScroll={(event) => {
                      const element = event.currentTarget;
                      setScrolled(element.scrollTop > element.clientWidth * 0.62);
                    }}
                  >
                    <div className="atlas-hero">
                      <div className="atlas-hero-parallax">
                        <div className="atlas-hero-photo">
                          <Photo id="kyotoHero" sizes={sizes.full} />
                        </div>
                      </div>
                    </div>

                    <div className="atlas-sheet">
                      <p className="atlas-eyebrow atlas-reveal">{atlas.trip.place}</p>
                      <p className="atlas-title atlas-reveal" style={{ "--k": 1 } as React.CSSProperties}>
                        {atlas.trip.title}
                      </p>
                      <ul className="atlas-facts atlas-reveal" style={{ "--k": 2 } as React.CSSProperties}>
                        <li>
                          <CalendarIcon />
                          Fri – Sun
                        </li>
                        <li>
                          <MoonIcon />2 nights
                        </li>
                        <li>
                          <GuestsIcon />2 guests
                        </li>
                      </ul>
                      <div className="atlas-note atlas-reveal" style={{ "--k": 3 } as React.CSSProperties}>
                        <SparkleIcon className="atlas-note-icon" />
                        <p>{atlas.trip.note}</p>
                      </div>

                      <section className="atlas-section atlas-reveal" style={{ "--k": 4 } as React.CSSProperties}>
                        <p className="atlas-kicker">Where you’ll stay</p>
                        <article className="atlas-stay">
                          <div className="atlas-stay-photo">
                            <Photo id={atlas.trip.stay.photo} sizes={sizes.wide} />
                          </div>
                          <p className="atlas-stay-title">{atlas.trip.stay.title}</p>
                          <p className="atlas-stay-detail">{atlas.trip.stay.detail}</p>
                          <p className="atlas-stay-foot">
                            <span>
                              <MoonIcon />2 nights
                            </span>
                            <Held reserved={reserved} />
                          </p>
                        </article>
                      </section>

                      <section className="atlas-section atlas-reveal" style={{ "--k": 5 } as React.CSSProperties}>
                        <p className="atlas-kicker">Your itinerary</p>
                        <div
                          role="group"
                          aria-label="Day"
                          className="atlas-days"
                          style={{ "--day": day } as React.CSSProperties}
                        >
                          <span aria-hidden="true" className="atlas-days-thumb" />
                          {atlas.days.map((item, index) => (
                            <button
                              key={item.label}
                              type="button"
                              aria-pressed={day === index}
                              onClick={tap(() => pickDay(index))}
                              className="atlas-day"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <div
                          key={day}
                          className="atlas-day-panel"
                          data-direction={direction}
                          data-browsed={browsed || undefined}
                        >
                          <p className="atlas-day-theme">{current.theme}</p>
                          <ol className="atlas-stops">
                            {current.stops.map((stop, index) => (
                              <StopItem key={stop.title} stop={stop} index={index} reserved={reserved} />
                            ))}
                          </ol>
                        </div>
                      </section>
                    </div>
                  </div>

                  <div className="atlas-topbar" data-solid={scrolled || undefined}>
                    <button
                      type="button"
                      onClick={tap(restart)}
                      className="atlas-icon-button"
                      aria-label="Back to Discover (demo)"
                    >
                      <BackIcon />
                    </button>
                    <p aria-hidden="true" className="atlas-topbar-title">
                      {atlas.trip.title}
                    </p>
                    <span aria-hidden="true" className="atlas-icon-button">
                      <BookmarkIcon />
                    </span>
                  </div>

                  <div className="atlas-dock">
                    <div className="min-w-0 flex-1">
                      <p className="atlas-dock-title" aria-live="polite">
                        {reserved ? "Weekend reserved" : `${heldCount} bookings held`}
                      </p>
                      <p className="atlas-dock-sub">Fri – Sun · 2 guests</p>
                    </div>
                    <button
                      type="button"
                      onClick={tap(() => setReserved(true))}
                      disabled={reserved}
                      data-done={reserved || undefined}
                      className="atlas-cta"
                    >
                      {reserved && <CheckIcon />}
                      {reserved ? "Reserved" : "Reserve"}
                      <span className="sr-only"> (demo, nothing is booked)</span>
                    </button>
                  </div>
                </section>
              </div>

              <div aria-hidden="true" className="atlas-status">
                <span className="atlas-time">9:41</span>
                <span className="atlas-camera" />
                <StatusIcons platform={platform} />
              </div>
              <span aria-hidden="true" className="atlas-home" />
              <span aria-hidden="true" className="atlas-glass" />
            </div>
          </div>
        </figure>
      </div>
    </SceneLayout>
  );
}

/** A photograph from Atlas's library, cropped to fill its frame. */
function Photo({ id, sizes, decorative = false }: { id: PhotoId; sizes: string; decorative?: boolean }) {
  const photo = photos[id];
  return (
    <Image
      src={photo.src}
      alt={decorative ? "" : photo.alt}
      fill
      sizes={sizes}
      placeholder="blur"
      className="atlas-photo"
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
    />
  );
}

/** A booking Atlas is holding, then confirmed once the weekend is reserved. */
function Held({ reserved }: { reserved: boolean }) {
  return (
    <span className="atlas-held" data-reserved={reserved || undefined}>
      {reserved ? <CheckIcon /> : <span aria-hidden="true" className="atlas-held-dot" />}
      {reserved ? "Reserved" : "Held"}
    </span>
  );
}

/** One stop: the day's lead is told large in a photograph; the rest sit in rows. */
function StopItem({ stop, index, reserved }: { stop: Stop; index: number; reserved: boolean }) {
  const Icon = kindIcon[stop.kind];
  const meta = (
    <p className="atlas-stop-meta">
      <span className="atlas-stop-time">{stop.time}</span>
      <span className="atlas-stop-kind">
        <Icon />
        {kindLabel[stop.kind]}
      </span>
      {stop.held && <Held reserved={reserved} />}
    </p>
  );

  if (stop.feature && stop.photo) {
    return (
      <li className="atlas-stop atlas-stop-feature" style={{ "--k": index } as React.CSSProperties}>
        <div className="atlas-stop-photo">
          <Photo id={stop.photo} sizes={sizes.wide} />
        </div>
        {meta}
        <p className="atlas-stop-title">{stop.title}</p>
        <p className="atlas-stop-detail">{stop.detail}</p>
      </li>
    );
  }

  return (
    <li className="atlas-stop atlas-stop-row" style={{ "--k": index } as React.CSSProperties}>
      {stop.photo ? (
        <div className="atlas-stop-thumb">
          <Photo id={stop.photo} sizes={sizes.thumb} />
        </div>
      ) : (
        <div aria-hidden="true" className="atlas-stop-thumb atlas-stop-glyph">
          <Icon />
        </div>
      )}
      <div className="min-w-0">
        {meta}
        <p className="atlas-stop-title">{stop.title}</p>
        <p className="atlas-stop-detail">{stop.detail}</p>
      </div>
    </li>
  );
}

/** Signal, Wi-Fi and battery, drawn the way each platform draws them. */
function StatusIcons({ platform }: { platform: Platform }) {
  if (platform === "android") {
    return (
      <svg viewBox="0 0 44 12" className="atlas-status-icons" fill="currentColor">
        <path d="M7 11.5.6 4.3a9.6 9.6 0 0 1 12.8 0Z" />
        <path d="M17 11.5h10v-10Z" />
        <rect x="34" y="1.6" width="6.4" height="10" rx="1.3" />
        <rect x="35.6" y="0.4" width="3.2" height="1.6" rx="0.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 68 12" className="atlas-status-icons" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="0.8" />
      <rect x="4.5" y="6" width="3" height="6" rx="0.8" />
      <rect x="9" y="3.5" width="3" height="8.5" rx="0.8" />
      <rect x="13.5" y="1" width="3" height="11" rx="0.8" />
      <path d="M29 11.4 26.9 9a3 3 0 0 1 4.2 0Z" />
      <path
        d="M24.3 6.8a6.6 6.6 0 0 1 9.4 0M21.7 4a10.4 10.4 0 0 1 14.6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="42" y="1.5" width="22" height="9" rx="2.6" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <rect x="44" y="3.5" width="16" height="5" rx="1.3" />
      <path d="M65.6 4.4v3.2a1.7 1.7 0 0 0 0-3.2Z" fillOpacity="0.45" />
    </svg>
  );
}
