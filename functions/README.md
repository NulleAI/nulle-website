# Website forms function

Both homepage forms post JSON to `/api/contact/submit`: the contact form (`kind: "review"`, the default) and the AI leak checklist request (`kind: "checklist"`, work email only). That path is served by the `api` functions component in `.do/app.yaml`, which runs `packages/contact/submit.js` on DigitalOcean Functions (the platform's default Node.js runtime; the code needs Node.js 18 or later). The function checks the request and sends one plain-text email to `CONTACT_TO` through Resend, with reply-to set to the visitor's address.

No npm dependencies: it calls Resend's REST API with the runtime's built-in `fetch`.

## What it checks

- Only `POST` requests from `ALLOWED_ORIGINS` are accepted. If that variable is empty, every request is rejected.
- Honeypot field and a minimum fill time. Bots get a quiet `200` and nothing is sent.
- Required fields, allowed values for industry and topic, and length limits. Line breaks are stripped from single-line fields.
- At most 5 submissions per IP per 10 minutes, counted per warm function instance. This is a speed bump, not a guarantee.
- Plain-text email only. The function never emails the visitor, so it can't be used to send mail to arbitrary addresses.
- Logs record only error codes, never what a visitor submitted.

## Setup

1. **Resend:** add the `nulle.ai` domain and create the DNS records Resend lists (SPF and DKIM; DMARC is recommended). Wait until the domain shows as verified. Then create an API key with **Sending access** restricted to `nulle.ai`.
2. **DigitalOcean:** apply the app spec, then add the secret.
   ```
   doctl apps spec validate .do/app.yaml
   doctl apps update <app-id> --spec .do/app.yaml
   ```
   In the dashboard, open App > Settings > `api` > Environment Variables and add `RESEND_API_KEY`. Tick **Encrypt** and set scope to **Run and build time**. Redeploy.
3. **Check it:** submit both forms on nulle.ai and confirm the emails reach `connect@nulle.ai`.

`CONTACT_TO`, `CONTACT_FROM` and `ALLOWED_ORIGINS` are set in `.do/app.yaml`. `CONTACT_FROM` has to use the domain you verified in Resend.

All four variables have to exist and be non-empty at build time (scope **Run and build time**). `project.yml` pulls them in during the build, and the build fails with `The following substitutions could not be resolved` if any is missing, empty, or scoped to run time only.

## Tests

```
node --test functions/tests/submit.test.js
```

Resend is mocked in the tests, so nothing is sent.

## Deploying outside App Platform (optional)

`doctl serverless deploy functions` reads `${VAR}` values from `functions/.env`, which is ignored by git. The function then runs on a different host, so add that host's origin to `ALLOWED_ORIGINS`.
