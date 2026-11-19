"use client";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The page's scroll choreography, driven by data attributes so every
 * section can stay a server component:
 *
 *   data-reveal         fade and rise
 *   data-reveal-lines   raise each [data-line] out of its mask
 *   data-reveal-rule    draw a hairline from the left
 *   data-strike         the Philosophy strike-through
 *   data-reveal-portrait  a portrait wipes up into view and settles from a zoom
 *                         (data-reveal-zoom, default 1.22), optionally after
 *                         data-reveal-delay seconds; a
 *                         [data-portrait-drift] layer then drifts gently with the page
 *
 * Hidden starting states are applied here, in JavaScript, and only to
 * elements still below the fold. If this script never runs, or the
 * visitor prefers reduced motion, the page is simply complete.
 */
export function ScrollMotion() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(MOTION_OK, () => {
      const fold = window.innerHeight * 0.92;
      const waiting = <T extends Element>(elements: T[]) =>
        elements.filter((element) => element.getBoundingClientRect().top > fold);

      // Content: fade and rise, batched so neighbours arrive in sequence.
      const blocks = waiting(gsap.utils.toArray<HTMLElement>("[data-reveal]"));
      if (blocks.length) {
        gsap.set(blocks, { opacity: 0, y: 28 });
        ScrollTrigger.batch(blocks, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "expo.out",
              stagger: 0.09,
              overwrite: true,
              clearProps: "transform",
            }),
        });
      }

      // Headings: each authored line rises out of its mask.
      for (const group of waiting(gsap.utils.toArray<HTMLElement>("[data-reveal-lines]"))) {
        const lines = group.querySelectorAll<HTMLElement>("[data-line]");
        gsap.set(lines, { yPercent: 112 });

        const timeline = gsap.timeline({
          scrollTrigger: { trigger: group, start: "top 86%", once: true },
        });
        timeline.to(lines, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.1 });

        // Philosophy: once the heading has landed, strike "Complexity".
        if (group.hasAttribute("data-strike")) {
          const words = group.querySelectorAll<HTMLElement>("[data-strike-word]");
          const line = group.querySelector<HTMLElement>("[data-strike-line]");
          const restingColor = words[0] ? getComputedStyle(words[0]).color : undefined;
          const startingColor = getComputedStyle(group).color;

          gsap.set(words, { color: startingColor });
          gsap.set(line, { scaleX: 0 });
          timeline
            .to(line, { scaleX: 1, duration: 0.9, ease: "expo.inOut" }, 0.75)
            .to(words, { color: restingColor, duration: 0.9, ease: "power2.inOut" }, 0.75);
        }
      }

      // Portraits: a wipe up from the bottom while the photo settles from a
      // zoom. data-reveal-delay (seconds) staggers portraits that arrive
      // together; data-reveal-zoom sets a gentler (or stronger) starting zoom.
      for (const frame of waiting(gsap.utils.toArray<HTMLElement>("[data-reveal-portrait]"))) {
        const image = frame.querySelector("img");
        const delay = Number(frame.dataset.revealDelay) || 0;
        const zoom = Number(frame.dataset.revealZoom) || 1.22;
        gsap.set(frame, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(image, { scale: zoom, yPercent: 4 });
        gsap
          .timeline({ scrollTrigger: { trigger: frame, start: "top 88%", once: true } })
          .to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: "expo.inOut" }, delay)
          .to(image, { scale: 1, yPercent: 0, duration: 1.8, ease: "expo.out", clearProps: "transform" }, delay + 0.1);
      }

      // Then every portrait drifts a little as the page passes it.
      for (const drift of gsap.utils.toArray<HTMLElement>("[data-portrait-drift]")) {
        gsap.fromTo(
          drift,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: drift.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }

      // Hairlines: draw from the left.
      for (const rule of waiting(gsap.utils.toArray<HTMLElement>("[data-reveal-rule]"))) {
        gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(rule, {
          scaleX: 1,
          duration: 1.5,
          ease: "expo.inOut",
          scrollTrigger: { trigger: rule, start: "top 88%", once: true },
        });
      }
    });

    // Web fonts change line heights; re-measure once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });

  return null;
}
