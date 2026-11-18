"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's living visual: one unbroken ribbon of fine threads in the
 * Nulle gradient, running from edge to edge. Nothing interrupts it.
 *
 * It is a twisting ribbon seen side-on. Where it turns edge-on the
 * threads meet in a point of light; where it opens they fan into a veil.
 *
 * On arrival a single beam draws across the screen, then unfurls. After
 * that it drifts slowly, leans toward the pointer, and settles as the
 * visitor scrolls away. Drawing stops whenever the hero is off screen,
 * and with reduced motion it renders once, as a still.
 *
 * Rendered with WebGL. The shape is computed in the vertex shader, so
 * each frame costs two draw calls and no per-frame geometry in script.
 */

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aVertex; // x: 0..1 across, y: thread -1..1, z: side -1 or 1

  uniform vec2 uSize;      // canvas size in CSS pixels
  uniform float uTime;
  uniform float uEnergy;   // 0 = a flat beam, 1 = the open ribbon
  uniform float uCentre;
  uniform float uRadius;
  uniform float uSwing;
  uniform float uThickness;
  uniform vec3 uPointer;   // x, y in CSS pixels, and how strongly it pulls

  varying float vAcross;
  varying float vSide;
  varying float vThread;
  varying float vDepth;
  varying float vY;

  float pull(float nx) {
    float distance = (nx * uSize.x - uPointer.x) / (uSize.x * 0.17);
    return uPointer.z * exp(-distance * distance);
  }

  float twistAt(float nx) {
    return nx * 6.2 + uTime * 0.38 + 0.9 * sin(nx * 2.3 - uTime * 0.24) + pull(nx) * 1.2;
  }

  float heightAt(float nx, float thread) {
    float near = pull(nx);
    float base = uCentre + uSwing * uEnergy *
      (0.72 * sin(nx * 5.1 + uTime * 0.3) + 0.28 * sin(nx * 9.7 - uTime * 0.19 + 1.7));
    float centre = base + (uPointer.y - base) * near * 0.3;
    float twist = twistAt(nx);
    float reach = uRadius * uEnergy * (0.74 + 0.26 * sin(nx * 3.1 + uTime * 0.21 + 2.1));
    return centre + thread * cos(twist) * reach + (1.0 - thread * thread) * sin(twist) * reach * 0.24;
  }

  void main() {
    float nx = aVertex.x;
    float thread = aVertex.y;

    float y = heightAt(nx, thread);
    float epsilon = 2.0 / uSize.x;
    float rise = heightAt(nx + epsilon, thread) - heightAt(nx - epsilon, thread);
    vec2 tangent = normalize(vec2(4.0, rise));
    vec2 normal = vec2(-tangent.y, tangent.x);

    vec2 position = vec2(nx * uSize.x, y) + normal * aVertex.z * uThickness * 0.5;
    vec2 clip = position / uSize * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

    vAcross = nx;
    vSide = aVertex.z;
    vThread = abs(thread);
    vDepth = thread * sin(twistAt(nx));
    vY = position.y;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  uniform vec3 uMint;
  uniform vec3 uCyan;
  uniform float uAlpha;
  uniform float uSoft;     // 0 = a crisp thread, 1 = a soft glow
  uniform float uDrawn;    // how far the beam has travelled, 0..1
  uniform float uPulse;    // position of the travelling glint, 0..1
  uniform float uFadeFrom;
  uniform float uFadeTo;

  varying float vAcross;
  varying float vSide;
  varying float vThread;
  varying float vDepth;
  varying float vY;

  void main() {
    vec3 colour = mix(uMint, uCyan, vAcross);

    float crisp = smoothstep(1.0, 0.3, abs(vSide));
    float soft = exp(-vSide * vSide * 3.6);
    float profile = mix(crisp, soft, uSoft);

    // Edge threads carry the silhouette; inner threads are the veil.
    float weight = 0.13 + 0.36 * pow(vThread, 1.5);
    // Threads on the near side of the twist catch more light.
    float depth = 0.72 + 0.28 * vDepth;
    // A glint that crosses the ribbon now and then.
    float travel = (vAcross - uPulse) * 5.5;
    float glint = 1.0 + 0.85 * exp(-travel * travel);

    float head = smoothstep(uDrawn, uDrawn - 0.05, vAcross);
    float fade = 1.0 - smoothstep(uFadeFrom, uFadeTo, vY);

    float alpha = profile * weight * depth * glint * head * fade * uAlpha;
    gl_FragColor = vec4(colour * alpha, alpha);
  }
`;

const MINT: [number, number, number] = [175 / 255, 254 / 255, 159 / 255];
const CYAN: [number, number, number] = [138 / 255, 240 / 255, 253 / 255];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[hero] shader failed to compile:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroSignal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!canvas || !section) return;

    const content = section.querySelector<HTMLElement>("[data-hero-content]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let gl: WebGLRenderingContext | null = null;
    let uniforms: Record<string, WebGLUniformLocation | null> = {};
    let threadIndexCount = 0;
    let glowIndexCount = 0;
    let threadIndices: WebGLBuffer | null = null;
    let glowIndices: WebGLBuffer | null = null;
    let vertexBuffer: WebGLBuffer | null = null;

    // Geometry, recalculated on resize.
    let width = 0;
    let height = 0;
    let centre = 0;
    let radius = 0;
    let swing = 0;
    let fadeFrom = 0;
    let fadeTo = 0;
    let builtFor = "";

    // Running state.
    let frame = 0;
    let onScreen = true;
    let startedAt = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, pull: 0, targetPull: 0 };

    const setup = () => {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
      if (!gl) return false;

      const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      const program = gl.createProgram();
      if (!vertex || !fragment || !program) return false;

      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.bindAttribLocation(program, 0, "aVertex");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn("[hero] program failed to link:", gl.getProgramInfoLog(program));
        return false;
      }
      gl.useProgram(program);

      uniforms = {};
      for (const name of [
        "uSize", "uTime", "uEnergy", "uCentre", "uRadius", "uSwing", "uThickness", "uPointer",
        "uMint", "uCyan", "uAlpha", "uSoft", "uDrawn", "uPulse", "uFadeFrom", "uFadeTo",
      ]) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      gl.uniform3fv(uniforms.uMint, MINT);
      gl.uniform3fv(uniforms.uCyan, CYAN);

      vertexBuffer = gl.createBuffer();
      threadIndices = gl.createBuffer();
      glowIndices = gl.createBuffer();

      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE); // additive: crossings brighten
      gl.clearColor(0, 0, 0, 0);
      builtFor = "";
      return true;
    };

    /** One strip of quads per thread; every fourth thread also carries the glow. */
    const build = (threads: number, columns: number) => {
      if (!gl) return;
      const perThread = (columns + 1) * 2;
      const vertices = new Float32Array(threads * perThread * 3);
      let v = 0;
      for (let i = 0; i < threads; i++) {
        const thread = (i / (threads - 1)) * 2 - 1;
        for (let j = 0; j <= columns; j++) {
          const nx = j / columns;
          vertices[v++] = nx;
          vertices[v++] = thread;
          vertices[v++] = -1;
          vertices[v++] = nx;
          vertices[v++] = thread;
          vertices[v++] = 1;
        }
      }

      const quads = (every: number) => {
        const picked: number[] = [];
        for (let i = 0; i < threads; i += every) picked.push(i);
        const indices = new Uint16Array(picked.length * columns * 6);
        let k = 0;
        for (const i of picked) {
          const first = i * perThread;
          for (let j = 0; j < columns; j++) {
            const a = first + j * 2;
            indices[k++] = a;
            indices[k++] = a + 1;
            indices[k++] = a + 2;
            indices[k++] = a + 1;
            indices[k++] = a + 3;
            indices[k++] = a + 2;
          }
        }
        return indices;
      };

      const threadQuads = quads(1);
      const glowQuads = quads(4);
      threadIndexCount = threadQuads.length;
      glowIndexCount = glowQuads.length;

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, threadIndices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, threadQuads, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glowIndices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, glowQuads, gl.STATIC_DRAW);
    };

    const measure = () => {
      if (!gl) return;
      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);

      const compact = width < 640;
      const threads = compact ? 40 : width < 1100 ? 56 : 72;
      const columns = Math.min(Math.ceil(width / 8), 400);
      const signature = `${threads}:${columns}`;
      if (signature !== builtFor) {
        build(threads, columns);
        builtFor = signature;
      }

      // The ribbon lives in the open band between the header and the text.
      const headerHeight = width < 1024 ? 64 : 72;
      const textTop = content ? content.getBoundingClientRect().top - bounds.top : height * 0.56;
      const band = Math.max(textTop - headerHeight, 140);
      centre = headerHeight + band * 0.5;
      radius = clamp(band * 0.38, 56, 260);
      swing = clamp(band * 0.2, 28, 150);
      fadeFrom = textTop - band * 0.2;
      fadeTo = textTop + (compact ? 56 : 84);
    };

    const render = (now: number) => {
      if (!gl || !width || !threadIndexCount) return;
      if (!startedAt) startedAt = now;

      const still = reducedMotion.matches;
      const elapsed = (now - startedAt) / 1000;
      const time = still ? 7.4 : elapsed;

      // Arrival: a beam draws across, then opens into the ribbon.
      const drawn = still ? 1.1 : easeInOutCubic(clamp(elapsed / 1.15, 0, 1)) * 1.1;
      const open = still ? 1 : easeOutExpo(clamp((elapsed - 0.65) / 2.8, 0, 1));

      // Scrolling away calms and fades it.
      const scrolled = clamp(window.scrollY / height, 0, 1);
      const energy = open * (1 - 0.4 * scrolled);
      const presence = Math.pow(1 - scrolled, 1.4) * (0.3 + 0.7 * open);

      // Every eleven seconds or so, a glint crosses from left to right.
      const cycle = (time * 0.09) % 1;
      const pulse = still ? -1 : cycle * 1.6 - 0.3;

      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;
      pointer.pull += (pointer.targetPull - pointer.pull) * 0.045;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.uSize, width, height);
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform1f(uniforms.uEnergy, energy);
      gl.uniform1f(uniforms.uCentre, centre);
      gl.uniform1f(uniforms.uRadius, radius);
      gl.uniform1f(uniforms.uSwing, swing);
      gl.uniform3f(uniforms.uPointer, pointer.x, pointer.y, pointer.pull);
      gl.uniform1f(uniforms.uDrawn, drawn);
      gl.uniform1f(uniforms.uPulse, pulse);
      gl.uniform1f(uniforms.uFadeFrom, fadeFrom);
      gl.uniform1f(uniforms.uFadeTo, fadeTo);

      // A soft glow from a quarter of the threads…
      gl.uniform1f(uniforms.uSoft, 1);
      gl.uniform1f(uniforms.uThickness, clamp(radius * 0.42, 34, 96));
      gl.uniform1f(uniforms.uAlpha, 0.11 * presence);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glowIndices);
      gl.drawElements(gl.TRIANGLES, glowIndexCount, gl.UNSIGNED_SHORT, 0);

      // …then every thread, crisp.
      gl.uniform1f(uniforms.uSoft, 0);
      gl.uniform1f(uniforms.uThickness, 1.7);
      gl.uniform1f(uniforms.uAlpha, presence);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, threadIndices);
      gl.drawElements(gl.TRIANGLES, threadIndexCount, gl.UNSIGNED_SHORT, 0);
    };

    const loop = (now: number) => {
      frame = 0;
      render(now);
      schedule();
    };

    function schedule() {
      if (frame || !gl || !onScreen || document.hidden || reducedMotion.matches) return;
      frame = requestAnimationFrame(loop);
    }

    const refresh = () => {
      measure();
      if (reducedMotion.matches) render(performance.now());
      else schedule();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = section.getBoundingClientRect();
      pointer.targetX = event.clientX - bounds.left;
      pointer.targetY = clamp(event.clientY - bounds.top, centre - radius * 1.3, centre + radius * 1.3);
      pointer.targetPull = 1;
    };
    const onPointerLeave = () => {
      pointer.targetPull = 0;
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      gl = null;
    };
    const onContextRestored = () => {
      if (setup()) refresh();
    };

    if (!setup()) return;

    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(section);
    if (content) resizeObserver.observe(content);

    const viewObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      schedule();
    });
    viewObserver.observe(section);

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", refresh);

    refresh();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      document.removeEventListener("visibilitychange", schedule);
      reducedMotion.removeEventListener("change", refresh);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
