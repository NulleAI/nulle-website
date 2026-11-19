# Nulle — Visual Design Specification

**Art direction: "The Quiet Future."** Swiss editorial structure, architectural restraint, one quiet accent.

This document stands in for the generated design board (no image-generation tool was connected when the site was built). It is the reference the implementation follows.

## 1. Principles

1. **Nothing between.** If an element does not carry meaning, it is removed. Empty space is a feature.
2. **Typography is the image.** No illustrations, no 3D, no stock imagery. Scale, weight, and alignment do the work. The exceptions carry facts: a small set of hand-drawn line icons (24px grid, 1.5px stroke), the Apple and Android marks where platforms are named, and the founders' own portraits.
3. **Colour is an event.** The interface is monochrome. Mint-to-cyan appears only where intelligence is acting: the logo, the hero's AI point, its outcome and key word, an active step, a hover.
4. **Still first.** Every screen must be complete with motion switched off. Motion only sequences what is already there. Demonstrations are authored in their final state; with reduced motion the hero and every demonstration simply show their result.

## 2. Colour

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#111413` | Dark surfaces, text on light |
| `ink-raised` | `#171B19` | Demonstration panel surface |
| `paper` | `#F6F6F2` | Light surfaces, text on dark |
| `stone` | `#E8E9E5` | Warm neutral surface (About) |
| `mute` | `#818782` | Secondary text on dark; large text on light |
| `mute-deep` | `#5F6561` | Small secondary text on light (5.5:1 on paper) |
| `mint` | `#AFFE9F` | Accent start, sampled from the logo |
| `cyan` | `#8AF0FD` | Accent end, sampled from the logo |

Hairlines are the foreground colour at 14% opacity. The gradient always runs left to right, mint to cyan, as in the logo.

Surface rhythm down the page: **ink** (Hero) → **paper** (Philosophy, Expertise) → **ink** (Intelligence in Practice) → **paper** (Approach) → **stone** (About) → **paper** (Founders) → **ink** (Contact, Footer).

## 3. Typography

**Geist** for everything; **Geist Mono** for labels, indices, and system text inside the demonstration.

| Style | Size | Leading | Tracking | Weight |
| --- | --- | --- | --- | --- |
| Hero | `clamp(3.75rem, min(7.3vw, 13svh), 8.5rem)` (about 105px at 1440) | 0.98 | −0.05em | 400 |
| Section heading | `clamp(2.75rem, 7.6vw, 8.25rem)` | 0.94 | −0.05em | 500 |
| Item title | `clamp(1.75rem, 3.5vw, 3.5rem)` | 1.02 | −0.035em | 500 |
| Lead | `clamp(1.375rem, 2.05vw, 2.125rem)` | 1.24 | −0.022em | 400 |
| Body | `1.0625rem` | 1.55 | −0.006em | 400 |
| Label | `0.75rem` mono, uppercase | 1 | 0.06em | 400 |

Headings are set in authored lines, never left to wrap by chance.

## 4. Layout

- Shell: full width to `110rem`, side padding `clamp(1.25rem, 4.2vw, 4.5rem)`.
- 12-column grid from 768px, single column below. Content sits asymmetrically: headings start at column 1, supporting text usually begins at column 7.
- Section padding: `clamp(6rem, 13vw, 12.5rem)` top and bottom.
- Every section opens the same way: mono label (`02 — Philosophy`), then the heading, then content. Repetition is the system.
- No cards, no icon grids. Lists are rows separated by hairlines.

## 5. Components

- **Logo**: top-left, 22px mark with the wordmark beside it. Gradient mark and white wordmark on dark; black mark and wordmark on light. Never enlarged, animated, or used as decoration.
- **Header**: fixed, 72px. Transparent over the hero; gains a blurred surface matching the section beneath once the page scrolls.
- **Primary button**: 48px pill, foreground fill. Hover fades in the logo gradient. Press scales to 0.98.
- **Outline button**: 1px hairline pill, used for "Let's Talk".
- **Text link**: underline that redraws on hover, arrow that moves 3px.
- **Form fields**: label above, single underline, no boxes.
- **Demonstration**: four tab cards (icon in a hairline circle, label; the selected icon fills with the gradient) above one panel with a hairline border, 12px radius and `ink-raised` surface. Inside, each example pairs a plain headline with one visual built from soft cards (16px radius).
- **Platform badge**: hairline pill with the Apple or Android mark and the platform name; lifts 2px on hover, the Android mark turns green.
- **Icon link**: 44px hairline circle (Instagram in the footer), labelled for screen readers.

## 6. Sections

1. **Hero.** From incoming chaos to intelligent action, played by scroll. The section is a short scroll track (190svh; 170svh on phones) whose contents hold still meanwhile. On load, five inputs, each a word with its line icon in a hairline circle (*Missed calls*, *Emails*, *New leads*, *Scheduling*, *Questions*), fade in where they lie and float loosely across the open band. Scrolling lines them up; hairlines reach toward one point (a spark icon in a ring, labelled *AI*); a small mint light runs each line in; the point lights once; and a beam carries on to the outcome, a check and *Answered, booked, followed up.* Once resolved the light breathes, and every few seconds one input sends a little light through the point and along the beam. A row from tablet width up; a column on phones (icons in a row, short labels beneath, beam dropping to the outcome). Beneath sit only the two-line tagline, the supporting line with one sentence, and two calls to action. "intelligence." waits in grey and takes the gradient when the point lights. A faint film grain keeps the dark surface from reading as a flat fill.
2. **Philosophy.** "Complexity," is struck through and dimmed as it arrives; "simplified." stays. The paragraph sits right of centre.
3. **Expertise.** Four rows: mono index, large title, one plain sentence, a short list of what is included. The fourth, *Custom Software & Mobile Apps*, adds iOS and Android platform badges and *Our apps on the App Store*: a compact tile per app (its App Store icon, kept as a local asset and optimized by next/image; name; one line; App Store link), currently CreatorCam and Wavelogs.
4. **Intelligence in Practice.** Four tab cards (*AI Receptionist*, *Automation*, *Private AI*, *Mobile Apps*) above one panel showing one example at a time: a plain headline and sentence on the left, a short visual on the right that ends on its result and keeps it. Receptionist: an after-hours call, three short exchanges, an appointment confirmation card. Automation: four steps ticked off along one line, then the result. Private AI: a question, approved documents with the one used marked, a short answer with its source. Mobile Apps: one AI assistant app concept drawn natively for iOS (light) and Android (dark, mint accent): a greeting with suggestion cards; *Book a visit* is chosen, the assistant types, suggests a time on a card, and *Confirm* books it, with a composer bar beneath; visitors can tap through it, and on phones a small iOS/Android switch shows one device at a time. Receptionist and Private AI offer *Another example*; every panel has *Replay* and a plain note that it is illustrative. Nothing rotates on its own. Beneath, a closing call to action: *Imagine what this could do for your business.* with *Explore a Solution* (to Contact).
5. **Approach.** Four steps on a single drawn line.
6. **About.** A statement on the left, three principles as a definition list on the right.
7. **Founders.** Kept brief on the homepage: *The minds behind Nulle.*, one supporting sentence, the two founders as small portraits (4.75rem, revealed on scroll) with name and role, and *Meet the founders* linking to the founders page.
8. **Contact.** Full-width heading, request-type selector, underlined form. The footer adds an Instagram icon link, a Founders link, and Nulle's postal address in its bottom row (also in the Organization structured data).

**Founders page (`/founders`).** From nulle.ai/founders.html: *Built by two. For everyone who builds.* with a short introduction and four facts; the founders' quote on a stone band; a full profile for each founder (portrait up to 24rem with the scroll reveal, role, name, what they lead, bio, focus tags, LinkedIn), alternating sides; *What we believe* (three ideas) on ink; and *Ready to talk?* linking to Contact.

## 7. Motion

| Moment | Behaviour | Duration | Ease |
| --- | --- | --- | --- |
| Hero entrance | Lines rise from masks; rule draws; details fade up. CSS only, starts at first paint. | 1.1s, 90ms stagger | `expo.out` |
| Hero: idle | On load the inputs fade in where they lie and float a few pixels. | 1s in, 140ms stagger | `ease` |
| Hero: gather (scroll) | The inputs line up; their float settles. GSAP timeline scrubbed by scroll with 1s of inertia. | first ~30% of the track | `power3.inOut` |
| Hero: light (scroll) | The AI point appears and hairlines draw toward it; a mint light runs each line in, gathering speed, leaving it softly lit. Lines and light are one canvas redrawn from live positions. | ~25–55% | `power2.inOut`, `power1.in` |
| Hero: bloom (scroll) | The point's core fills, one bloom and ring play once in time, the words dim, "intelligence." takes its colour, and a beam draws on to the outcome. The last ~25% holds still; scrolling back undoes it. | ~55–75% | `back.out`, `power1.inOut` |
| Hero: at rest | The lit lines and point breathe; every 6.5s one input in turn sends a small light into the point and a glint along the beam. Paused off screen; complete and still with reduced motion. | continuous | — |
| Section headings | Lines rise from masks on scroll, once. | 1.15s | `expo.out` |
| Content | Fade and 28px rise on scroll, once. | 1s | `expo.out` |
| Rules | Draw from the left. | 1.4s | `expo.inOut` |
| Philosophy strike | Line draws through "Complexity"; word dims. | 0.9s | `expo.inOut` |
| Demonstrations | One authored timeline each, from a complete final state; plays once when in view or chosen, replayable; the result stays. Choosing another example cross-fades the panel. | 2.5–4s | `expo.out`, `back.out` |
| Founders | Each portrait wipes up into view (clip-path) while the photo settles from a 1.22× zoom, then drifts ±5% with the scroll; name and bio rise in behind it. On hover the photo warms and scales 3%. | 1.35s wipe, 1.8s settle | `expo.inOut`, `expo.out` |
| Hover | Colour, underline, 3px arrow shift. | 0.3s | `ease` |

No scroll hijacking: the hero holds still with `position: sticky` and native scrolling, and nothing intercepts the wheel or touch. The only parallax is the founders' gentle portrait drift. The hero's resting light is the only continuous animation. With `prefers-reduced-motion: reduce`, or in a window shorter than 32rem, the hero track collapses and renders resolved; every other element renders in its final state, each demonstration shows its result, and tab choices switch instantly.
