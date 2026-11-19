"use client";

import { useRef } from "react";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The hero's visual, played by scroll, and kept to three things: what
 * comes in, one point of AI, and what goes out.
 *
 * At the top of the page five words drift loose: missed calls, emails,
 * new leads, scheduling, questions. As the visitor scrolls (the hero
 * holds still meanwhile) they line up and hairlines draw them toward one
 * point. Then light does the work: a small mint light runs each line into
 * the point, leaving a soft glow behind it; when all five have arrived
 * the point blooms once, and a luminous beam draws on to the outcome:
 * answered, booked, followed up. Scrolling back undoes it.
 *
 * At rest the light breathes, and every few seconds one input sends a
 * little light through the point and along the beam, so the system reads
 * as working rather than finished.
 *
 * Words are real markup, the hairlines are SVG, and the light is a canvas
 * above them, all measured from the layout. With reduced motion, or in a
 * window too short to hold the hero, it renders resolved and still.
 */

type RGB = readonly [number, number, number];
type Point = { x: number; y: number };
type Curve = readonly [Point, Point, Point, Point];
type Geometry = {
  width: number;
  inputs: Curve[];
  node: Point;
  beam: { x0: number; x1: number; y: number };
};

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

const MINT: RGB = [175, 254, 159];
const CYAN: RGB = [138, 240, 253];
const WHITE: RGB = [255, 255, 255];

/** How far the light's canvas reaches past the diagram on every side, px, so glow is never clipped. */
const LIGHT_PAD = 48;
/** Seconds between the resting pulses that keep the system looking alive. */
const REST_CYCLE = 6.5;

/** Layered strokes that read as a line of light: wide and faint to narrow and bright. */
const THREAD: readonly (readonly [number, number])[] = [
  [7, 0.05],
  [3, 0.13],
  [1.2, 0.85],
];
const BEAM: readonly (readonly [number, number])[] = [
  [18, 0.035],
  [8, 0.075],
  [3.5, 0.17],
  [1.5, 0.95],
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (p: number) => {
  const x = clamp(p);
  return x * x * (3 - 2 * x);
};
const easeOutCubic = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
const easeInOutSine = (p: number) => -(Math.cos(Math.PI * clamp(p)) - 1) / 2;
const bell = (p: number, centre: number, width: number) => Math.exp(-(((p - centre) / width) ** 2));
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const rgba = (c: RGB, a: number) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${clamp(a).toFixed(3)})`;

/** A point on a cubic curve. */
const pointAt = (c: Curve, t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return { x: a * c[0].x + b * c[1].x + d * c[2].x + e * c[3].x, y: a * c[0].y + b * c[1].y + d * c[2].y + e * c[3].y };
};

/** The direction of travel at a point on a cubic curve, in radians. */
const angleAt = (c: Curve, t: number) => {
  const u = 1 - t;
  const dx = 3 * u * u * (c[1].x - c[0].x) + 6 * u * t * (c[2].x - c[1].x) + 3 * t * t * (c[3].x - c[2].x);
  const dy = 3 * u * u * (c[1].y - c[0].y) + 6 * u * t * (c[2].y - c[1].y) + 3 * t * t * (c[3].y - c[2].y);
  return Math.atan2(dy, dx);
};

/** Split a cubic curve at t (de Casteljau). */
const split = (c: Curve, t: number): [Curve, Curve] => {
  const lerp = (a: Point, b: Point) => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) });
  const p01 = lerp(c[0], c[1]);
  const p12 = lerp(c[1], c[2]);
  const p23 = lerp(c[2], c[3]);
  const p012 = lerp(p01, p12);
  const p123 = lerp(p12, p23);
  const p = lerp(p012, p123);
  return [
    [c[0], p01, p012, p],
    [p, p123, p23, c[3]],
  ];
};

/** The part of a curve between two values of t. */
const segment = (c: Curve, from: number, to: number): Curve => {
  const [left] = split(c, clamp(to));
  return from <= 0 ? left : split(left, clamp(from / to))[1];
};

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
      const canvas = stage?.querySelector<HTMLCanvasElement>("[data-flow-light]");
      const context = canvas?.getContext("2d");
      if (!stage || !section || !flow || !node || !outcome || !lines || !canvas || !context) return;
      const ctx = context;

      const words = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-in]"));
      const slots = words.map((word) => word.parentElement as HTMLElement);
      const texts = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-in] .flow-word"));
      const routes = Array.from(stage.querySelectorAll<SVGPathElement>("[data-route-in]"));
      const ring = node.querySelector<HTMLElement>(".flow-node-ring");
      const core = node.querySelector<HTMLElement>(".flow-node-core");

      // Layout, measured from the page.
      let geometry: Geometry | null = null;
      let ratio = 1;
      let canvasWidth = 0;
      let canvasHeight = 0;

      /** Hairlines where the layout has put the words and the point, and the light's path beside them. */
      const route = () => {
        const box = flow.getBoundingClientRect();
        lines.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
        const hub = (ring ?? node).getBoundingClientRect();
        const nx = hub.left + hub.width / 2 - box.left;
        const ny = hub.top + hub.height / 2 - box.top;
        const reach = hub.width / 2 + 3;
        const inputs = slots.map((slot, i): Curve => {
          const a = slot.getBoundingClientRect();
          const ax = a.right - box.left + 8;
          const ay = a.top + a.height / 2 - box.top;
          const bend = (nx - reach - ax) * 0.6;
          const curve: Curve = [
            { x: ax, y: ay },
            { x: ax + bend, y: ay },
            { x: nx - reach - bend, y: ny },
            { x: nx - reach, y: ny },
          ];
          routes[i]?.setAttribute(
            "d",
            `M${ax},${ay} C${curve[1].x},${curve[1].y} ${curve[2].x},${curve[2].y} ${curve[3].x},${curve[3].y}`,
          );
          return curve;
        });
        const b = outcome.getBoundingClientRect();
        geometry = {
          width: box.width,
          inputs,
          node: { x: nx, y: ny },
          beam: { x0: nx + reach, x1: b.left - box.left - 4, y: ny },
        };

        // The canvas is sized and placed from the diagram, never from itself, so it cannot
        // feed back into the layout it measures.
        ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvasWidth = Math.min(box.width + LIGHT_PAD * 2, 4096);
        canvasHeight = Math.min(box.height + LIGHT_PAD * 2, 2048);
        Object.assign(canvas.style, {
          left: `${-LIGHT_PAD}px`,
          top: `${-LIGHT_PAD}px`,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        });
        canvas.width = Math.round(canvasWidth * ratio);
        canvas.height = Math.round(canvasHeight * ratio);
      };

      // Light, moved by the scroll timeline and read by the renderer.
      const lit = INPUTS.map(() => ({ p: 0 }));
      const beam = { p: 0 };
      const glow = { p: 0 };
      let flashAt = -Infinity;
      let restAt: number | null = null;
      let still = false;

      const strokePasses = (passes: readonly (readonly [number, number])[], level: number) => {
        for (const [width, alpha] of passes) {
          ctx.lineWidth = width;
          ctx.globalAlpha = clamp(alpha * level);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      };

      const traceCurve = (c: Curve) => {
        ctx.beginPath();
        ctx.moveTo(c[0].x, c[0].y);
        ctx.bezierCurveTo(c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y);
      };

      /** A soft point of light, stretched along its direction of travel. */
      const spark = (at: Point, angle: number, radius: number, strength: number, tint: RGB) => {
        if (strength <= 0.003) return;
        ctx.save();
        ctx.translate(at.x, at.y);
        ctx.rotate(angle);
        ctx.scale(2.4, 1);
        const light = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        light.addColorStop(0, rgba(WHITE, 0.85 * strength));
        light.addColorStop(0.2, rgba(tint, 0.4 * strength));
        light.addColorStop(1, rgba(tint, 0));
        ctx.fillStyle = light;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        ctx.restore();
      };

      const halo = (at: Point, radius: number, strength: number, tint: RGB) => {
        if (strength <= 0.003) return;
        const light = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, radius);
        light.addColorStop(0, rgba(tint, strength));
        light.addColorStop(1, rgba(tint, 0));
        ctx.fillStyle = light;
        ctx.fillRect(at.x - radius, at.y - radius, radius * 2, radius * 2);
      };

      /** A glint that brightens a stretch of the beam. */
      const glint = (x: number, strength: number) => {
        if (!geometry || strength <= 0.003) return;
        const { x0, x1, y } = geometry.beam;
        const radius = 120;
        const from = Math.max(x0, x - radius);
        const to = Math.min(x1, x + radius);
        if (to <= from) return;
        const tint = mixRGB(MINT, WHITE, 0.5);
        const shine = ctx.createLinearGradient(x - radius, 0, x + radius, 0);
        shine.addColorStop(0, rgba(tint, 0));
        shine.addColorStop(0.5, rgba(tint, 1));
        shine.addColorStop(1, rgba(tint, 0));
        ctx.strokeStyle = shine;
        ctx.beginPath();
        ctx.moveTo(from, y);
        ctx.lineTo(to, y);
        strokePasses(
          [
            [10, 0.12],
            [3.5, 0.35],
            [1.5, 1],
          ],
          strength,
        );
      };

      const render = (now: number) => {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        if (!geometry) return;
        const { inputs, node: hub, beam: line } = geometry;
        const t = now / 1000;
        // Lights are sized to the lines they run, so short lines on a phone stay delicate.
        const reach = Math.max(hub.x - (inputs[0]?.[0].x ?? hub.x), 1);
        const sparkSize = clamp(reach * 0.04, 7, 17);
        const beamSparkSize = clamp((line.x1 - line.x0) * 0.06, 9, 26);

        ctx.save();
        ctx.translate(LIGHT_PAD, LIGHT_PAD);
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Mostly green, cooling slightly toward the outcome.
        const shade = ctx.createLinearGradient(0, 0, geometry.width, 0);
        shade.addColorStop(0, rgba(MINT, 1));
        shade.addColorStop(1, rgba(mixRGB(MINT, CYAN, 0.7), 1));
        ctx.strokeStyle = shade;

        const sinceFlash = (now - flashAt) / 1000;
        const flash = sinceFlash >= 0 ? Math.exp(-sinceFlash * 2.4) : 0;
        const breathe = still ? 0 : Math.sin(t * 0.9);
        const settled = glow.p;

        // 1. Each input line glows behind the light that runs it.
        let arrivals = 0;
        inputs.forEach((curve, i) => {
          const p = lit[i].p;
          if (p <= 0.002) return;
          ctx.strokeStyle = shade;
          traceCurve(segment(curve, 0, p));
          strokePasses(THREAD, 0.62 - 0.24 * settled + 0.05 * breathe * settled);
          if (p < 0.998) {
            spark(pointAt(curve, p), angleAt(curve, p), sparkSize, smooth(p / 0.06) * (1 - smooth((p - 0.9) / 0.095)), MINT);
            arrivals += bell(p, 0.97, 0.05);
          }
        });

        // 2. At rest, one input at a time sends a little light through to the outcome.
        let passing = 0;
        if (restAt !== null && !still) {
          const r = (now - restAt) / 1000 - 1.4;
          if (r > 0) {
            const k = Math.floor(r / REST_CYCLE) % inputs.length;
            const phase = r % REST_CYCLE;
            if (phase < 1.3) {
              const q = easeInOutSine(phase / 1.3);
              const fade = 1 - smooth((q - 0.86) / 0.14);
              ctx.strokeStyle = shade;
              traceCurve(segment(inputs[k], Math.max(0, q - 0.3), Math.max(q, 0.001)));
              strokePasses(THREAD, 0.5 * fade);
              spark(pointAt(inputs[k], q), angleAt(inputs[k], q), sparkSize * 0.8, 0.75 * fade, MINT);
            }
            passing = bell(phase, 1.32, 0.16);
            if (phase > 1.25 && phase < 2.8) {
              const g = (phase - 1.25) / 1.55;
              glint(mix(line.x0, line.x1, easeInOutSine(g)), Math.sin(Math.PI * g) * 0.7);
            }
          }
        }

        // 3. The point: a lift as each light arrives, one bloom when it lights, then a slow breath.
        halo(hub, clamp(reach * 0.08, 18, 34), settled * (0.2 + 0.05 * breathe) + 0.22 * arrivals + 0.55 * flash + 0.28 * passing, MINT);
        if (sinceFlash >= 0 && sinceFlash < 1.6) {
          const p = sinceFlash / 1.6;
          ctx.strokeStyle = rgba(MINT, 0.45 * Math.pow(1 - p, 1.5));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(hub.x, hub.y, 9 + 80 * easeOutCubic(p), 0, Math.PI * 2);
          ctx.stroke();
        }

        // 4. The beam to the outcome, drawn by a light of its own.
        const b = beam.p;
        if (b > 0.002) {
          const x = mix(line.x0, line.x1, b);
          ctx.strokeStyle = shade;
          ctx.beginPath();
          ctx.moveTo(line.x0, line.y);
          ctx.lineTo(x, line.y);
          strokePasses(BEAM, 0.9 + 0.5 * flash + 0.06 * breathe * settled);
          const tint = mixRGB(MINT, CYAN, 0.5);
          if (b < 0.998) spark({ x, y: line.y }, 0, beamSparkSize, 1, tint);
          else halo({ x: line.x1, y: line.y }, 20, 0.16 + 0.04 * breathe, tint);
        }

        ctx.restore();
      };

      const mm = gsap.matchMedia();
      mm.add(
        { wide: "(min-width: 48rem)", motion: MOTION_OK, tall: "(min-height: 32rem)" },
        (context) => {
          const { wide, motion, tall } = context.conditions as Record<string, boolean>;
          const scatter = wide ? SCATTER_WIDE : SCATTER_NARROW;
          const live = motion && tall;
          still = !motion;
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

          // 2. Hairlines reach for one point. Lines are drawn through their dash attributes,
          // in fractions of each path (pathLength 1); CSS properties would be rounded.
          timeline.fromTo(node, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 2.2);
          routes.forEach((path, i) =>
            timeline.fromTo(
              path,
              { attr: { "stroke-dashoffset": 1 } },
              { attr: { "stroke-dashoffset": 0 }, duration: 1.2, ease: "power2.inOut" },
              2.4 + i * 0.16,
            ),
          );

          // 3. Light runs each line into the point, gathering speed as it goes.
          lit.forEach((light, i) =>
            timeline.fromTo(light, { p: 0 }, { p: 1, duration: 1.1, ease: "power1.in" }, 3.0 + i * 0.22),
          );

          // 4. The point lights.
          const connectAt = 5.1;
          timeline.fromTo(core, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2.2)" }, connectAt);
          timeline.fromTo(glow, { p: 0 }, { p: 1, duration: 0.9, ease: "power2.out" }, connectAt);
          timeline.to(texts, { opacity: 0.55, duration: 0.8 }, connectAt + 0.2);

          // 5. A beam draws on to what was done.
          timeline.fromTo(beam, { p: 0 }, { p: 1, duration: 1.1, ease: "power1.inOut" }, connectAt + 0.35);
          timeline.fromTo(outcome, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }, connectAt + 1.05);
          timeline.to({}, { duration: 2.4 }, connectAt + 1.95);

          // State that follows the picture: "intelligence." takes its colour as the point
          // lights; the bloom plays once, in time, when it lights going forward.
          let connected: boolean | null = null;
          const sync = () => {
            const on = timeline.time() >= connectAt;
            if (on !== connected) {
              if (on && connected === false && live) flashAt = performance.now();
              connected = on;
              if (on) section.dataset.connected = "";
              else delete section.dataset.connected;
            }
            if (beam.p >= 0.998) restAt ??= performance.now();
            else restAt = null;
            if (!live) render(performance.now());
          };
          timeline.eventCallback("onUpdate", sync);

          if (live) {
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
              animation: timeline,
              invalidateOnRefresh: true,
              onRefresh: route,
            });
          } else {
            timeline.progress(1);
          }
          sync();
          flow.dataset.ready = "";

          // The light draws every frame while the hero is on screen; without motion, only when asked.
          let frame = 0;
          let onScreen = true;
          const loop = (now: number) => {
            frame = 0;
            render(now);
            schedule();
          };
          function schedule() {
            if (frame || !live || !onScreen || document.hidden) return;
            frame = requestAnimationFrame(loop);
          }
          const view = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            schedule();
          });
          view.observe(section);
          document.addEventListener("visibilitychange", schedule);

          const resize = new ResizeObserver(() => {
            route();
            if (!live) render(performance.now());
          });
          resize.observe(flow);
          schedule();
          if (!live) render(performance.now());

          return () => {
            cancelAnimationFrame(frame);
            view.disconnect();
            resize.disconnect();
            document.removeEventListener("visibilitychange", schedule);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flashAt = -Infinity;
            restAt = null;
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
              <span className="flow-node-core" />
            </span>
            <span className="flow-node-label label">AI</span>
          </div>

          <p className="flow-out" data-flow-out>
            <span className="flow-out-dot" />
            <span>{OUTCOME}</span>
          </p>

          <svg className="flow-lines" data-flow-lines preserveAspectRatio="none">
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
          </svg>
          <canvas className="flow-light" data-flow-light />
        </div>
      </div>
    </div>
  );
}
