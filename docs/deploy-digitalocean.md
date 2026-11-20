# Deploying to DigitalOcean

nulle.ai runs on DigitalOcean App Platform as one Node web service. App
Platform builds the site with `npm run build` and runs it with `npm start`
(`next start`). The intended app spec is in [`.do/app.yaml`](../.do/app.yaml).

App Platform does not read that file from the repository. The live spec is
stored in DigitalOcean, under the app's **Settings > App Spec**, and changes
are made there. Keep `.do/app.yaml` in step with it by hand.

## Settings

| Variable | Value | Scope | Encrypt |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://nulle.ai` | Build and run time | No |
| `CONTACT_TO_EMAIL` | `connect@nulle.ai` | Run time | No |
| `CONTACT_FROM_EMAIL` | `Nulle Website <website@mail.nulle.ai>` | Run time | No |
| `RESEND_API_KEY` | the Resend API key | Run time | **Yes** |
| `CONTACT_FORM_SECRET` | a long random string (`openssl rand -hex 32`) | Run time | **Yes** |

`NEXT_PUBLIC_SITE_URL` is read during the build, so after changing it, use
**Actions > Force rebuild and deploy**. A restart alone keeps the old value.

Other settings:

- **Node version:** set by `engines` in `package.json` (24.x). Without it, App
  Platform builds on Node 22.
- **Port:** App Platform sets `PORT` from the HTTP port (8080), and
  `next start` listens on it.
- **Instance size:** `apps-s-1vcpu-0.5gb` (512 MB, $5 a month). A production
  build peaked near 220 MB while resizing every photo on the site. If the
  app's **Insights** memory graph stays high, move to `apps-s-1vcpu-1gb-fixed`
  (1 GB, $10 a month).
- **Health check:** App Platform requests `/` and only sends traffic to a new
  deployment once it answers. Until then the previous deployment keeps
  serving.
- **Contact form limit:** at most five submissions per visitor in ten
  minutes, counted in memory by each instance. The visitor's address comes
  from App Platform's `do-connecting-ip` header.

## 1. Try it on a test app

Before touching the live app, build the redesign branch in a separate,
temporary app. It gets its own `*.ondigitalocean.app` address, so nulle.ai is
not affected. It's billed by the second, so a day of testing costs cents.

1. In DigitalOcean, open **Apps** and choose **Create App**.
2. Source: **GitHub**, repository `NulleAI/nulle-website`, branch
   `redesign-nov-2026`, source directory `/`. Leave **Autodeploy** on.
3. App Platform detects a Node.js **Web Service**. Edit it and check:
   - Build command: `npm run build`
   - Run command: `npm start`
   - HTTP port: `8080`
   - Size: 512 MB ($5 a month), one container
4. Add the five environment variables from the table at the **app level**.
   Tick **Encrypt** for the two secrets. Keep `NEXT_PUBLIC_SITE_URL` as
   `https://nulle.ai` even here: links that search engines see then point at
   the real site, not the test address.
5. Name it `nulle-website-test`, region **New York**, and create it.
6. When the build finishes, open the app's address and check:
   - The home page, scrolling through the hero animation.
   - The founders page, the privacy notice and the terms.
   - The Mobile Apps tab of the example (the Atlas photos load).
   - The contact form: send one request. It should arrive at
     connect@nulle.ai, and replying should go to the address typed in the
     form.

If anything fails, the build and runtime logs are under the app's
**Activity** and **Runtime Logs** tabs.

## 2. Switch the live app over

The live app deploys `main` whenever it changes. Merging first would deploy
the new code with the old static-site settings, which serves a broken site,
so switch the app first, then merge.

1. **Back up the current spec.** Live app > **Settings** > **App Spec** >
   **Download**. Keep this file: it's the way back.
2. **Add the variables.** Live app > **Settings** > **App-Level Environment
   Variables** > **Edit**. Add the five variables from the table, with
   **Encrypt** ticked for the two secrets, and save. The current site
   redeploys, with no visible change.
3. **Swap the components.** **Settings** > **App Spec** > **Edit**. Delete the
   whole `static_sites:` section, the whole `functions:` section, and the
   `ingress:` section if there is one. Paste this in their place:

   ```yaml
   services:
     - name: web
       environment_slug: node-js
       github:
         repo: NulleAI/nulle-website
         branch: redesign-nov-2026
         deploy_on_push: true
       source_dir: /
       build_command: npm run build
       run_command: npm start
       http_port: 8080
       instance_size_slug: apps-s-1vcpu-0.5gb
       instance_count: 1
       health_check:
         http_path: /

   ingress:
     rules:
       - component:
           name: web
         match:
           path:
             prefix: /
   ```

   Leave everything else as it is: `name`, `region`, `domains`, `envs`,
   `alerts` and any other sections. Save. The app builds the new site, and
   nulle.ai switches over once it passes its health check.
4. **Check nulle.ai**, the same list as the test app, including one contact
   form request.
5. **Merge the pull request** from `redesign-nov-2026` into `main` on GitHub.
6. **Point the app at `main`.** **Settings** > **App Spec** > **Edit**, change
   `branch: redesign-nov-2026` to `branch: main`, and save. It redeploys the
   same code. From now on, every push to `main` deploys.
7. **Delete the test app**: `nulle-website-test` > **Settings** > **Destroy**.

### Going back

- **Before the merge (step 5):** **Settings** > **App Spec** > **Upload** the
  file from step 1. The old site returns.
- **After the merge:** also revert the merge on GitHub, so `main` holds the
  old site again, then upload the backup.

## Day to day

- Push to `main` to deploy. A failed build leaves the current site running.
- Change variables under **Settings** > **App-Level Environment Variables**.
  Use **Force rebuild and deploy** for `NEXT_PUBLIC_` variables.
- Logs are under **Runtime Logs**. A contact request that fails to send is
  logged there, and the visitor sees an honest error.
