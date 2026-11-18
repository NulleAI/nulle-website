# Nulle website

The marketing site for Nulle. "Nothing between you and intelligence."

Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, GSAP + ScrollTrigger.

## Run it

Requires Node 20.9 or newer (`.nvmrc` pins 24).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Environment variables

All are optional in development. See `.env.example` for notes.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for canonical links, Open Graph, sitemap, structured data |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact address. Shown in the contact section and footer only when set |
| `NEXT_PUBLIC_SCHEDULING_URL` | Public booking page (https). Adds "Open our calendar" and "Choose a Time Now" |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Email delivery of contact requests through Resend |
| `CONTACT_WEBHOOK_URL` | Alternative or additional delivery: each request is POSTed as JSON |
| `CONTACT_FORM_SECRET` | Signs the form's anti-spam token. Set it in production (`openssl rand -hex 32`) |

`NEXT_PUBLIC_*` values are inlined at build time, so rebuild after changing them.

## Contact form

`src/app/actions/contact.ts` is a server action. Each request goes through: honeypot, validation
(shared with the browser, `src/lib/contact/schema.ts`), a signed timing token, a per-client rate
limit (5 per 10 minutes), then delivery.

- A request is reported as sent only when a delivery channel accepts it.
- With no channel configured, production shows an honest "not sent" error. Development logs the
  request to the server console and says so on screen.
- The rate limit is in memory, per server process. On serverless hosting, add the platform's own
  rate limiting in front of it.

### Integration status

- Webhook delivery: tested end to end against a local receiver (success and failure).
- Resend email delivery: implemented, **not tested**, because no API key was available. Send one
  real request after adding the three Resend variables.
- Scheduling: a configurable link, tested with a placeholder URL. No booking is made by this site;
  it hands off to your scheduling page.

## Before launch

- Set the environment variables above on your host, including `NEXT_PUBLIC_SITE_URL`.
- Have the privacy notice and terms (`src/app/(legal)`) reviewed. They describe what this site
  does, but they are starting drafts, not legal advice, and state no governing law.
- If you have vector (SVG) logo files, replace the PNGs in `src/assets/brand`.

## Structure

```
docs/design-spec.md          Visual design specification
src/app                      Routes, metadata, icons, Open Graph image, server action
src/components/sections      The seven page sections
src/components/hero          The hero's WebGL signal ribbon (no 3D library)
src/components/practice      The interactive demonstration (authored, deterministic scenarios)
src/components/motion        Scroll choreography, driven by data attributes
src/lib/contact              Validation, token, rate limit, delivery
src/lib/site.ts              Site configuration
```

Motion respects `prefers-reduced-motion`: every element renders in its final state, and the hero ribbon becomes a single still frame. The ribbon stops drawing whenever the hero is off screen.

## Deploy

Any Node host that runs Next.js works. On Vercel: import the repository, add the environment
variables, deploy.
