import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Motion is only ever built inside this query. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !window.matchMedia(MOTION_OK).matches;
}

export { gsap, ScrollTrigger, useGSAP };
