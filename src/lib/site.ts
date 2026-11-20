import creatorCamIcon from "@/assets/apps/creatorcam.jpg";
import wavelogsIcon from "@/assets/apps/wavelogs.jpg";

/**
 * Site-wide configuration.
 *
 * Nothing here is invented: contact details and the scheduling link only
 * appear on the site once the matching environment variable is set.
 */

function httpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function emailAddress(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
}

export const site = {
  name: "Nulle",
  tagline: "Nothing between you and intelligence.",
  description:
    "Nulle designs and builds intelligent solutions that simplify how businesses work: AI agents and automation, AI strategy, private AI, and custom software.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Public contact address, shown in the contact section and footer when set. */
  contactEmail: emailAddress(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  /** Nulle's Instagram profile, linked from the footer. */
  instagramUrl: "https://www.instagram.com/nulleai/",
  /** Public booking page (Cal.com, Calendly, etc.). Shown when set. */
  schedulingUrl: httpsUrl(process.env.NEXT_PUBLIC_SCHEDULING_URL),
} as const;

/** Nulle's postal address, shown in the footer and in structured data. */
export const address = {
  street: "1700 Northside Drive NW",
  unit: "Suite A7 PMB 1683",
  locality: "Atlanta",
  region: "GA",
  postalCode: "30318",
} as const;

/**
 * Nulle's own apps on the App Store (seller: Nulle, LLC). Icons are local
 * copies of the App Store artwork, so next/image optimizes them at build.
 */
export const apps = [
  {
    name: "CreatorCam",
    summary: "Records portrait and landscape video at the same time, in one tap.",
    url: "https://apps.apple.com/us/app/creatorcam-dual-video-record/id6761403032",
    icon: creatorCamIcon,
  },
  {
    name: "Wavelogs",
    summary: "Private voice notes, transcribed on device, with AI summaries and chat.",
    url: "https://apps.apple.com/us/app/wavelogs-ai-voice-notes/id6759880222",
    icon: wavelogsIcon,
  },
] as const;

export const navigation = [
  { label: "Expertise", href: "/#expertise" },
  { label: "Approach", href: "/#approach" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export const legalNavigation = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;
