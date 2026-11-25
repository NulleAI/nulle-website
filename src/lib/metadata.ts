import type { Metadata } from "next";

import { site } from "@/lib/site";

/** Open Graph fields every page shares. The share image comes from app/opengraph-image.tsx. */
export const openGraphBase = {
  type: "website",
  siteName: site.name,
  locale: "en_US",
} as const;

/**
 * The share card from app/opengraph-image.tsx. The homepage gets it from
 * the file convention; a page that sets its own `openGraph` loses that,
 * so it names the image explicitly.
 */
const shareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

/**
 * Metadata for a page other than the homepage.
 *
 * Next.js merges metadata shallowly: a page that sets `openGraph` or
 * `twitter` replaces the layout's whole object, and a page that sets
 * neither inherits the homepage's title, description and URL. This sets
 * both, so a shared or cited link describes the page it points to.
 */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: `/${string}`;
  index?: boolean;
}): Metadata {
  const fullTitle = `${title} — ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase, title: fullTitle, description, url: path, images: [shareImage] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [shareImage] },
    ...(index ? {} : { robots: { index: false } }),
  };
}
