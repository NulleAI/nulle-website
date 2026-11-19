import type { StaticImageData } from "next/image";

import jerryCox from "@/assets/founders/jerry-cox.jpg";
import rahiemKlugh from "@/assets/founders/rahiem-klugh.jpg";

/**
 * The founders, as described on nulle.ai/founders.html. The homepage
 * shows headshots, names, roles and one sentence each; the founders
 * page shows the rest.
 */
export type Founder = {
  name: string;
  role: string;
  portrait: StaticImageData;
  /** One line on what they lead. */
  leads: string;
  /** One sentence for the homepage, drawn from the bio. */
  summary: string;
  /**
   * Anchor (x% y%) for the homepage's head-and-shoulders crop, a 1.6×
   * scale. Chosen so both faces sit at the same height in their frames,
   * with the same headroom.
   */
  face: string;
  bio: string;
  focus: readonly string[];
  profile: string;
};

export const founders: readonly Founder[] = [
  {
    name: "Jerry Cox",
    role: "Co-Founder, Product & Engineering",
    portrait: jerryCox,
    leads: "Leads product and engineering.",
    summary: "A background in mathematics and enterprise cloud architecture: delivery, security, and availability at scale.",
    face: "46% 2%",
    bio: "Software engineer with a background in mathematics, shipping enterprise software since 2011. His work has centered on cloud architectures: software delivery, security, and availability at enterprise scale. At Nulle, Jerry translates that discipline into working software: architecture that respects the user, interfaces that feel inevitable, and infrastructure that doesn’t demand a cloud tax.",
    focus: ["Cloud architecture", "Delivery & security", "Availability at scale", "Local-first AI"],
    profile: "https://www.linkedin.com/in/jerry-g-cox-jr",
  },
  {
    name: "Rahiem Klugh",
    role: "Co-Founder, Strategy & Partnerships",
    portrait: rahiemKlugh,
    leads: "Leads strategy and partnerships.",
    summary: "A background in electrical engineering and enterprise iOS apps, designed, built, and released to the App Store.",
    face: "50% 22%",
    bio: "Software engineer with a background in electrical engineering, shipping enterprise software since 2011. He has designed, built, and released enterprise iOS and mobile apps to the App Store, reaching thousands of users. At Nulle, Rahiem shapes direction and the way we show up in the world, making sure our positioning matches the standards we hold ourselves to behind the scenes.",
    focus: ["iOS & mobile", "App Store delivery", "Strategy", "Partnerships"],
    profile: "https://www.linkedin.com/in/rahiem-klugh/",
  },
];

export const facts = [
  { value: "2011", label: "Shipping enterprise software since" },
  { value: "30 yrs", label: "Combined engineering experience" },
  { value: "2", label: "Private AI products shipped: DREA and WaveLog" },
  { value: "ATL", label: "Based in Atlanta, Georgia" },
] as const;

export const beliefs = [
  {
    title: "You stay in charge.",
    detail: "AI should answer to the people using it, and every system we build is designed that way.",
  },
  {
    title: "Protect what’s yours.",
    detail: "Your secrets, your clients’ trust, and your edge come first, every time.",
  },
  {
    title: "Then move faster.",
    detail: "Safety that slows you down isn’t safety. The right guardrails let your people build with confidence.",
  },
] as const;
