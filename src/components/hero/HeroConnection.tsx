"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's living visual, driven by scroll: you on one side,
 * intelligence on the other, and everything that usually sits between.
 *
 * The hero holds still while the visitor scrolls through a short track.
 * At the top, the space between the two points is crowded with friction:
 * layers that knock the signal off course, broken lines, small
 * interruptions, static. Every few seconds a signal leaves "you" and is
 * stopped at the first layer. Scrolling carries the signal across, so the
 * visitor is the one clearing the way, and each barrier gives way as it
 * arrives: lines fall into line, static clears, blocks fade, layers fold
 * away. Under the line, a count of the steps left between ticks down.
 * When the signal lands, the line reads "You · Nothing between ·
 * Intelligence", and one clean beam is all that is left.
 *
 * Scroll is followed with a little inertia but never taken over, and
 * scrolling back brings the friction back. At rest the beam breathes, a
 * glint crosses now and then, and it brightens under the pointer. Drawing
 * pauses off screen. With reduced motion it renders once, already
 * connected.
 *
 * Canvas 2D. The endpoints and labels are real elements laid out by CSS;
 * the canvas reads where they are, so the scene follows the layout at
 * every size.
 */

type RGB = readonly [number, number, number];

type Pane = {
  /** Position along the line, 0 (you) to 1 (intelligence). */
  u: number;
  /** Height, in half-band units. */
  height: number;
  /** Perspective width, px. */
  depth: number;
  /** Vertical offset from the line, in half-band units. */
  centre: number;
  tilt: 1 | -1;
  phase: number;
  /** Where the signal sits after passing this layer, in half-band units. */
  shift: number;
  /** How far it slides as the visitor scrolls, 0..1: nearer layers move more. */
  near: number;
};

type Fragment = {
  u: number;
  v: number;
  length: number;
  alpha: number;
  dash: number[];
  drift: number;
  phase: number;
  blinks: boolean;
  delay: number;
  near: number;
};

type Grain = {
  u: number;
  v: number;
  size: number;
  alpha: number;
  speed: number;
  phase: number;
  flickers: boolean;
  delay: number;
  near: number;
};

type Chip = { text: string; u: number; v: number; tone: "plain" | "busy" | "alert" };

type Scene = { panes: Pane[]; fragments: Fragment[]; grains: Grain[]; chips: Chip[] };

const MINT: RGB = [175, 254, 159];
const CYAN: RGB = [138, 240, 253];
const PAPER: RGB = [246, 246, 242];
const ALERT: RGB = [255, 157, 140];
const WHITE: RGB = [255, 255, 255];

/** The small interruptions that float in the way. */
const CHIPS_WIDE: Chip[] = [
  { text: "Re-enter password", u: 0.17, v: -0.62, tone: "plain" },
  { text: "Ticket #4821", u: 0.3, v: 0.5, tone: "plain" },
  { text: "Pending approval", u: 0.46, v: -0.2, tone: "busy" },
  { text: "Handoff", u: 0.57, v: 0.7, tone: "plain" },
  { text: "Export CSV", u: 0.68, v: -0.74, tone: "plain" },
  { text: "Sync failed", u: 0.79, v: 0.3, tone: "alert" },
  { text: "Queue 14", u: 0.9, v: -0.38, tone: "plain" },
];

const CHIPS_COMPACT: Chip[] = [
  { text: "Pending", u: 0.28, v: -0.6, tone: "busy" },
  { text: "Handoff", u: 0.52, v: 0.58, tone: "plain" },
  { text: "Retry", u: 0.8, v: -0.3, tone: "alert" },
];

// Choreography, as fractions of the scroll through the hero.
/** Below this the scene idles; above it the signal starts across. */
const SWEEP_FROM = 0.02;
/** By here every barrier is gone; the rest of the track is calm. */
const SWEEP_TO = 0.74;
/** How quickly the scene catches up with the scroll position, per second. */
const FOLLOW = 6.5;

// Idle, in seconds.
const INTRO = 0.7; // friction settles in after load
const ATTEMPT_FIRST = 0.9; // a signal leaves…
const ATTEMPT_EVERY = 3.8;
const ATTEMPT_LENGTH = 0.45; // …and is stopped at the first layer
const IMPACT_LENGTH = 0.5;
const GLINT_DELAY = 2.6;
const GLINT_EVERY = 7;
const GLINT_LENGTH = 1.9;

/** Either side of a layer, the distance over which the signal bends. */
const BEND = 16;
/** The soft light around the finished beam: half its height, and how far it runs past each end. */
const HAZE_HALF = 70;
const HAZE_PAD = 40;
/** How far the nearest friction slides left across the whole scroll, px. */
const TRAVEL = 44;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (p: number) => {
  const x = clamp(p);
  return x * x * (3 - 2 * x);
};
const easeOutCubic = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
const easeInOutCubic = (p: number) => {
  const x = clamp(p);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeInOutSine = (p: number) => -(Math.cos(Math.PI * clamp(p)) - 1) / 2;
const bell = (p: number, centre: number, width: number) => Math.exp(-(((p - centre) / width) ** 2));
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const mixRGB = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const colourAt = (u: number) => mixRGB(MINT, CYAN, clamp(u));
const rgba = (c: RGB, a: number) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${clamp(a).toFixed(3)})`;

const stepsLabel = (count: number) =>
  count === 0 ? "Nothing between" : `${count} ${count === 1 ? "step" : "steps"} between`;

/** Deterministic, so the scene is the same on every visit and resize. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createScene(compact: boolean): Scene {
  const rand = seeded(compact ? 7 : 19);
  const normal = () => (rand() + rand() + rand() - 1.5) * 2;
  const sign = () => (rand() < 0.5 ? -1 : 1);

  const paneCount = compact ? 4 : 7;
  const spread = compact ? 0.58 : 0.74;
  const panes: Pane[] = [];
  let lastShift = 0;
  for (let i = 0; i < paneCount; i++) {
    // Each layer pushes the signal somewhere new, never back where it was.
    let shift = sign() * (0.12 + rand() * 0.24);
    if (Math.sign(shift) === Math.sign(lastShift) && Math.abs(shift - lastShift) < 0.12) shift = -shift;
    lastShift = shift;
    panes.push({
      u: 0.13 + ((i + 0.5) / paneCount) * spread + (rand() - 0.5) * (0.42 / paneCount),
      height: 0.95 + rand() * 0.8,
      depth: 5 + rand() * 11,
      centre: (rand() - 0.5) * 0.4,
      tilt: rand() < 0.5 ? -1 : 1,
      phase: rand() * Math.PI * 2,
      shift,
      near: 0.45 + rand() * 0.55,
    });
  }
  // The labels sit below the endpoints, so the last stretch is pushed upward, clear of them.
  const last = panes[panes.length - 1];
  last.shift = -Math.abs(last.shift);

  const fragments: Fragment[] = Array.from({ length: compact ? 22 : 46 }, () => {
    const style = rand();
    return {
      u: 0.05 + rand() * 0.9,
      v: clamp(normal() * 0.42, -1, 1),
      length: 14 + Math.pow(rand(), 2.2) * (compact ? 80 : 170),
      alpha: 0.1 + rand() * 0.26,
      dash: style < 0.18 ? [2, 3] : style < 0.34 ? [10, 6] : [],
      drift: 4 + rand() * 14,
      phase: rand() * Math.PI * 2,
      blinks: rand() < 0.3,
      delay: rand() * 0.45,
      near: rand(),
    };
  });

  const grains: Grain[] = Array.from({ length: compact ? 130 : 320 }, () => ({
    u: 0.02 + rand() * 0.96,
    v: clamp(normal() * 0.5, -1.15, 1.15),
    size: rand() < 0.85 ? 1 : 1.6,
    alpha: 0.05 + rand() * 0.3,
    speed: 0.6 + rand() * 2.4,
    phase: rand() * Math.PI * 2,
    flickers: rand() < 0.35,
    delay: rand() * 0.6,
    near: rand(),
  }));

  return { panes, fragments, grains, chips: compact ? CHIPS_COMPACT : CHIPS_WIDE };
}

export function HeroConnection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const section = stage?.closest("section");
    const pin = stage?.closest<HTMLElement>("[data-hero-pin]");
    const context = canvas?.getContext("2d");
    const you = stage?.querySelector<HTMLElement>('[data-endpoint="you"]');
    const ai = stage?.querySelector<HTMLElement>('[data-endpoint="intelligence"]');
    const count = stage?.querySelector<HTMLElement>("[data-hero-count]");
    if (!canvas || !stage || !section || !pin || !context || !you || !ai || !count) return;
    const ctx = context;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mono = getComputedStyle(stage).getPropertyValue("--font-geist-mono").trim() || "ui-monospace, monospace";

    // Geometry, recalculated on resize.
    let width = 0;
    let height = 0;
    let ratio = 1;
    let ax = 0; // you
    let bx = 0; // intelligence
    let ay = 0; // the line between them
    let length = 0;
    let half = 0; // half the height of the band the friction lives in
    let lead = 90; // barriers start to give way this far ahead of the signal
    let span = 280; // and are gone this far behind it
    let trackTop = 0; // the hero's top, in page coordinates
    let distance = 0; // how far the page scrolls while the hero holds still
    let pinHeight = 1;
    let scene: Scene | null = null;
    let builtFor: boolean | null = null;
    let haze: HTMLCanvasElement | null = null;
    /** Static and broken lines that would cross a label are left out. */
    let hidden = new Set<object>();

    // Per-frame scratch.
    let paneX: number[] = [];
    let paneResolve: number[] = [];
    let offsets: number[] = [];

    // Running state.
    let frame = 0;
    let onScreen = true;
    let startedAt = 0;
    let lastFrame = 0;
    let progress = -1; // the scroll position, followed with a little inertia
    let lastFront = -Infinity;
    let connected = false;
    let connectedAt = -100;
    let presence = 1; // fades as the hero scrolls away
    let countText = "";
    const pointer = { x: 0, glow: 0, target: 0 };

    const setCount = (text: string, tick: boolean) => {
      if (text === countText) return;
      countText = text;
      count.textContent = text;
      if (tick && !reducedMotion.matches) {
        count.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });
      }
    };

    const markConnected = (value: boolean) => {
      if (value) section.dataset.connected = "";
      else delete section.dataset.connected;
    };

    /** 0 at the top of the hero, 1 when it lets go. */
    const scrollProgress = () => {
      const y = window.scrollY - trackTop;
      // When the hero cannot hold still (a very short window), clear as it scrolls away.
      return distance > 40 ? clamp(y / distance) : clamp(y / (pinHeight * 0.6));
    };

    const measure = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;

      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      const a = you.getBoundingClientRect();
      const b = ai.getBoundingClientRect();
      ax = a.left + a.width / 2 - bounds.left;
      bx = b.left + b.width / 2 - bounds.left;
      ay = a.top + a.height / 2 - bounds.top;
      length = Math.max(bx - ax, 1);

      trackTop = section.getBoundingClientRect().top + window.scrollY;
      pinHeight = pin.offsetHeight || 1;
      distance = Math.max(section.offsetHeight - pinHeight, 0);

      const band = stage.getBoundingClientRect().height - (width < 1024 ? 64 : 72);
      half = clamp(band * 0.44, 60, 200);

      const compact = width < 720;
      lead = compact ? 50 : 90;
      span = compact ? 150 : 280;
      if (builtFor !== compact) {
        scene = createScene(compact);
        builtFor = compact;
        countText = "";
      }
      if (!scene) return;

      // The count has to hold text before its box is measured.
      if (!countText) setCount(stepsLabel(scene.panes.length + scene.chips.length), false);

      buildHaze();

      const labels = Array.from(stage.querySelectorAll<HTMLElement>("[data-avoid]"), (label) => {
        const box = label.getBoundingClientRect();
        return {
          left: box.left - bounds.left - 12,
          right: box.right - bounds.left + 12,
          top: box.top - bounds.top - 10,
          bottom: box.bottom - bounds.top + 10,
        };
      });
      const crosses = (x1: number, x2: number, y1: number, y2: number) =>
        labels.some((box) => x2 > box.left && x1 < box.right && y2 > box.top && y1 < box.bottom);
      hidden = new Set();
      for (const fragment of scene.fragments) {
        const x = ax + fragment.u * length;
        const reach = fragment.length + fragment.drift + TRAVEL;
        const y = ay + fragment.v * half;
        if (crosses(x - reach, x + reach, y - 2, y + 2)) hidden.add(fragment);
      }
      for (const grain of scene.grains) {
        const x = ax + grain.u * length;
        const y = ay + grain.v * half;
        if (crosses(x - 4 - TRAVEL, x + 4, y - 2, y + 2)) hidden.add(grain);
      }
    };

    /** The finished beam's glow: tinted along its length, soft above and below, fading past each end. */
    function buildHaze() {
      haze ??= document.createElement("canvas");
      const w = length + HAZE_PAD * 2;
      const h = HAZE_HALF * 2;
      haze.width = Math.round(w * ratio);
      haze.height = Math.round(h * ratio);
      const c = haze.getContext("2d");
      if (!c) return;
      c.setTransform(ratio, 0, 0, ratio, 0, 0);

      const along = c.createLinearGradient(HAZE_PAD, 0, HAZE_PAD + length, 0);
      along.addColorStop(0, rgba(MINT, 1));
      along.addColorStop(1, rgba(CYAN, 1));
      c.fillStyle = along;
      c.fillRect(0, 0, w, h);

      c.globalCompositeOperation = "destination-in";
      const across = c.createLinearGradient(0, 0, 0, h);
      for (const [stop, alpha] of [
        [0, 0],
        [0.25, 0.06],
        [0.38, 0.25],
        [0.46, 0.7],
        [0.5, 1],
        [0.54, 0.7],
        [0.62, 0.25],
        [0.75, 0.06],
        [1, 0],
      ] as const) {
        across.addColorStop(stop, rgba(WHITE, alpha));
      }
      c.fillStyle = across;
      c.fillRect(0, 0, w, h);

      const ends = c.createLinearGradient(0, 0, w, 0);
      const inset = clamp((HAZE_PAD + length * 0.12) / w, 0, 0.5);
      ends.addColorStop(0, rgba(WHITE, 0));
      ends.addColorStop(inset, rgba(WHITE, 1));
      ends.addColorStop(1 - inset, rgba(WHITE, 1));
      ends.addColorStop(1, rgba(WHITE, 0));
      c.fillStyle = ends;
      c.fillRect(0, 0, w, h);
    }

    /** The path the signal takes: bent at each layer by however far it is still displaced. */
    const traceBeam = () => {
      ctx.beginPath();
      ctx.moveTo(ax, ay + offsets[0]);
      for (let i = 0; i < paneX.length; i++) {
        const x = paneX[i];
        const from = ay + offsets[i];
        const to = ay + offsets[i + 1];
        ctx.lineTo(x - BEND, from);
        ctx.bezierCurveTo(x, from, x, to, x + BEND, to);
      }
      ctx.lineTo(bx, ay + offsets[paneX.length]);
    };

    /** A soft brightening of the straight beam around one point. */
    const highlight = (x: number, radius: number, strength: number) => {
      if (strength <= 0.002) return;
      const from = Math.max(ax, x - radius);
      const to = Math.min(bx, x + radius);
      if (to <= from) return;
      const tint = mixRGB(colourAt((x - ax) / length), WHITE, 0.55);
      const gradient = ctx.createLinearGradient(x - radius, 0, x + radius, 0);
      gradient.addColorStop(0, rgba(tint, 0));
      gradient.addColorStop(0.5, rgba(tint, 1));
      gradient.addColorStop(1, rgba(tint, 0));
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(from, ay);
      ctx.lineTo(to, ay);
      for (const [lineWidth, alpha] of [
        [12, 0.12],
        [4, 0.35],
        [1.6, 1],
      ] as const) {
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = presence * alpha * strength;
        ctx.stroke();
      }
      ctx.globalAlpha = presence;
    };

    const spark = (x: number, y: number, radius: number, strength: number, tint: RGB, stretch = 2.4) => {
      if (strength <= 0.002) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(stretch, 1);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      glow.addColorStop(0, rgba(WHITE, 0.9 * strength));
      glow.addColorStop(0.18, rgba(tint, 0.45 * strength));
      glow.addColorStop(1, rgba(tint, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    };

    const drawChip = (chip: Chip, x: number, y: number, alpha: number, scale: number, time: number) => {
      const label = chip.text.toUpperCase();
      ctx.font = `400 10px ${mono}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0.6px";
      const textWidth = ctx.measureText(label).width;
      const padding = 9;
      const dot = 4;
      const gap = 7;
      const bar = chip.tone === "busy" ? 22 : 0;
      const w = Math.round(padding + dot + gap + textWidth + (bar ? gap + bar : 0) + padding);
      const h = 22;

      ctx.save();
      ctx.translate(Math.round(x - (w / 2) * scale) + 0.5, Math.round(y - (h / 2) * scale) + 0.5);
      ctx.scale(scale, scale);
      ctx.globalAlpha = presence * alpha;

      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 5);
      ctx.fillStyle = "rgba(23,27,25,0.94)";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(PAPER, 0.17);
      ctx.stroke();

      const pulse = 0.5 + 0.5 * Math.sin(time * 5);
      ctx.beginPath();
      ctx.arc(padding + dot / 2, h / 2, dot / 2, 0, Math.PI * 2);
      ctx.fillStyle = chip.tone === "alert" ? rgba(ALERT, 0.45 + 0.5 * pulse) : rgba(PAPER, 0.42);
      ctx.fill();

      ctx.fillStyle = rgba(PAPER, 0.58);
      ctx.textBaseline = "middle";
      ctx.fillText(label, padding + dot + gap, h / 2 + 0.5);

      if (bar) {
        const left = w - padding - bar;
        ctx.fillStyle = rgba(PAPER, 0.12);
        ctx.fillRect(left, h / 2 - 1, bar, 2);
        const p = (time * 0.8) % 1;
        const start = left + bar * clamp(p * 1.4 - 0.4);
        const end = left + bar * clamp(p * 1.4);
        ctx.fillStyle = rgba(PAPER, 0.5);
        ctx.fillRect(start, h / 2 - 1, end - start, 2);
      }
      ctx.restore();
    };

    const render = (now: number) => {
      if (!width || !scene) return;
      const still = reducedMotion.matches;
      const first = !startedAt;
      if (first) startedAt = now;
      const t = still ? 0 : (now - startedAt) / 1000;
      const dt = lastFrame ? clamp((now - lastFrame) / 1000, 0, 0.1) : 0;
      lastFrame = now;

      // Follow the scroll with a little inertia, so a wheel's steps read as one movement.
      const target = still ? 1 : scrollProgress();
      if (first || progress < 0 || still) progress = target;
      else progress += (target - progress) * (1 - Math.exp(-dt * FOLLOW));
      if (Math.abs(target - progress) < 0.0005) progress = target;

      // Once the hero lets go, the scene fades as it leaves.
      const pinTop = Math.min(0, trackTop + distance - window.scrollY);
      presence = Math.pow(1 - clamp(-pinTop / pinHeight), 1.3);

      // Where the signal has reached, and how far each point has given way.
      const sweep = clamp((progress - SWEEP_FROM) / (SWEEP_TO - SWEEP_FROM));
      const front = progress <= SWEEP_FROM ? -Infinity : ax + (length + span) * sweep;
      const resolveAt = (x: number) => smooth((front - x + lead) / span);
      const intro = (delay: number) => (still ? 1 : easeOutCubic((t - delay) / INTRO));
      const travel = progress * TRAVEL; // the friction slides past as you move through it

      const speed = dt && Number.isFinite(front) && Number.isFinite(lastFront) ? Math.abs(front - lastFront) / dt : 0;
      lastFront = front;

      if (!connected && front >= bx) {
        connected = true;
        // Arriving already connected (reload partway down, reduced motion): no fanfare.
        connectedAt = first || still ? -100 : t;
        markConnected(true);
      } else if (connected && front < bx - 30) {
        connected = false;
        markConnected(false);
      }
      const sinceConnect = t - connectedAt;

      const { panes, fragments, grains, chips } = scene;
      paneX = panes.map((pane) => ax + pane.u * length - travel * pane.near);
      paneResolve = paneX.map(resolveAt);
      offsets = [0, ...panes.map((pane, i) => pane.shift * half * (1 - easeInOutCubic(paneResolve[i])))];
      const chipX = chips.map((chip) => ax + chip.u * length - travel * 0.7);
      const chipResolve = chipX.map(resolveAt);

      // Steps left between, counted as the signal passes them.
      const remaining =
        paneResolve.filter((r) => r < 0.5).length + chipResolve.filter((r) => r < 0.5).length;
      setCount(stepsLabel(connected ? 0 : remaining), !first);

      // While idle at the top, a signal tries every few seconds and is stopped at the first layer.
      const idle = 1 - clamp(progress / SWEEP_FROM);
      const cycle = t - ATTEMPT_FIRST;
      const local = cycle > 0 ? cycle % ATTEMPT_EVERY : -1;
      const attempt = !still && idle > 0 && local >= 0 ? local / ATTEMPT_LENGTH : -1;
      const impact = attempt >= 1 ? idle * Math.max(0, 1 - (local - ATTEMPT_LENGTH) / IMPACT_LENGTH) : 0;
      const stopX = paneX[0] - panes[0].depth - 3;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = presence;
      ctx.lineCap = "butt";

      // Static.
      for (let i = 0; i < grains.length; i++) {
        const grain = grains[i];
        if (hidden.has(grain)) continue;
        const x0 = ax + grain.u * length - travel * grain.near;
        const r = resolveAt(x0);
        if (r >= 1) continue;
        let alpha = grain.alpha * intro(0.05 + grain.delay) * (1 - r);
        alpha *= grain.flickers
          ? hash(Math.floor(t * 16) + i * 7.13) > 0.45
            ? 1
            : 0.12
          : 0.55 + 0.45 * Math.sin(t * grain.speed + grain.phase);
        if (alpha < 0.01) continue;
        const x = x0 + Math.sin(t * 0.4 + grain.phase) * 3 + r * r * 50;
        const y = ay + grain.v * half * (1 - 0.6 * r);
        ctx.fillStyle = rgba(PAPER, alpha);
        ctx.fillRect(x, y, grain.size, grain.size);
      }

      // Broken lines, which fall into line with the signal.
      ctx.lineWidth = 1;
      for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        if (hidden.has(fragment)) continue;
        const x =
          ax + fragment.u * length - travel * fragment.near + Math.sin(t * 0.35 + fragment.phase) * fragment.drift;
        const r = resolveAt(x);
        if (r >= 1) continue;
        const appear = intro(fragment.delay);
        const settle = easeInOutCubic(r);
        const y = ay + fragment.v * half * (1 - settle) + (impact ? Math.sin(t * 60 + i) * impact * 1.2 : 0);
        const reach = (fragment.length * appear * (1 + 0.9 * settle)) / 2;
        let alpha = fragment.alpha * appear * (1 - r * r) * (1 + 1.8 * bell(r, 0.55, 0.22));
        if (fragment.blinks && r === 0 && hash(Math.floor(t * 5 + fragment.phase * 10)) < 0.28) alpha *= 0.1;
        if (alpha < 0.01) continue;
        ctx.strokeStyle = rgba(mixRGB(PAPER, colourAt(fragment.u), settle), alpha);
        ctx.setLineDash(fragment.dash);
        ctx.beginPath();
        ctx.moveTo(x - reach, Math.round(y) + 0.5);
        ctx.lineTo(x + reach, Math.round(y) + 0.5);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Layers, each standing across the line at a slight angle.
      for (let i = 0; i < panes.length; i++) {
        const pane = panes[i];
        const r = paneResolve[i];
        if (r >= 1) continue;
        const appear = intro(0.08 + i * 0.07);
        const fold = easeInOutCubic(r);
        const alpha = appear * Math.pow(1 - r, 1.2);
        const shake = i === 0 ? Math.sin(t * 70) * impact * 2.5 : 0;
        const x = paneX[i] + Math.sin(t * 0.3 + pane.phase) * 2 + shake;
        const cy = mix(ay + pane.centre * half + Math.sin(t * 0.5 + pane.phase) * 5, ay, easeOutCubic(r));
        const h = pane.height * half * appear * (1 - fold);
        if (h < 1) continue;
        const near = x - pane.depth * pane.tilt;
        const far = x + pane.depth * pane.tilt;
        const top = cy - h / 2;
        const bottom = cy + h / 2;
        const farTop = cy - (h / 2) * 0.8;
        const farBottom = cy + (h / 2) * 0.8;

        const body = ctx.createLinearGradient(0, top, 0, bottom);
        body.addColorStop(0, rgba(PAPER, 0));
        body.addColorStop(0.5, rgba(PAPER, 0.05 * alpha));
        body.addColorStop(1, rgba(PAPER, 0));
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(near, top);
        ctx.lineTo(far, farTop);
        ctx.lineTo(far, farBottom);
        ctx.lineTo(near, bottom);
        ctx.closePath();
        ctx.fill();

        const edge = ctx.createLinearGradient(0, top, 0, bottom);
        edge.addColorStop(0, rgba(PAPER, 0));
        edge.addColorStop(0.22, rgba(PAPER, 0.32 * alpha));
        edge.addColorStop(0.78, rgba(PAPER, 0.32 * alpha));
        edge.addColorStop(1, rgba(PAPER, 0));
        ctx.strokeStyle = edge;
        ctx.beginPath();
        ctx.moveTo(near, top);
        ctx.lineTo(near, bottom);
        ctx.stroke();

        // The far edge and the layer's segments, fainter.
        ctx.beginPath();
        ctx.moveTo(far, farTop);
        ctx.lineTo(far, farBottom);
        for (let y = top + 9; y < bottom - 6; y += 9) {
          ctx.moveTo(near, y);
          ctx.lineTo(far, cy + (y - cy) * 0.8);
        }
        ctx.globalAlpha = presence * 0.22;
        ctx.stroke();
        ctx.globalAlpha = presence;

        // Light catching the layer as the signal reaches it.
        const flash = bell(r, 0.28, 0.16) + (i === 0 ? impact * 0.8 : 0);
        if (flash > 0.01) {
          ctx.globalCompositeOperation = "lighter";
          const lit = ctx.createLinearGradient(0, top, 0, bottom);
          const tint = colourAt(pane.u);
          lit.addColorStop(0, rgba(tint, 0));
          lit.addColorStop(0.5, rgba(tint, 0.85 * flash));
          lit.addColorStop(1, rgba(tint, 0));
          ctx.strokeStyle = lit;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(near, top);
          ctx.lineTo(near, bottom);
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      }

      // The signal as it is before the sweep: broken, displaced, degraded.
      ctx.lineWidth = 1;
      for (let k = 0; k <= panes.length; k++) {
        const from = k === 0 ? ax + 10 : paneX[k - 1] + BEND;
        const to = k === panes.length ? bx - 26 : paneX[k] - BEND;
        if (to <= from) continue;
        const r = resolveAt((from + to) / 2);
        let alpha = 0.3 * Math.pow(0.8, k) * intro(0.15 + k * 0.06) * (1 - r);
        if (k > 0) alpha *= 0.7 + 0.3 * hash(Math.floor(t * 9) + k * 3.7);
        if (alpha < 0.01) continue;
        ctx.strokeStyle = rgba(PAPER, alpha);
        ctx.setLineDash(k >= 2 ? [Math.max(3, 16 - k * 2), 3 + k] : []);
        ctx.beginPath();
        ctx.moveTo(from, Math.round(ay + offsets[k]) + 0.5);
        ctx.lineTo(to, Math.round(ay + offsets[k]) + 0.5);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // The idle signal: out from you, and stopped.
      if (attempt > 0 && attempt < 1) {
        const x = ax + (stopX - ax) * attempt * attempt;
        const tail = ctx.createLinearGradient(x - 90, 0, x, 0);
        tail.addColorStop(0, rgba(MINT, 0));
        tail.addColorStop(1, rgba(MINT, 0.9 * idle));
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.max(ax, x - 90), ay);
        ctx.lineTo(x, ay);
        ctx.stroke();
        spark(x, ay, 12, 0.8 * idle, MINT);
      }
      if (impact > 0) spark(stopX, ay, 10 + 26 * (1 - impact), impact * 0.9, MINT);

      // The beam: everything the signal has crossed.
      if (front > ax) {
        const head = Math.min(front, bx);
        const flash = connected ? 1.25 * Math.exp(-sinceConnect * 2.6) : 0;
        const breathe = connected ? 0.06 * Math.sin(t * 0.9) * clamp(sinceConnect / 2) : 0;
        const intensity = (connected ? 0.92 : 0.82) + flash + breathe;
        const glow = connected ? easeOutCubic(sinceConnect / 1.4) : 0;

        const beam = ctx.createLinearGradient(ax, 0, bx, 0);
        beam.addColorStop(0, rgba(MINT, 1));
        beam.addColorStop(1, rgba(CYAN, 1));
        ctx.strokeStyle = beam;

        ctx.save();
        if (head < bx) {
          ctx.beginPath();
          ctx.rect(0, 0, head, height);
          ctx.clip();
        }
        if (glow > 0 && haze) {
          ctx.globalAlpha = presence * clamp(0.16 * glow * intensity);
          ctx.drawImage(haze, ax - HAZE_PAD, ay - HAZE_HALF, length + HAZE_PAD * 2, HAZE_HALF * 2);
        }
        traceBeam();
        for (const [lineWidth, alpha] of [
          [22, 0.035],
          [10, 0.07],
          [4, 0.17],
          [1.5, 0.95],
        ] as const) {
          ctx.lineWidth = lineWidth;
          ctx.globalAlpha = presence * clamp(alpha * intensity);
          ctx.stroke();
        }
        ctx.globalAlpha = presence;
        ctx.restore();

        // The head of the signal; it stretches with the speed of the scroll.
        if (!connected) {
          let segment = 0;
          while (segment < paneX.length && head > paneX[segment]) segment++;
          const rush = clamp(speed / 900, 0, 1);
          spark(
            head,
            ay + offsets[segment],
            30 + 4 * rush,
            0.85 + 0.15 * rush,
            colourAt((head - ax) / length),
            2.4 + 1.4 * rush,
          );
        }
      }

      if (connected) {
        // Arrival: a bloom and one ring at intelligence.
        if (sinceConnect < 1.6) {
          const p = sinceConnect / 1.6;
          spark(bx, ay, 24 + 50 * easeOutCubic(p), (1 - p) * 0.9, CYAN);
          ctx.strokeStyle = rgba(CYAN, 0.45 * Math.pow(1 - p, 1.5));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, ay, 8 + 120 * easeOutCubic(p), 0, Math.PI * 2);
          ctx.stroke();
        }

        // At rest: a steady glow at each end…
        const settle = clamp(sinceConnect / 1.2);
        const glowAt = (x: number, tint: RGB, strength: number) => {
          const glow = ctx.createRadialGradient(x, ay, 0, x, ay, 36);
          glow.addColorStop(0, rgba(tint, strength));
          glow.addColorStop(1, rgba(tint, 0));
          ctx.fillStyle = glow;
          ctx.fillRect(x - 36, ay - 36, 72, 72);
        };
        glowAt(ax, MINT, 0.12 * settle);
        glowAt(bx, CYAN, (0.22 + 0.05 * Math.sin(t * 0.9)) * settle);

        // …a glint that crosses now and then…
        if (!still) {
          const since = sinceConnect - GLINT_DELAY;
          const g = since > 0 ? (since % GLINT_EVERY) / GLINT_LENGTH : 2;
          if (g < 1) highlight(ax + length * easeInOutSine(g), 150, Math.sin(Math.PI * g) * 0.8);
        }

        // …and the beam brightens under the pointer.
        pointer.glow += (pointer.target - pointer.glow) * 0.08;
        if (pointer.glow > 0.01) highlight(pointer.x, 200, pointer.glow * 0.55);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "butt";

      // Interruptions, which fade and are pushed aside.
      for (let i = 0; i < chips.length; i++) {
        const chip = chips[i];
        const r = chipResolve[i];
        if (r >= 1) continue;
        const appear = intro(0.2 + chip.u * 0.35);
        const alpha = appear * (1 - easeOutCubic(r * 1.15));
        if (alpha < 0.01) continue;
        const away = (chip.v < 0 ? -1 : 1) * easeOutCubic(r) * 0.3;
        const y = ay + (chip.v + away) * half + Math.sin(t * 0.6 + chip.u * 9) * 3 + (1 - appear) * 8;
        drawChip(chip, chipX[i], y, alpha, 1 - 0.06 * r, t);
      }

      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      frame = 0;
      render(now);
      schedule();
    };

    function schedule() {
      if (frame || !onScreen || document.hidden || reducedMotion.matches) return;
      frame = requestAnimationFrame(loop);
    }

    const refresh = () => {
      measure();
      if (reducedMotion.matches) render(performance.now());
      else schedule();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = clamp(event.clientX - bounds.left, ax, bx);
      pointer.target = clamp(1 - Math.abs(event.clientY - bounds.top - ay) / 160);
    };
    const onPointerLeave = () => {
      pointer.target = 0;
    };

    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(section);
    resizeObserver.observe(stage);

    const viewObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      lastFrame = 0;
      schedule();
    });
    viewObserver.observe(section);

    pin.addEventListener("pointermove", onPointerMove, { passive: true });
    pin.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", refresh);

    refresh();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      pin.removeEventListener("pointermove", onPointerMove);
      pin.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", schedule);
      reducedMotion.removeEventListener("change", refresh);
      markConnected(false);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        ref={stageRef}
        aria-hidden="true"
        className="relative flex min-h-[9rem] flex-1 flex-col pt-16 lg:pt-[4.5rem]"
      >
        <div
          className="shell enter-fade relative flex flex-1 items-center justify-between"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <span data-endpoint="you" className="hero-node hero-node-you">
            <span data-avoid className="hero-node-label label left-0">
              You
            </span>
          </span>
          <span data-hero-count data-avoid className="hero-count label" />
          <span data-endpoint="intelligence" className="hero-node hero-node-ai">
            <span data-avoid className="hero-node-label label right-0">
              Intelligence
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
