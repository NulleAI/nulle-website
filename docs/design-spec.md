# Nulle — Visual Design Specification

**Art direction: "The Quiet Future."** Swiss editorial structure, architectural restraint, one quiet accent.

This document stands in for the generated design board (no image-generation tool was connected when the site was built). It is the reference the implementation follows.

## 1. Principles

1. **Nothing between.** If an element does not carry meaning, it is removed. Empty space is a feature.
2. **Typography is the image.** No illustrations, no 3D, no stock imagery. Scale, weight, and alignment do the work.
3. **Colour is an event.** The interface is monochrome. Mint-to-cyan appears only where intelligence is acting: the logo, the hero's beam and key word, an active step, a hover.
4. **Still first.** Every screen must be complete with motion switched off. Motion only sequences what is already there. The hero is the one place that moves continuously; with reduced motion it becomes a still.

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

Surface rhythm down the page: **ink** (Hero) → **paper** (Philosophy, Expertise) → **ink** (Intelligence in Practice) → **paper** (Approach) → **stone** (About) → **ink** (Contact, Footer).

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
- **Demonstration panel**: the only bordered container on the site. Hairline border, 12px radius, `ink-raised` surface.

## 6. Sections

1. **Hero.** The tagline, made literal, and played by the visitor. The section is a short scroll track (225svh; 195svh on phones) whose contents hold still while the visitor scrolls through it. In the open band between the header and the text sit two endpoints, labelled *You* (left) and *Intelligence* (right), with a centred mono count between them (*14 steps between*; above the line on phones). The space between the endpoints starts crowded with friction: thin layers standing across the line that knock the signal off course, broken and dashed lines, small mono "interruption" chips (*Pending approval*, *Ticket #4821*, *Sync failed*…), and static. Scrolling carries a signal across and clears it all, leaving one clean mint-to-cyan beam, and the line then reads *You · Nothing between · Intelligence*. Beneath sit a mono eyebrow, the two-line tagline set large and light, one sentence, two calls to action, and a quiet strip naming the four capabilities. "intelligence." waits in grey and takes the gradient only when the beam lands. A faint film grain keeps the dark surface from reading as a flat fill.
2. **Philosophy.** "Complexity," is struck through and dimmed as it arrives; "simplified." stays. The paragraph sits right of centre.
3. **Expertise.** Four rows: mono index, large title, one plain sentence, a short list of what is included.
4. **Intelligence in Practice.** One panel. Three scenarios on a rail, a stage that plays each one once, and a small set of choices that change what happens. Shared grammar across scenarios: steps → content → outcome.
5. **Approach.** Four steps on a single drawn line.
6. **About.** A statement on the left, three principles as a definition list on the right.
7. **Contact.** Full-width heading, request-type selector, underlined form.

## 7. Motion

| Moment | Behaviour | Duration | Ease |
| --- | --- | --- | --- |
| Hero entrance | Lines rise from masks; rule draws; details fade up. CSS only, starts at first paint. | 1.1s, 90ms stagger | `expo.out` |
| Hero: idle | On load, layers, broken lines, chips and static settle in between the endpoints and keep drifting. Every 3.8s a signal leaves *You* and is stopped at the first layer, which flinches. | 0.7s in, then looping | `cubic.out` |
| Hero: clearing (scroll) | Scroll position, followed with light inertia, carries the signal from *You* to *Intelligence* over the first 74% of the track. Each barrier gives way as it arrives: lines fall onto the beam, static is swept along and clears, chips fade aside, layers fold onto the line, and the displaced beam straightens behind the head, which stretches with scroll speed. The friction also slides slightly left as you scroll, nearer layers more, so you seem to move through it. The count ticks down. Scrolling back brings it all back. | scroll-linked | linear, damped |
| Hero: connection | The beam reaches *Intelligence*: a bloom and one ring, the node fills with the gradient, both labels and the count (*Nothing between*) brighten, and "intelligence." fills with the gradient from the left, then a band of light crosses it. | 1.6s; fill 1.2s | `expo.out`, `quart.inOut` |
| Hero: at rest | One clean beam that breathes; a glint crosses about every 7s; it brightens under the pointer. The last quarter of the track holds this calm before the hero lets go, then the scene fades as it scrolls away. Canvas 2D, paused off screen. | continuous | — |
| Section headings | Lines rise from masks on scroll, once. | 1.15s | `expo.out` |
| Content | Fade and 28px rise on scroll, once. | 1s | `expo.out` |
| Rules | Draw from the left. | 1.4s | `expo.inOut` |
| Philosophy strike | Line draws through "Complexity"; word dims. | 0.9s | `expo.inOut` |
| Scenarios | One authored timeline each; plays once in view, replayable. | 3–7s | `power2`/`expo` |
| Hover | Colour, underline, 3px arrow shift. | 0.3s | `ease` |

No page parallax and no scroll hijacking: the hero holds still with `position: sticky` and native scrolling, and nothing intercepts the wheel or touch. The hero beam is the only continuous animation, apart from two small cues beside it (the eyebrow dot and the scroll line). With `prefers-reduced-motion: reduce`, the scroll track collapses to an ordinary section, every element renders in its final state, the hero renders once already connected (no friction), and scenario choices switch instantly. In a window shorter than 32rem the track also collapses, and the friction clears as the hero scrolls away instead.
