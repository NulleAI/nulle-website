"use client";

import { useRef } from "react";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The hero's visual, played by scroll, and kept to three things: what
 * comes in, one point of AI, and what goes out.
 *
 * At the top of the page five words drift loose: missed calls, emails,
 * new leads, scheduling, questions. As the visitor scrolls (the hero
 * holds still meanwhile) they line up, five hairlines draw them into one
 * point, the point lights, and a single line carries on to the outcome:
 * answered, booked, followed up. Scrolling back undoes it.
 *
 * Words are real markup and the lines are SVG, laid out by CSS and
 * measured here. With reduced motion, or in a window too short to hold
 * the hero, it renders resolved.
 */

const INPUTS = ["Missed calls", "Emails", "New leads", "Scheduling", "Questions"] as const;
const OUTCOME = "Answered, booked, followed up.";

/** Where each word drifts before it lines up: its top-left, as a share of the free space. */
const SCATTER_WIDE: [number, number][] = [
  [0.12, 0.1],
  [0.46, 0.72],
  [0.3, 0.34],
  [0.66, 0.18],
  [0.56, 0.9],
];
const SCATTER_NARROW: [number, number][] = [
  [0.5, 0.04],
  [0.04, 0.44],
  [0.66, 0.62],
  [0.18, 0.2],
  [0.34, 0.92],
];
/** How present each word is while loose. */
const SCATTER_OPACITY = [0.95, 0.6, 0.8, 0.5, 0.7];

export function HeroWorkflow() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = root.current;
      const section = stage?.closest("section");
      const flow = stage?.querySelector<HTMLElement>("[data-flow]");
      const node = stage?.querySelector<HTMLElement>("[data-flow-node]");
      const outcome = stage?.querySelector<HTMLElement>("[data-flow-out]");
      const lines = stage?.querySelector<SVGSVGElement>("[data-flow-lines]");
      if (!stage || !section || !flow || !node || !outcome || !lines) return;

      const words = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-in]"));
      const slots = words.map((word) => word.parentElement as HTMLElement);
      const texts = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-in] .flow-word"));
      const routesIn = Array.from(stage.querySelectorAll<SVGPathElement>("[data-route-in]"));
      const routeOut = stage.querySelector<SVGPathElement>("[data-route-out]");
      const pulse = stage.querySelector<SVGPathElement>("[data-route-pulse]");
      const ring = node.querySelector<HTMLElement>(".flow-node-ring");
      const core = node.querySelector<HTMLElement>(".flow-node-core");
      const ripple = node.querySelector<HTMLElement>(".flow-node-ripple");
      const label = node.querySelector<HTMLElement>(".flow-node-label");

      /** Draw the lines where the layout has put the words, the point and the outcome. */
      const route = () => {
        const box = flow.getBoundingClientRect();
        lines.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
        const hub = (ring ?? node).getBoundingClientRect();
        const nx = hub.left + hub.width / 2 - box.left;
        const ny = hub.top + hub.height / 2 - box.top;
        const reach = hub.width / 2 + 3;
        slots.forEach((slot, i) => {
          const a = slot.getBoundingClientRect();
          const ax = a.right - box.left + 8;
          const ay = a.top + a.height / 2 - box.top;
          const bend = (nx - reach - ax) * 0.6;
          routesIn[i]?.setAttribute(
            "d",
            `M${ax},${ay} C${ax + bend},${ay} ${nx - reach - bend},${ny} ${nx - reach},${ny}`,
          );
        });
        const b = outcome.getBoundingClientRect();
        const out = `M${nx + reach},${ny} L${b.left - box.left - 8},${ny}`;
        routeOut?.setAttribute("d", out);
        pulse?.setAttribute("d", out);
      };

      const mm = gsap.matchMedia();
      mm.add(
        { wide: "(min-width: 48rem)", motion: MOTION_OK, tall: "(min-height: 32rem)" },
        (context) => {
          const { wide, motion, tall } = context.conditions as Record<string, boolean>;
          const scatter = wide ? SCATTER_WIDE : SCATTER_NARROW;
          route();

          /** How far a word sits from its place while loose. */
          const offset = (i: number, axis: "x" | "y") => {
            const area = flow.getBoundingClientRect();
            const band = stage.getBoundingClientRect();
            const slot = slots[i].getBoundingClientRect();
            const word = words[i];
            if (axis === "x") return scatter[i][0] * (area.width - word.offsetWidth) - (slot.right - word.offsetWidth - area.left);
            const top = band.top + (wide ? 96 : 80);
            const room = Math.max(band.bottom - 16 - top - word.offsetHeight, 0);
            return top + scatter[i][1] * room - slot.top;
          };

          // Lines are drawn through their dash attributes, in fractions of each path
          // (pathLength 1). CSS properties would be rounded to whole pixels.
          const draw = (path: SVGPathElement | null, duration: number) => [
            path,
            { attr: { "stroke-dashoffset": 1 } },
            { attr: { "stroke-dashoffset": 0 }, duration, ease: "power2.inOut" },
          ] as const;

          const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });

          // 1. The loose words line up.
          words.forEach((word, i) => {
            timeline.fromTo(
              word,
              { x: () => offset(i, "x"), y: () => offset(i, "y"), opacity: SCATTER_OPACITY[i] },
              { x: 0, y: 0, opacity: 1, duration: 2.4, ease: "power3.inOut" },
              i * 0.15,
            );
          });
          timeline.fromTo(flow, { "--float": 1 }, { "--float": 0, duration: 1.4 }, 0);

          // 2. Each is drawn into one point.
          timeline.fromTo(node, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 2.2);
          routesIn.forEach((path, i) => timeline.fromTo(...draw(path, 1.4), 2.4 + i * 0.16));

          // 3. The point lights.
          const connectAt = 4.5;
          timeline.fromTo(core, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2.2)" }, connectAt);
          timeline.fromTo(ripple, { opacity: 0.5, scale: 1 }, { opacity: 0, scale: 3.4, duration: 1.3, ease: "power2.out" }, connectAt);
          timeline.to(texts, { opacity: 0.5, duration: 0.8 }, connectAt + 0.2);

          // 4. One line on, to what was done.
          timeline.fromTo(...draw(routeOut, 0.9), connectAt + 0.4);
          timeline.fromTo(
            pulse,
            { attr: { "stroke-dashoffset": 0.2 } },
            { attr: { "stroke-dashoffset": -1 }, duration: 1.1, ease: "power1.inOut" },
            connectAt + 0.4,
          );
          timeline.fromTo(outcome, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }, connectAt + 1);
          timeline.to({}, { duration: 2.2 }, connectAt + 1.9);

          // "intelligence." takes its colour when the point lights.
          let connected = false;
          const sync = () => {
            const on = timeline.time() >= connectAt;
            if (on === connected) return;
            connected = on;
            if (on) section.dataset.connected = "";
            else delete section.dataset.connected;
          };
          timeline.eventCallback("onUpdate", sync);

          if (motion && tall) {
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.8,
              animation: timeline,
              invalidateOnRefresh: true,
              onRefresh: route,
            });
          } else {
            timeline.progress(1);
          }
          sync();
          flow.dataset.ready = "";

          const resize = new ResizeObserver(route);
          resize.observe(flow);
          if (label) resize.observe(label);

          return () => {
            resize.disconnect();
            delete section.dataset.connected;
            delete flow.dataset.ready;
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="relative flex min-h-[11rem] flex-1 flex-col pt-16 lg:pt-[4.5rem]"
    >
      <div className="shell flex flex-1 items-center">
        <div className="flow" data-flow>
          <ol className="flow-in">
            {INPUTS.map((input, i) => (
              <li key={input} className="flow-slot">
                <span className="flow-item" data-flow-in>
                  <span className="flow-body" style={{ "--n": i } as React.CSSProperties}>
                    <span className="flow-word">{input}</span>
                    <span className="flow-dot" />
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flow-node" data-flow-node>
            <span className="flow-node-ring">
              <span className="flow-node-ripple" />
              <span className="flow-node-core" />
            </span>
            <span className="flow-node-label label">AI</span>
          </div>

          <p className="flow-out" data-flow-out>
            <span className="flow-out-dot" />
            <span>{OUTCOME}</span>
          </p>

          <svg className="flow-lines" data-flow-lines preserveAspectRatio="none">
            <defs>
              <linearGradient id="flow-accent" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="var(--color-mint)" />
                <stop offset="1" stopColor="var(--color-cyan)" />
              </linearGradient>
            </defs>
            {INPUTS.map((input) => (
              <path
                key={input}
                data-route-in
                className="flow-route"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
              />
            ))}
            <path data-route-out className="flow-route flow-route-out" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            <path
              data-route-pulse
              className="flow-pulse"
              pathLength={1}
              strokeDasharray="0.2 1.4"
              strokeDashoffset="0.2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
