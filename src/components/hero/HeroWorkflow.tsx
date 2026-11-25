"use client";

import { useRef } from "react";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import {
  BookIcon,
  ChatIcon,
  CheckIcon,
  DocumentIcon,
  FlowIcon,
  IdeaIcon,
  SparkIcon,
} from "@/components/ui/Icons";

/**
 * The hero's visual: what comes in, one point of AI, and what goes out,
 * played by scroll.
 *
 * On load, five inputs (conversations, workflows, data and documents,
 * knowledge, ideas and products), each a word with its icon, fade in where
 * they lie and float loosely. As the visitor scrolls (the hero holds still
 * meanwhile) they line up, hairlines reach toward one point, a small mint
 * light runs each line in, the point lights once, and a beam carries on to
 * the outcome, two short lines arriving in turn: imagine more, build
 * smarter. Scrolling back undoes it. Once resolved, the light breathes and
 * every few seconds one input sends a little light through the point and
 * along the beam.
 *
 * Text and icons are real markup laid out by CSS (a row from tablet width
 * up, a column on phones). Lines and light are one canvas, redrawn each
 * frame from where the elements actually are. With reduced motion, or in
 * a window too short to hold the hero, it renders resolved and still.
 */

type RGB = readonly [number, number, number];
type Point = { x: number; y: number };
type Curve = readonly [Point, Point, Point, Point];

/** What comes in. The short word is used on phones, where five sit in one row. */
const INPUTS = [
  { label: "Conversations", short: "Chats", Icon: ChatIcon },
  { label: "Workflows", short: "Workflows", Icon: FlowIcon },
  { label: "Data & documents", short: "Data", Icon: DocumentIcon },
  { label: "Knowledge", short: "Knowledge", Icon: BookIcon },
  { label: "Ideas & products", short: "Ideas", Icon: IdeaIcon },
] as const;
/** What goes out, one line each. */
const OUTCOME = ["Imagine more.", "Build smarter."] as const;

/**
 * Where each input floats before it lines up: its top-left, as a share of the free space.
 * Along the axis they line up on (down the column from tablet width up, across the row on
 * phones) they keep their final order, so no two paths cross; neighbours on that axis sit
 * far apart on the other, so no label runs into another on the way, drift included.
 */
const SCATTER_WIDE: [number, number][] = [
  [0.12, 0.04],
  [0.7, 0.18],
  [0.26, 0.34],
  [0.44, 0.72],
  [0.66, 0.9],
];
const SCATTER_NARROW: [number, number][] = [
  [0.06, 0.04],
  [0.2, 0.4],
  [0.34, 0.86],
  [0.52, 0.12],
  [0.72, 0.58],
];
/** How present each input is while loose. */
const SCATTER_OPACITY = [0.95, 0.6, 0.8, 0.5, 0.7];

const MINT: RGB = [175, 254, 159];
const CYAN: RGB = [138, 240, 253];
const WHITE: RGB = [255, 255, 255];
const HAIRLINE = "rgba(246,246,242,0.22)";

/** How far the canvas reaches past the diagram on every side, px, so glow is never clipped. */
const LIGHT_PAD = 48;
/** Paper, for the faint threads and motes drawn while the inputs are loose. */
const PAPER: RGB = [246, 246, 242];
/** Seconds for a mote to cross each loose thread (one per input), and when each starts. */
const MOTE_PERIOD = [6.4, 7.6, 5.8, 8.2, 7] as const;
const MOTE_PHASE = [0.1, 0.62, 0.35, 0.85, 0.5] as const;
/** Seconds between the resting pulses. */
const REST_CYCLE = 6.5;

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
const GLINT: readonly (readonly [number, number])[] = [
  [10, 0.12],
  [3.5, 0.35],
  [1.5, 1],
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
/**
 * The faintest light worth drawing. Anything fainter can't show on screen, and Safari draws
 * near-zero alpha with "lighter" as solid white: each fading pulse flashed a white stroke.
 */
const MIN_ALPHA = 1 / 255;
const rgba = (c: RGB, a: number) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${(a >= MIN_ALPHA ? clamp(a) : 0).toFixed(3)})`;

const pointAt = (c: Curve, t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return { x: a * c[0].x + b * c[1].x + d * c[2].x + e * c[3].x, y: a * c[0].y + b * c[1].y + d * c[2].y + e * c[3].y };
};

const angleAt = (c: Curve, t: number) => {
  const u = 1 - t;
  const dx = 3 * u * u * (c[1].x - c[0].x) + 6 * u * t * (c[2].x - c[1].x) + 3 * t * t * (c[3].x - c[2].x);
  const dy = 3 * u * u * (c[1].y - c[0].y) + 6 * u * t * (c[2].y - c[1].y) + 3 * t * t * (c[3].y - c[2].y);
  return Math.atan2(dy, dx);
};

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
      const hubElement = stage?.querySelector<HTMLElement>("[data-flow-hub]");
      const node = stage?.querySelector<HTMLElement>("[data-flow-node]");
      const outcome = stage?.querySelector<HTMLElement>("[data-flow-out]");
      const done = stage?.querySelector<HTMLElement>("[data-flow-done]");
      const canvas = stage?.querySelector<HTMLCanvasElement>("[data-flow-light]");
      const context = canvas?.getContext("2d");
      if (!stage || !section || !flow || !hubElement || !node || !outcome || !done || !canvas || !context) return;
      const ctx = context;

      const items = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-in]"));
      const chips = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-chip]"));
      const words = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-in] .flow-word"));
      const core = hubElement.querySelector<HTMLElement>(".flow-node-core");

      // Progress of each part of the drawing, moved by the entrance timeline.
      const drawn = INPUTS.map(() => ({ p: 0 }));
      const lit = INPUTS.map(() => ({ p: 0 }));
      const beam = { p: 0 };
      const glow = { p: 0 };
      // How present the loose, ambient layer is: 1 before scrolling, 0 once the inputs line up.
      const ambient = { a: 1 };
      let readyAt = Infinity;
      let flashAt = -Infinity;
      let restAt: number | null = null;
      let still = false;
      let horizontal = true;

      let ratio = 1;
      let canvasWidth = 0;
      let canvasHeight = 0;
      // Where the diagram's top-left corner sits on the canvas.
      let originX = LIGHT_PAD;
      let originY = LIGHT_PAD;

      /**
       * The canvas covers the diagram (with room for glow) and the whole band
       * the loose inputs float in. It is sized from those, never from itself,
       * and capped.
       */
      const size = () => {
        const box = flow.getBoundingClientRect();
        const band = stage.getBoundingClientRect();
        const left = Math.min(-LIGHT_PAD, band.left - box.left);
        const top = Math.min(-LIGHT_PAD, band.top - box.top);
        const right = Math.max(box.width + LIGHT_PAD, band.right - box.left);
        const bottom = Math.max(box.height + LIGHT_PAD, band.bottom - box.top);
        ratio = Math.min(window.devicePixelRatio || 1, 2);
        originX = -left;
        originY = -top;
        canvasWidth = Math.min(right - left, 4096);
        canvasHeight = Math.min(bottom - top, 2048);
        Object.assign(canvas.style, {
          left: `${left}px`,
          top: `${top}px`,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        });
        canvas.width = Math.round(canvasWidth * ratio);
        canvas.height = Math.round(canvasHeight * ratio);
      };

      /** Where everything is right now, relative to the diagram. */
      const measure = () => {
        const box = flow.getBoundingClientRect();
        const hub = hubElement.getBoundingClientRect();
        const end = done.getBoundingClientRect();
        const hx = hub.left + hub.width / 2 - box.left;
        const hy = hub.top + hub.height / 2 - box.top;
        const r = hub.width / 2 + 4;
        const inputs = chips.map((chip): Curve => {
          const c = chip.getBoundingClientRect();
          if (horizontal) {
            const x0 = c.right - box.left + 6;
            const y0 = c.top + c.height / 2 - box.top;
            const x3 = hx - r;
            const bend = (x3 - x0) * 0.6;
            return [
              { x: x0, y: y0 },
              { x: x0 + bend, y: y0 },
              { x: x3 - bend, y: hy },
              { x: x3, y: hy },
            ];
          }
          // On phones the word sits under its icon, so the line starts below both.
          const below = (chip.parentElement ?? chip).getBoundingClientRect();
          const x0 = c.left + c.width / 2 - box.left;
          const y0 = below.bottom - box.top + 6;
          const y3 = hy - r;
          const bend = (y3 - y0) * 0.6;
          return [
            { x: x0, y: y0 },
            { x: x0, y: y0 + bend },
            { x: hx, y: y3 - bend },
            { x: hx, y: y3 },
          ];
        });
        const line = horizontal
          ? { x0: hx + r, y0: hy, x1: end.left - box.left - 6, y1: hy }
          : { x0: hx, y0: hy + r, x1: hx, y1: end.top - box.top - 6 };
        // Each icon's centre, wherever it is floating right now.
        const loose = chips.map((chip) => {
          const c = chip.getBoundingClientRect();
          return { x: c.left + c.width / 2 - box.left, y: c.top + c.height / 2 - box.top, r: c.width / 2 };
        });
        return { width: box.width, height: box.height, inputs, hub: { x: hx, y: hy }, hubRadius: r, line, loose };
      };

      const strokePasses = (passes: readonly (readonly [number, number])[], level: number) => {
        for (const [width, alpha] of passes) {
          const a = clamp(alpha * level);
          if (!(a >= MIN_ALPHA)) continue;
          ctx.lineWidth = width;
          ctx.globalAlpha = a;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      };

      const traceCurve = (c: Curve) => {
        ctx.beginPath();
        ctx.moveTo(c[0].x, c[0].y);
        ctx.bezierCurveTo(c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y);
      };

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

      /** A small, soft point of light: something on its way. */
      const mote = (at: Point, radius: number, strength: number) => {
        if (strength <= 0.003) return;
        const light = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, radius);
        light.addColorStop(0, rgba(WHITE, strength));
        light.addColorStop(0.35, rgba(PAPER, strength * 0.35));
        light.addColorStop(1, rgba(PAPER, 0));
        ctx.fillStyle = light;
        ctx.fillRect(at.x - radius, at.y - radius, radius * 2, radius * 2);
      };

      const render = (now: number) => {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        const { width, height, inputs, hub, hubRadius, line, loose } = measure();
        const t = now / 1000;
        const along = Math.hypot(line.x1 - line.x0, line.y1 - line.y0) || 1;
        const angle = Math.atan2(line.y1 - line.y0, line.x1 - line.x0);
        const reach = Math.max(
          horizontal ? hub.x - (inputs[0]?.[0].x ?? hub.x) : hub.y - (inputs[0]?.[0].y ?? hub.y),
          1,
        );
        const sparkSize = clamp(reach * 0.045, 7, 17);
        const beamSparkSize = clamp(along * 0.07, 9, 24);

        ctx.save();
        ctx.translate(originX, originY);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // While the inputs float loose: a faint thread reaches from each toward
        // the point to come, keeping a gentle bend of its own and swaying slowly;
        // now and then a soft mote crosses one; and where they meet there is a
        // whisper of light that lifts a little as each mote arrives. It eases in
        // after the inputs appear and fades as scroll lines them up.
        const presence = still ? 0 : ambient.a * smooth((now - readyAt - 600) / 1800);
        if (presence > 0.002) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          let arriving = 0;
          loose.forEach((chip, i) => {
            const weight = presence * SCATTER_OPACITY[i];
            const dist = Math.hypot(hub.x - chip.x, hub.y - chip.y) || 1;
            const ux = (hub.x - chip.x) / dist;
            const uy = (hub.y - chip.y) / dist;
            const start = { x: chip.x + ux * (chip.r + 7), y: chip.y + uy * (chip.r + 7) };
            const end = { x: hub.x - ux * (hubRadius + 8), y: hub.y - uy * (hubRadius + 8) };
            const span = Math.hypot(end.x - start.x, end.y - start.y);
            if (span < 24) return;
            const bend = ((i % 2 ? 1 : -1) * 0.07 + Math.sin(t * (0.21 + i * 0.037) + i * 1.9) * 0.035) * span;
            const curve: Curve = [
              start,
              { x: mix(start.x, end.x, 0.33) - uy * bend, y: mix(start.y, end.y, 0.33) + ux * bend },
              { x: mix(start.x, end.x, 0.67) - uy * bend * 0.7, y: mix(start.y, end.y, 0.67) + ux * bend * 0.7 },
              end,
            ];
            const thread = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            thread.addColorStop(0, rgba(PAPER, 0.09 * weight));
            thread.addColorStop(1, rgba(PAPER, 0.02 * weight));
            ctx.strokeStyle = thread;
            ctx.lineWidth = 1;
            traceCurve(curve);
            ctx.stroke();

            const cycle = (((t + i * 0.37) / MOTE_PERIOD[i] + MOTE_PHASE[i]) % 1 + 1) % 1;
            const travel = cycle / 0.6;
            if (travel < 1) {
              const fade = Math.pow(Math.sin(Math.PI * travel), 1.4);
              mote(pointAt(curve, easeInOutSine(travel)), 4.5, 0.5 * fade * weight);
              arriving += bell(travel, 0.96, 0.07) * weight;
            }
          });
          halo(hub, 34, presence * (0.045 + 0.02 * Math.sin(t * 0.8)) + 0.07 * arriving, PAPER);
          ctx.restore();
        }

        // Hairlines, drawn in as the inputs arrive.
        ctx.strokeStyle = HAIRLINE;
        ctx.lineWidth = 1;
        inputs.forEach((curve, i) => {
          const p = drawn[i].p;
          if (p <= 0.002) return;
          traceCurve(segment(curve, 0, p));
          ctx.stroke();
        });

        ctx.globalCompositeOperation = "lighter";
        const shade = horizontal
          ? ctx.createLinearGradient(0, 0, width, 0)
          : ctx.createLinearGradient(0, 0, 0, height);
        shade.addColorStop(0, rgba(MINT, 1));
        shade.addColorStop(1, rgba(mixRGB(MINT, CYAN, 0.7), 1));

        const sinceFlash = (now - flashAt) / 1000;
        const flash = sinceFlash >= 0 ? Math.exp(-sinceFlash * 2.4) : 0;
        const breathe = still ? 0 : Math.sin(t * 0.9);
        const settled = glow.p;

        // Light runs each line into the point and leaves it softly lit.
        let arrivals = 0;
        inputs.forEach((curve, i) => {
          const p = lit[i].p;
          if (p <= 0.002) return;
          ctx.strokeStyle = shade;
          traceCurve(segment(curve, 0, p));
          strokePasses(THREAD, 0.6 - 0.24 * settled + 0.05 * breathe * settled);
          if (p < 0.998) {
            spark(pointAt(curve, p), angleAt(curve, p), sparkSize, smooth(p / 0.06) * (1 - smooth((p - 0.9) / 0.095)), MINT);
            arrivals += bell(p, 0.97, 0.05);
          }
        });

        // At rest, one input at a time sends a little light through to the outcome.
        let passing = 0;
        if (restAt !== null && !still) {
          const r = (now - restAt) / 1000 - 1.6;
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
              const run = (phase - 1.25) / 1.55;
              const g = easeInOutSine(run);
              const span = 120 / along;
              const centre = { x: mix(line.x0, line.x1, g), y: mix(line.y0, line.y1, g) };
              const dx = Math.cos(angle) * 120;
              const dy = Math.sin(angle) * 120;
              const tint = mixRGB(MINT, WHITE, 0.5);
              const shine = ctx.createLinearGradient(centre.x - dx, centre.y - dy, centre.x + dx, centre.y + dy);
              shine.addColorStop(0, rgba(tint, 0));
              shine.addColorStop(0.5, rgba(tint, 1));
              shine.addColorStop(1, rgba(tint, 0));
              ctx.strokeStyle = shine;
              ctx.beginPath();
              ctx.moveTo(mix(line.x0, line.x1, Math.max(0, g - span)), mix(line.y0, line.y1, Math.max(0, g - span)));
              ctx.lineTo(mix(line.x0, line.x1, Math.min(1, g + span)), mix(line.y0, line.y1, Math.min(1, g + span)));
              strokePasses(GLINT, Math.sin(Math.PI * run) * 0.7);
            }
          }
        }

        // The point: a lift as each light arrives, one bloom when it lights, then a slow breath.
        halo(
          hub,
          clamp(reach * 0.12, 22, 40),
          settled * (0.2 + 0.05 * breathe) + 0.22 * arrivals + 0.5 * flash + 0.28 * passing,
          MINT,
        );
        if (sinceFlash >= 0 && sinceFlash < 1.6) {
          const p = sinceFlash / 1.6;
          ctx.strokeStyle = rgba(MINT, 0.42 * Math.pow(1 - p, 1.5));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(hub.x, hub.y, 22 + 70 * easeOutCubic(p), 0, Math.PI * 2);
          ctx.stroke();
        }

        // The beam to the outcome, drawn by a light of its own.
        const b = beam.p;
        if (b > 0.002) {
          const tip = { x: mix(line.x0, line.x1, b), y: mix(line.y0, line.y1, b) };
          ctx.strokeStyle = shade;
          ctx.beginPath();
          ctx.moveTo(line.x0, line.y0);
          ctx.lineTo(tip.x, tip.y);
          strokePasses(BEAM, 0.9 + 0.5 * flash + 0.06 * breathe * settled);
          const tint = mixRGB(MINT, CYAN, 0.5);
          if (b < 0.998) spark(tip, angle, beamSparkSize, 1, tint);
          else halo({ x: line.x1, y: line.y1 }, 22, 0.16 + 0.04 * breathe, tint);
        }

        ctx.restore();
      };

      /** Resizing the canvas clears it, so it is drawn again at once, never shown empty for a frame. */
      const resized = () => {
        size();
        render(performance.now());
      };

      const slots = items.map((item) => item.parentElement as HTMLElement);

      const mm = gsap.matchMedia();
      // Room to play the scene: 32rem of height, or 49rem on phones, where the
      // diagram stacks above the headline. Matches the .hero-track rule in CSS.
      const tallEnough = "(min-width: 48rem) and (min-height: 32rem), (min-height: 49rem)";
      mm.add({ wide: "(min-width: 48rem)", motion: MOTION_OK, tall: tallEnough }, (context) => {
        const { wide, motion, tall } = context.conditions as Record<string, boolean>;
        const scatter = wide ? SCATTER_WIDE : SCATTER_NARROW;
        const live = motion && tall;
        horizontal = wide;
        still = !motion;
        size();

        /** How far an input sits from its place while loose, measured from its untransformed slot. */
        const offset = (i: number, axis: "x" | "y") => {
          const area = flow.getBoundingClientRect();
          const band = stage.getBoundingClientRect();
          const slot = slots[i].getBoundingClientRect();
          const item = items[i];
          const width = item.offsetWidth;
          const height = item.offsetHeight;
          if (axis === "x") {
            const home = wide ? slot.right - width : slot.left + (slot.width - width) / 2;
            return area.left + scatter[i][0] * (area.width - width) - home;
          }
          const top = band.top + (wide ? 96 : 80);
          const room = Math.max(band.bottom - 16 - top - height, 0);
          return top + scatter[i][1] * room - slot.top;
        };

        const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });

        // 1. The loose inputs line up, and their float settles.
        items.forEach((item, i) => {
          timeline.fromTo(
            item,
            { x: () => offset(i, "x"), y: () => offset(i, "y"), opacity: SCATTER_OPACITY[i] },
            { x: 0, y: 0, opacity: 1, duration: 2.4, ease: "power3.inOut" },
            i * 0.15,
          );
        });
        timeline.fromTo(flow, { "--float": 1 }, { "--float": 0, duration: 1.4 }, 0);
        // The loose threads and motes fade before the real hairlines begin.
        timeline.fromTo(ambient, { a: 1 }, { a: 0, duration: 2, ease: "power1.in" }, 0);

        // 2. Hairlines reach for one point.
        timeline.fromTo(node, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 2.2);
        drawn.forEach((line, i) =>
          timeline.fromTo(line, { p: 0 }, { p: 1, duration: 1.2, ease: "power2.inOut" }, 2.4 + i * 0.16),
        );

        // 3. Light runs each line into the point, gathering speed as it goes.
        lit.forEach((light, i) =>
          timeline.fromTo(light, { p: 0 }, { p: 1, duration: 1.1, ease: "power1.in" }, 3.0 + i * 0.22),
        );

        // 4. The point lights.
        const connectAt = 5.1;
        timeline.fromTo(core, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2.2)" }, connectAt);
        timeline.fromTo(glow, { p: 0 }, { p: 1, duration: 0.9, ease: "power2.out" }, connectAt);
        timeline.to(words, { opacity: 0.6, duration: 0.8 }, connectAt + 0.2);

        // 5. A beam draws on to the outcome: its check, then each line in turn.
        const outcomeLines = Array.from(outcome.querySelectorAll<HTMLElement>("[data-flow-out-line]"));
        timeline.fromTo(beam, { p: 0 }, { p: 1, duration: 1.1, ease: "power1.inOut" }, connectAt + 0.35);
        // One tween each (not a stagger), so every part starts hidden before the scroll reaches it.
        [done, ...outcomeLines].forEach((part, i) =>
          timeline.fromTo(
            part,
            wide ? { opacity: 0, x: -12 } : { opacity: 0, y: 10 },
            { opacity: 1, x: 0, y: 0, duration: 0.9, ease: "power3.out" },
            connectAt + 1.05 + i * 0.14,
          ),
        );
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
            onRefresh: resized,
          });
        } else {
          timeline.progress(1);
        }
        sync();
        flow.dataset.ready = "";
        if (readyAt === Infinity) readyAt = performance.now();

        // Light is drawn every frame while the hero is on screen; without motion, only when asked.
        // It is drawn from GSAP's ticker, which renders the timeline first on each tick, so the
        // canvas always matches the markup in the same frame. (A loop of its own can end up
        // queued ahead of GSAP's once the ticker has slept and woken, and then draws a frame late.)
        let onScreen = true;
        const draw = () => render(performance.now());
        function schedule() {
          if (live && onScreen && !document.hidden) gsap.ticker.add(draw);
          else gsap.ticker.remove(draw);
        }
        const view = new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          schedule();
        });
        view.observe(section);
        document.addEventListener("visibilitychange", schedule);

        const resize = new ResizeObserver(resized);
        resize.observe(flow);
        resize.observe(stage);
        schedule();
        if (!live) render(performance.now());

        return () => {
          gsap.ticker.remove(draw);
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
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="hero-stage relative flex flex-col pt-16 lg:pt-[4.5rem]">
      <div className="shell flex flex-1 items-center">
        <div className="flow" data-flow>
          <ol className="flow-in">
            {INPUTS.map(({ label, short, Icon }, i) => (
              <li key={label} className="flow-slot">
                <span className="flow-item" data-flow-in>
                  <span className="flow-drift" style={{ "--n": i } as React.CSSProperties}>
                    <span className="flow-body">
                      <span className="flow-word">
                        <span className="flow-word-long">{label}</span>
                        <span className="flow-word-short">{short}</span>
                      </span>
                      <span className="flow-chip" data-flow-chip>
                        <Icon className="flow-icon" />
                      </span>
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flow-node" data-flow-node>
            <span className="flow-node-ring" data-flow-hub>
              <span className="flow-node-core" />
              <SparkIcon className="flow-node-icon" />
            </span>
            <span className="flow-node-label label">AI</span>
          </div>

          <p className="flow-out" data-flow-out>
            <span className="flow-chip flow-chip-done" data-flow-done>
              <CheckIcon className="flow-icon" />
            </span>
            <span className="flow-out-lines">
              {OUTCOME.map((line) => (
                <span key={line} className="flow-out-line" data-flow-out-line>
                  {line}
                </span>
              ))}
            </span>
          </p>

          <canvas className="flow-light" data-flow-light />
        </div>
      </div>
    </div>
  );
}
