import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function dataUri(file: string): Promise<string> {
  const buffer = await readFile(join(process.cwd(), "src/assets/brand", file));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

/** The share card: the same idea as the hero, at 1200 × 630. */
export default async function OpenGraphImage() {
  const [mark, wordmark] = await Promise.all([
    dataUri("nulle-mark-gradient.png"),
    dataUri("nulle-wordmark-white.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#111413",
          color: "#f6f6f2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={mark} alt="" width={51} height={40} />
          <img src={wordmark} alt="" width={112} height={31} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 124,
              lineHeight: 0.94,
              letterSpacing: "-0.055em",
            }}
          >
            <span>Nothing between</span>
            <span style={{ display: "flex" }}>
              you and intelligence
              {/* Separate boxes lose the tracking between them; restore it. */}
              <span style={{ color: "#affe9f", marginLeft: -7 }}>.</span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 44,
              paddingTop: 28,
              borderTop: "1px solid rgba(246, 246, 242, 0.3)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              color: "#c5c9c4",
            }}
          >
            AI consulting, engineering, and intelligent software.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
