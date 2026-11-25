import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Dates are when each page's content last changed, set by hand. A build
 * date would tell crawlers every page changed on every deploy, and they
 * learn to ignore that. Update a date when you change that page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, lastModified: "2026-11-25", changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/founders`, lastModified: "2026-11-25", changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/privacy`, lastModified: "2026-11-25", changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/terms`, lastModified: "2026-11-20", changeFrequency: "yearly", priority: 0.2 },
  ];
}
