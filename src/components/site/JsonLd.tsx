import { serializeJsonLd } from "@/lib/structured-data";

/** Structured data for search engines and AI systems. A plain script tag, as the Next.js docs recommend. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
  );
}
