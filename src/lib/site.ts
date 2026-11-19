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

/** Nulle's own apps on the App Store (seller: Nulle, LLC). */
export const apps = [
  {
    name: "CreatorCam",
    summary: "Records portrait and landscape video at the same time, in one tap.",
    url: "https://apps.apple.com/us/app/creatorcam-dual-video-record/id6761403032",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/8f/73/de/8f73dee5-3c62-41f1-911c-f3b75e5139f0/Placeholder.mill/400x400Icon.ApSiOS01-75.jpg",
  },
  {
    name: "Wavelogs",
    summary: "Private voice notes, transcribed on device, with AI summaries and chat.",
    url: "https://apps.apple.com/us/app/wavelogs-ai-voice-notes/id6759880222",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/74/e7/03/74e7034a-4be3-b39e-51f3-2b3bb5b36e36/Placeholder.mill/400x400Icon.ApSiOS01-75.jpg",
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
