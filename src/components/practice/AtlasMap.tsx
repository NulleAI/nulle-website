/* ------------------------------------------------------------------
   A quiet map of Kyoto for Atlas's planning step: the city grid, the
   Kamo and Katsura rivers, the hills, and the weekend's route drawing
   itself through each stop. Schematic, not to scale. Decorative: the
   steps beside it carry the meaning.
   ------------------------------------------------------------------ */

/** The weekend's route, in itinerary order. */
const route =
  "M190 132C198 140 206 146 214 150C234 178 240 224 222 254C268 226 276 118 246 70C196 36 108 52 72 112C92 172 126 212 162 214";

/**
 * The places along the route. `at` is when the route reaches each one,
 * in seconds after planning starts (it draws from 0.35s for 1.9s).
 */
const places = [
  { x: 190, y: 132, at: 0.35, label: "Ryokan", lx: -9, ly: -7, anchor: "end" },
  { x: 214, y: 150, at: 0.43, label: "Gion", lx: 8, ly: -6, anchor: "start" },
  { x: 222, y: 254, at: 0.74, label: "Fushimi Inari", lx: -10, ly: 4, anchor: "end" },
  { x: 246, y: 70, at: 1.3, label: "Philosopher’s Path", lx: -8, ly: 15, anchor: "end" },
  { x: 72, y: 112, at: 1.85, label: "Arashiyama", lx: -10, ly: 4, anchor: "end" },
  { x: 162, y: 214, at: 2.25, label: "Kyoto Station", lx: 0, ly: 19, anchor: "middle" },
] as const;

export function KyotoMap() {
  return (
    <svg aria-hidden="true" viewBox="0 36 300 236" className="atlas-map-art">
      <defs>
        <pattern id="atlas-grid" width="15" height="15" patternUnits="userSpaceOnUse">
          <path d="M15 0H0V15" fill="none" stroke="#142b2d" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="atlas-map-fade" cx="0.5" cy="0.55" r="0.62">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="atlas-map-mask">
          <rect y="36" width="300" height="236" fill="url(#atlas-map-fade)" />
        </mask>
      </defs>

      <g mask="url(#atlas-map-mask)" fill="none">
        <rect x="45" y="15" width="225" height="270" fill="url(#atlas-grid)" opacity="0.07" />
        <path d="M45 150H270M150 15V285M45 210H270M105 15V285" stroke="#142b2d" strokeOpacity="0.1" strokeWidth="0.9" />
        <g stroke="#142b2d" strokeOpacity="0.08" strokeWidth="0.9">
          <path d="M300 30C268 60 262 110 274 150S262 230 300 270" />
          <path d="M300 52C281 80 277 118 285 150S279 218 300 248" />
          <path d="M0 58C30 70 40 100 30 130S10 170 0 182" />
          <path d="M0 80C20 90 26 106 20 126S8 154 0 162" />
          <path d="M58 0C90 22 150 26 200 14S262 6 292 0" />
        </g>
        <g stroke="#8fb3b0" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round">
          <path d="M178 0C186 40 196 60 198 100S200 170 206 210S214 270 210 300" />
          <path d="M14 96C40 104 56 118 70 140S84 220 96 300" />
        </g>
      </g>

      <path d={route} fill="none" stroke="#142b2d" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="2 4" />
      <path d={route} pathLength={1} fill="none" stroke="#216c68" strokeWidth="1.8" strokeLinecap="round" className="atlas-route" />

      {places.map((place) => (
        <g key={place.label} className="atlas-place" style={{ "--at": `${place.at}s` } as React.CSSProperties}>
          <circle cx={place.x} cy={place.y} r="3.6" className="atlas-place-dot" />
          <text x={place.x + place.lx} y={place.y + place.ly} textAnchor={place.anchor} className="atlas-place-label">
            {place.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
