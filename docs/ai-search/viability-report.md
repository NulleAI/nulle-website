# AI Search Viability Report: nulle.ai

**Date:** 2026-11-25
**Audited:** `main` @ `c069634`. This is the commit DigitalOcean is serving (active deployment `ce2adca9`, 2026-11-20).
**Method:** a production build served locally and the live site, both fetched as 17 crawler user agents. Rendered HTML parsed without JavaScript. 8 web searches for entity presence. Code review of metadata, schema and content.
**Companion files:** `scorecard.csv`, `action-plan.csv`, `prompt-tracking.csv` (all in this folder, ready for Excel and Power BI)

---

## Verdict: 35 / 100 (low)

Crawlers can reach nulle.ai and read it, but AI answer engines have almost nothing to work with:

1. **They can't find it.** No search returned a single nulle.ai page, the founders, or DREA. An answer engine can only cite pages that are in its search index.
2. **There's little to cite.** One commercial URL carries about 800 words, mostly slogans, with no direct answers to "what, who, where, how much, how long".
3. **The entity is weak and contradicts itself.** The brand name collides with Nully, Nulo, Nullity AI and others. The product list differs between pages. No third-party profile links back to the site.

The plan below targets about **60 / 100 by end of day** (an estimate). Code and metadata are fully fixable today. Indexing and off-site authority can be *started* today, but they take days to weeks to register.

## Scorecard

| Dimension | Weight | Now | After today (est.) | Status |
|---|---:|---:|---:|---|
| Crawler access & availability | 10 | 9 | 10 | Pass |
| Indexation & discovery | 20 | 1 | 3 | **Fail** |
| Server-rendered extractable content | 10 | 7 | 9 | Partial |
| Content depth & answerability | 20 | 2 | 5 | **Fail** |
| Structured data (schema.org) | 15 | 4 | 8 | Partial |
| Entity consistency & disambiguation | 10 | 3 | 6 | **Fail** |
| Off-site corroboration | 10 | 1 | 3 | **Fail** |
| Metadata & AI-specific files | 5 | 5 | 9 | Partial |
| **Weighted total** | **100** | **35** | **~60** | |

The evidence for each row is in `scorecard.csv`.

---

## Findings, by impact

### F1. Not indexed or discoverable (Indexation: 1/10)
- These searches returned **zero** nulle.ai pages: `"nulle.ai"`, `site:nulle.ai`, `Nulle AI Atlanta`, the founders' names, and DREA. The only third-party trace is an app-intelligence listing for Wavelogs ([marlvel.ai](https://marlvel.ai/apps/wavelogs-ai-voice-notes)).
- There's no Search Console or Bing verification in `<head>`. The DNS provider can't be checked from here, so verify the status yourself.
- The sitemap (`src/app/sitemap.ts`) has no `lastmod`, and there's no IndexNow.
- Caveat: this was one search backend, not Google itself. Search Console is the source of truth.

### F2. One thin commercial page (Content: 2/10)
- Only 4 indexable URLs exist: `/`, `/founders`, `/privacy`, `/terms`. All four services share the homepage.
- The homepage has **812** visible words. Headings are brand lines ("Intelligence, where it matters.", "Built for what's next.") rather than descriptive ones.
- Nothing answers what engines get asked: where Nulle works (Atlanta appears only in the footer address), who it serves, how an engagement runs, or what it costs.
- `src/components/sections/About.tsx:19` explicitly avoids history, headcount and client names. That's a valid brand choice, but it removes the E-E-A-T signals answer engines weigh.

### F3. Contradictory entity facts (Entity: 3/10)
- `src/lib/founders.ts:58` says "2 Private AI products shipped: **DREA and WaveLog**".
- `src/lib/site.ts:53-66` lists **CreatorCam and Wavelogs** on the App Store.
- DREA (`discoverdrea.ai`, which runs in the same DigitalOcean team) is never linked.
- "Nulle, LLC", the App Store seller name, never appears on the site.
- The name collides with similar AI brands in results ([Nully](https://aiindigo.com/tool/nully), [Nulo](https://apps.apple.com/us/app/-/id6737268151), [Nullity AI](https://www.producthunt.com/posts/nullity-ai)). Engines need repeated, identical disambiguators: "Nulle, LLC · AI consultancy · Atlanta, GA · nulle.ai".

### F4. Minimal structured data (Schema: 4/10)
- `src/app/page.tsx:15-38` has one `Organization` block with name, url, logo, slogan, address and knowsAbout.
- It's missing `legalName`, `sameAs`, `founder`, `email`/`contactPoint`, `areaServed`, `foundingDate`, a `WebSite` node, `Service`/`OfferCatalog` for the 4 services, and `SoftwareApplication` for the apps.
- `/founders` has **no JSON-LD**, so there are no `Person` entities linking the founders to their LinkedIn profiles.

### F5. Content that crawlers mis-read or never see (Extractable: 7/10)
- **3 of 4 demo scenarios are client-only.** `Demonstration.tsx` (`useState(0)`) renders only "AI Receptionist". "The busywork, handled.", "Answers from your own documents." and "Your idea. Beautifully built." are absent from the HTML.
- **Headings lose their word breaks.** In `src/components/ui/Lines.tsx:15-17` the spans have no whitespace between them, so parsers read "From possibility**to** reality.", "Built for**what's** next." and "Three ideas behind**everything** we build."
- **The hero H1 is doubled.** `Hero.tsx:31-52` produces "Nothing between you and intelligence.Nothing betweenyou andintelligence."
- The first text in the DOM is the hero animation's labels ("Conversations Chats Workflows…"). They're aria-hidden but still in `textContent`.

### F6. Metadata and domain defects (Metadata: 5/10)
- `/founders`, `/privacy` and `/terms` emit `og:url=https://nulle.ai` and the homepage og:title and og:description. The `openGraph` set in `layout.tsx:40-47` is inherited unchanged.
- **`https://www.nulle.ai` fails the TLS handshake.** The DO app has only `nulle.ai` (PRIMARY) and no www alias.
- **No public contact details.** `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_SCHEDULING_URL` aren't in the DO app spec, so the live site shows no email, no phone and no booking link. The only way to reach Nulle is the form.
- There's no `/llms.txt`. It's cheap to add, but no major engine has confirmed using it, so treat it as optional upside.

### What's already good
- Every route is prerendered static HTML, and the live server returns the same 120 KB document to every bot tested.
- `robots.txt` allows everything and points at the sitemap. No AI crawler is blocked by user agent at the Cloudflare/DO edge.
- Titles, meta descriptions, canonicals, a 1200×630 OG image, `lang="en"` and descriptive alt text on portraits are in place.

---

## Plan for today

Everything is tracked in `action-plan.csv` (24 actions, with id, priority, owner, minutes, dependencies and a do-today flag). Today's work totals about 7.5 h: about 4.8 h is code I can do, and about 2.5 h needs your accounts.

### Block 1: you, first 30 min (starts the slow clocks)
| # | Action | Time |
|---|---|---|
| C1 | Google Search Console: add a **domain** property, add the DNS TXT record, submit `https://nulle.ai/sitemap.xml` | 20 m |
| C2 | Bing Webmaster Tools: import from GSC and submit the sitemap. Bing's index feeds ChatGPT search, Copilot and DuckDuckGo | 10 m |
| B1 | At your DNS host: CNAME `www` → the DO app. I add `www.nulle.ai` as an ALIAS on the DO app via API once you OK it | 15 m |
| B2 | Confirm the public email (e.g. `connect@nulle.ai`) and a booking URL if you have one. I set them in the DO spec as RUN_AND_BUILD_TIME | 5 m |

### Block 2: me, one PR on `claude/exciting-heisenberg-tyi1fr` (about 3 h)
| # | Action | Files |
|---|---|---|
| A1 | Fix heading word-gluing; single H1 text | `Lines.tsx`, `Hero.tsx`, `Philosophy.tsx` |
| A2 | Server-render all 4 scenario titles and summaries | `Demonstration.tsx` |
| A4 | Per-page OpenGraph | `founders/page.tsx`, `(legal)/*/page.tsx` |
| A9 | One product list, one spelling, link DREA | `founders.ts`, `site.ts` |
| A3 | Schema `@graph`: Organization, WebSite, Person×2, Service×4, SoftwareApplication; ProfilePage on /founders | new `lib/structured-data.ts` |
| A7 | "Nulle at a glance" plus an 8–10 question FAQ with FAQPage schema. It uses only facts from the site or from you | new `sections/FAQ.tsx` |
| A5 / A6 | Sitemap `lastModified`; `/llms.txt` | `sitemap.ts`, new route |
| A10 | Security headers and `poweredByHeader: false` | `next.config.ts` |
| A11 | Privacy-notice cookie line (see Security) | `(legal)/privacy/page.tsx` |

I'll read `node_modules/next/dist/docs/` before touching metadata or routes, since AGENTS.md says this Next.js has breaking changes. I'll verify with `npm run build`, `npm run lint` and a re-run of this crawl.

### Block 3: you, in parallel (about 1 h)
| # | Action |
|---|---|
| D1 | Create a LinkedIn **company** page (website nulle.ai, Atlanta, the same one-line description), and both founders set Nulle as their current employer |
| D2 | In App Store Connect, set the Marketing and Support URL to nulle.ai for CreatorCam and Wavelogs, and add a "A Nulle product" link on discoverdrea.ai |
| D5 | Put nulle.ai in the Instagram bio |
| E1 | Run the 20 prompts × 6 engines in `prompt-tracking.csv` **before** deploy, as a baseline |

### Block 4: after merge and deploy (DO deploys on push to `main`)
- **C3:** IndexNow ping for changed URLs.
- **C1:** request indexing in GSC for `/`, `/founders` and the new pages.
- **C4:** validate the schema and re-run the crawl.

### Stretch, or this week
- **A8:** four service pages at `/services/[slug]`, 500–800 words each. This is the biggest content lever, but the copy needs your facts and review.
- **D3:** Crunchbase and Clutch profiles.
- **D4:** a Google Business Profile as a service-area business with the address hidden. Google doesn't allow a PMB to be shown as a storefront.
- **E2:** a weekly count of AI-bot hits and AI referrers from the DO logs.

---

## Inputs I need from you (they unblock A3, A7, A8 and A9)
1. **Products:** Is DREA a Nulle product to list and link? Should the founders fact read "DREA and Wavelogs"? Is CreatorCam listed as a product but not a "private AI" product?
2. **Service area:** Atlanta metro only, Georgia/Southeast, US-wide, or remote-first?
3. **Founding year** of Nulle, LLC (for `foundingDate`).
4. **Profile URLs** for `sameAs`: the LinkedIn company page (once created), Crunchbase, any others.
5. **Public contact:** the email to publish, and a booking URL if you have one. A phone number is optional.
6. **Publishable engagement facts:** how a first engagement starts (free call? paid assessment?), typical timelines, and starting prices if you're willing. AI answers favour pages that state these.

## Security and compliance flags
- **Privacy notice is inaccurate.** `privacy/page.tsx:66-72` says "This website does not set cookies", but the live edge (Cloudflare, via DO App Platform) sets `__cf_bm` (HttpOnly, 30 min, bot management). It's a strictly necessary cookie, but the statement as written is false. I'll reword it; you or counsel should approve.
- **No security headers.** HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors and Permissions-Policy are all missing, and `X-Powered-By: Next.js` is exposed. A10 adds them.
  - HSTS goes **without** `preload`/`includeSubDomains` at first, because `mail.nulle.ai` and other subdomains haven't been audited.
  - A full CSP is deferred: static prerendering plus inline JSON-LD needs a nonce or hash strategy, which is its own change.
- **Dependencies:** no new packages are needed for any action in this plan.
- **Network change:** I added `nulle.ai` and `www.nulle.ai` to this repo's personal cloud environment allowlist so I could audit the live site. Remove them if you don't want that.

## Measurement
- **Leading indicators.** In GSC and Bing WMT, watch indexed pages (target: all sitemap URLs within 7–14 days) and impressions for brand and "AI consultant Atlanta" queries.
- **Direct.** Re-run `prompt-tracking.csv` weekly. `nulle_mentioned_Y_N` and `nulle_url_cited` by engine is the KPI, and the CSV is shaped for a Power BI line chart by `run_date`.
- **Crawl uptake.** E2 counts AI-bot hits from the DO logs. The site has no analytics by design, so this needs no change to the privacy notice.

## Method and limits
- Live checks ran from a cloud container through an egress proxy. User-agent tests show there's no UA-based blocking. They can't show how Cloudflare treats real, IP-verified bot traffic.
- `www.nulle.ai` failed at the TLS handshake through the proxy. Confirm it in a browser.
- The search-presence result reflects one search backend on 2026-11-25. Google and Bing may differ, and GSC and Bing WMT will show the real state.
- The scores are a weighted heuristic, not a standard. The "after today" figures assume Blocks 1–4 ship and don't count indexing lag.

### Sources
- [marlvel.ai: Wavelogs listing](https://marlvel.ai/apps/wavelogs-ai-voice-notes)
- [aiindigo.com: Nully](https://aiindigo.com/tool/nully)
- [App Store: Nulo](https://apps.apple.com/us/app/-/id6737268151)
- [Product Hunt: Nullity AI](https://www.producthunt.com/posts/nullity-ai)
