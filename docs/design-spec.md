# Nulle — Visual Design Specification

**Art direction: "The Quiet Future."** Swiss editorial structure, architectural restraint, one quiet accent.

This document stands in for the generated design board (no image-generation tool was connected when the site was built). It is the reference the implementation follows.

## 1. Principles

1. **Nothing between.** If an element does not carry meaning, it is removed. Empty space is a feature.
2. **Typography is the image.** No illustrations, no 3D, no stock imagery. Scale, weight, and alignment do the work. The exceptions carry facts: a small set of hand-drawn line icons (24px grid, 1.5px stroke), the Apple and Android marks where platforms are named, and the founders' own portraits. The one place with photography of places is inside *Atlas*, the concept app in the Mobile Apps demonstration: real photographs of the destinations it shows, from Wikimedia Commons under the licence named on each, credited beside the example (`src/assets/atlas/CREDITS.md`). They stay inside the device.
3. **Colour is an event.** The interface is monochrome. Mint-to-cyan appears only where intelligence is acting: the logo, the hero's AI point, its outcome and key word, an active step, a hover. Atlas has its own editorial palette inside the device: warm ivory `#F7F5EF` for surfaces, midnight ink `#142B2D` for type, ocean teal `#216C68` for actions and wherever the AI is at work, champagne gold `#C6A477` for fine accents (rules, the *Held* dot), and white `#FFFFFF` for raised surfaces. The photographs bring the colour.
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

**Geist** for everything; **Geist Mono** for labels, indices, and system text inside the demonstration. **Manrope** is Atlas's only typeface and appears only inside that app: headings at 700 with tight tracking (−0.04 to −0.055em), body at 400–500, small uppercase labels at 700 with wide tracking, times in tabular figures. It is not preloaded, so it is fetched only when the Mobile Apps example is shown. The phone's status bar keeps Geist, standing in for the system font.

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
- **Atlas device**: one phone, 18rem wide on desktop and up to 74vw on phones, with a titanium-toned frame, side buttons and a faint glass sheen. Everything on its screen is sized in container units, so it scales as one piece. The three screens (Discover, Curate, Explore) are stacked and cross-fade; hidden screens are inert. Inside: restrained radii (3cqw on iOS, 4cqw on Android), hairline dividers, almost no shadow, and a flat line-icon set of its own on the same 24px grid and 1.5px stroke as the site's icons. Photographs are local assets served through next/image with blur placeholders.
- **Platform badge**: hairline pill with the Apple or Android mark and the platform name; lifts 2px on hover, the Android mark turns green.
- **Icon link**: 44px hairline circle (Instagram in the footer), labelled for screen readers.

## 6. Sections

1. **Hero.** From complex challenges to intelligent solutions, played by scroll. The section is a short scroll track (190svh; 170svh on phones) whose contents hold still meanwhile. On load, five inputs, each a word with its line icon in a hairline circle (*Conversations*, *Workflows*, *Data & documents*, *Knowledge*, *Ideas & products*; on phones *Chats*, *Workflows*, *Data*, *Knowledge*, *Ideas*), fade in where they lie and float loosely across the open band. Scrolling lines them up; hairlines reach toward one point (a spark icon in a ring, labelled *AI*); a small mint light runs each line in; the point lights once; and a beam carries on to the outcome, a check and two lines arriving in turn: *Imagine more. Build smarter.* (stacked beside the check from tablet width up; one centred line on phones) Once resolved the light breathes, and every few seconds one input sends a little light through the point and along the beam. A row from tablet width up; a column on phones (icons in a row, short labels beneath, beam dropping to the outcome), tightened on phones under 56rem tall. Phones under 49rem tall show the hero as an ordinary section with the diagram resolved, so it never runs into the headline. Beneath sit only the two-line tagline, the supporting paragraph (*From complex challenges to intelligent solutions.* in full colour, then one sentence on combining AI, automation and software engineering), and two calls to action. "intelligence." waits in grey and takes the gradient when the point lights. A faint film grain keeps the dark surface from reading as a flat fill.
2. **Philosophy.** "Complexity," is struck through and dimmed as it arrives; "simplified." stays. The paragraph sits right of centre.
3. **Expertise.** Four rows: mono index, large title, one plain sentence, a short list of what is included. The fourth, *Custom Software & Mobile Apps*, adds iOS and Android platform badges and *Our apps on the App Store*: a compact tile per app (its App Store icon, kept as a local asset and optimized by next/image; name; one line; App Store link), currently CreatorCam and Wavelogs.
4. **Intelligence in Practice.** Four tab cards (*AI Receptionist*, *Automation*, *Private AI*, *Mobile Apps*) above one panel showing one example at a time: a plain headline and sentence on the left, a short visual on the right that ends on its result and keeps it. Receptionist: an after-hours call, three short exchanges, an appointment confirmation card. Automation: four steps ticked off along one line, then the result. Private AI: a question, approved documents with the one used marked, a short answer with its source. Mobile Apps: *Atlas*, an AI travel concierge in a luxury editorial style, as one app in one device. **Discover**: an ATLAS masthead, *Where to next?*, a request field, and a sideways row of photograph cards (Kyoto, the Amalfi Coast, Marrakech) above a tab bar; the Kyoto card is chosen and *Plan a luxurious weekend in Kyoto for two* streams into the field. **Curate** (about 2.5s): a thin progress line, the request as a headline, a quiet map of Kyoto where a teal route draws through each stop, and three picks (the stay, the table, the first walk) arriving with their photographs and ticking off. **Explore**: a scrolling plan that opens on an edge-to-edge photograph of Kiyomizu-dera under an ivory sheet: *Kyoto, for two*, dates, nights and guests, the concierge's note on the pacing, *Where you'll stay* (the ryokan), and *Your itinerary* by day (Fri/Sat/Sun), each day led by one large photograph with the other stops as rows (photo, time, kind, title, detail, *Held*). The top bar turns from floating buttons over the photograph into a solid bar with the title as it scrolls; a dock holds *4 bookings held* and *Reserve*, which turns every hold to *Reserved*. Sample content only: no prices, live availability or real bookings. About 5s to the plan, and every step can be tapped through. An iOS/Android switch with the Apple and Android marks redraws the device and its native details (Dynamic Island or punch-hole camera, corner shapes, side buttons, status icons, a translucent tab bar or a Material navigation bar, a segmented control or tabs with a sliding indicator for the days, back chevron or arrow, rounded or pill buttons); the app itself does not change. The aside labels Atlas an interactive concept, not a released product, and lists the photo credits; the panel note says the same and that no bookings are made. Receptionist and Private AI offer *Another example*; every panel has *Replay* and a plain note that it is illustrative. Nothing rotates on its own. Beneath, a closing call to action: *Imagine what this could do for your business.* with *Explore a Solution* (to Contact).
5. **Approach.** Four steps on a single drawn line.
6. **About.** A statement on the left, three principles as a definition list on the right.
7. **Founders.** Introduced the way a studio introduces its principals, compact and asymmetric. On desktop the headline *The minds behind Nulle.* (600 weight, `clamp(2.5rem, 5.4vw, 5.25rem)`), one supporting sentence and *Meet the founders* sit together in columns 1–5; from column 7 the two founders stand side by side in equal columns, each 1.5rem wider than its headshot, their photographs on one top edge, with a vertical hairline centred in the gap between them. Each founder is a head-and-shoulders headshot 180–220px wide (4:5, 4px radius, a faint inner hairline), then a hairline, name, role on two even lines (mono label: *Co-Founder* / their area), and one line on their expertise (*Trained in mathematics. Builds secure, highly available cloud architecture for enterprise scale.* / *Trained in electrical engineering. Designs and ships enterprise iOS apps used by thousands.*). Both photographs are cropped by the same uniform 1.6× scale, anchored so the faces sit at the same height, and lightly desaturated to sit together. Two columns, level and divided, from 40rem; stacked on phones, without the divider. *Meet the founders* pairs the words, on a quiet hairline, with an arrow in a hairline circle.
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
| Atlas (Mobile Apps) | The device rises in; Discover's content and photographs settle in; the request streams in word by word and the send button pulses. Curate: the progress line fills, the route draws (1.9s, linear) and each stop fills teal as it is reached, picks rise with their photographs settling, spinners turn to checks. Explore: the opening photograph unveils from 1.1×, the sheet rises, content rises in turn, the dock slides up. Scrolling: the opening photograph moves slower than the page and later photographs settle as they come into view (scroll-linked, where supported). A new day slides in from the side it was chosen on. CSS keyframes keyed to the current screen, with a short GSAP timeline to steer; any tap hands control to the visitor. | about 5s to the plan | `expo.out`, linear |
| Founders (homepage) | The headline's lines rise; the sentence and link fade up; each headshot wipes up into view while the photo settles from a gentle 1.12× zoom, the second 0.16s after the first; names, roles and lines fade up in turn. On hover a headshot regains full colour, gains a little contrast and scales 4.5%, and the hairline beneath it deepens. *Meet the founders*: the hairline fills from the left, the circle fills with ink, and the arrow slides out as a second slides in. | 1.35s wipe, 1.8s settle; 0.6–1.4s hover | `expo.inOut`, `expo.out` |
| Founders page | Each portrait wipes up into view (clip-path) while the photo settles from a 1.22× zoom, then drifts ±5% with the scroll; name and bio rise in behind it. On hover the photo warms and scales 3%. | 1.35s wipe, 1.8s settle | `expo.inOut`, `expo.out` |
| Hover | Colour, underline, 3px arrow shift. | 0.3s | `ease` |

No scroll hijacking: the hero holds still with `position: sticky` and native scrolling, and nothing intercepts the wheel or touch. On the page, the only parallax is the portrait drift on the founders page (Atlas's opening photograph has its own, inside the device). The hero's resting light is the only continuous animation on the page itself; inside Atlas, only the send button's pulse and the curating spark repeat, and only on the screen that is showing. Atlas's plan scrolls inside the device with native scrolling (no scroll capture beyond the device's own content). With `prefers-reduced-motion: reduce`, or in a window shorter than 32rem (49rem on phones), the hero track collapses and renders resolved; every other element renders in its final state, each demonstration shows its result, and tab choices switch instantly.
