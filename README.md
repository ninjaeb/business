# Gotka Business Directory

A public, trilingual (English / 中文 / Bahasa Malaysia) directory of businesses,
plus a self-service partner portal, built with Next.js (App Router),
TypeScript, Tailwind CSS, and Prisma on PostgreSQL. Deployed at
[business.gotka.com](https://business.gotka.com).

This is a standalone app — it has its own database, its own login/session
system, and its own small admin section for moderating listings. It shares
no runtime dependency with `crm.gotka.com` (the Gotka CRM it was originally
extracted from).

## Features

- **Public directory** (`/[locale]/business`) — search/browse listings,
  category and location hub pages, a per-listing detail page (products &
  services, an embedded video, a photo gallery, hours, location, FAQ, a News
  & Promotions feed, a spam-guarded contact form), server-rendered for both
  traditional search engines and AI answer engines (ChatGPT, Perplexity,
  etc.). Every page is available in English, 中文, and Bahasa Malaysia.
- **Partner self-service** (`/business-portal`) — a business creates an
  account (email/password or Google), fills in and submits a listing for
  review, and — once approved — manages it, gets emailed and (once
  WhatsApp Business is connected) WhatsApp'd the moment a visitor's
  inquiry comes in, replies to inquiries, and runs a small private CRM of
  its own: Companies, Contacts, Deals, Tasks, strictly scoped to that one
  account.
- **AI-assisted listing content** *(optional, needs `OPENROUTER_API_KEY`)*
  — rewrite/expand the About text, generate services or FAQ entries, write
  SEO title/description, translate the whole listing into 中文/Malay, or
  auto-create an entire draft listing from a Google Maps listing + website
  in one click.
- **Staff moderation** (`/admin`) — approve/reject/unpublish listings,
  manage the shared category list, see directory-wide stats and recent
  leads.
- **SEO/GEO** — a generated sitemap and `llms.txt`, hreflang alternates,
  JSON-LD (WebSite/Organization/LocalBusiness/FAQPage/breadcrumbs), IndexNow
  pings on publish/unpublish, and per-locale Open Graph share images.

Everything public is served from `PartnerListing.publishedSnapshot` — a
JSON copy of the listing frozen at its last approval. A partner's live
edits never reach the public page until approved again.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack build)
- TypeScript, Tailwind CSS v4
- [Prisma ORM 7](https://www.prisma.io) with the `@prisma/adapter-pg` driver adapter
- PostgreSQL 14+
- `jose` for JWT session cookies, Node's `crypto` (scrypt) for password hashing
- Optional: Google OAuth (sign-up/login), Google Places (listing autofill), OpenRouter (AI content), WhatsApp Business (Cloud API, new-lead alerts), IndexNow, Google Search Console / Bing Webmaster Tools verification, Plausible Analytics
- Deploy target: a plain Node `server.js` entrypoint for cPanel/Passenger-style shared hosting — no platform lock-in, `next start` works anywhere Node runs too

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up a PostgreSQL database

Point `DATABASE_URL` at any PostgreSQL 14+ database. Copy the example env
file and fill in your connection string:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/business_directory"
```

Also set `SESSION_SECRET` (required — signs the login session cookie):

```bash
echo "SESSION_SECRET=\"$(openssl rand -base64 32)\"" >> .env
```

If you don't already have a database, the quickest way to get one locally
is Docker:

```bash
docker run -d --name business-directory-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=business_directory -p 5432:5432 postgres:16
```

### 3. Run migrations and seed

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

The migration creates the schema and generates the Prisma Client into
`src/generated/prisma` (gitignored — run `npx prisma generate` again any
time the schema changes without running a migration). The seed script
populates the curated business-category list the listing editor's category
picker uses (categories aren't admin-editable, only deletable from
`/admin`) and ensures the `Settings` singleton row exists.

### 4. Create your first admin login

```bash
npm run create-admin -- --email="you@example.com" --name="Your Name"
```

Prints a generated password once — copy it down, then sign in at
`/business-portal/login`. An admin account lands at `/admin` after signing
in; a partner account (created via the public sign-up page) lands at
`/business-portal`.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the bare root
redirects to the public directory at `/en/business` (or `/zh`/`/ms`, guessed
from your browser).

## Environment variables

See `.env.example` for the full list. `DATABASE_URL`, `SESSION_SECRET`, and
`SITE_URL` are required; everything else (Google OAuth, Google Places,
OpenRouter, search-console verification, IndexNow, Plausible, deploy
automation) is optional — each feature just stays off until its variables
are set. Outbound email and WhatsApp notifications aren't env vars at all —
see below.

## Email and WhatsApp notifications (optional, admin-configured)

Both of a partner's new-lead notifications — the email alert and the
WhatsApp ping — are connected from `/admin` (an **Email (SMTP)** card and a
**WhatsApp** card), not env vars, so a non-technical admin can set up or
change either without asking a developer to redeploy. The two are
independent: a partner gets whichever is configured (or neither, or both),
and connecting one is never required for the other to work. Each save
verifies the connection first — it fails right there on a typo'd host or a
wrong credential, rather than silently on the next lead — and a submitted
password/access token is never redisplayed; leaving that field blank on a
later save keeps whatever's already connected.

### Email (SMTP)

`/admin` → **Email (SMTP)**: host, port, an optional username/password, and
the from-name/from-address a notification is sent as. This is also what a
partner's reply to a lead sends from (see the *Public partner directory*
description in Features above).

### WhatsApp Business

`/admin` → **WhatsApp**, using the official [Meta WhatsApp Business
Platform (Cloud API)](https://developers.facebook.com/docs/whatsapp/cloud-api),
never an unofficial/browser-automation integration:

1. Create a [Meta App](https://developers.facebook.com/apps) (type:
   Business), then add the **WhatsApp** product to it.
2. In WhatsApp → API Setup, note the **Phone number ID** and add/verify a
   phone number (the free test number Meta provides works for trying this
   out, but can only message pre-approved recipient numbers — add a real,
   verified business number to notify any partner). API Setup shows a
   temporary access token that expires after 24 hours; generate a
   permanent one instead (a System User token, from Meta Business Settings
   → System Users).
3. Enter both **Phone number ID** and **Access token** in `/admin` →
   **WhatsApp** and save — it calls Meta to confirm the phone number ID
   actually belongs to that access token before saving either, and shows
   the connected number once it does.
4. **Create the message template** so a partner is pinged the moment
   someone contacts them — Meta App Dashboard → WhatsApp → Message
   Templates → Create Template:
   - Name: `new_directory_lead_notification` (must match exactly — this
     app hard-codes it)
   - Category: `Utility`
   - Language: `English`
   - Header (optional, static text only — no variable): anything you like,
     e.g. "New directory inquiry"
   - Body: `New directory inquiry from {{1}} ({{2}})` on its own line,
     then a blank line, then `Reply here: {{3}}`
   - Footer (optional, static text only): anything you like, e.g.
     "Automated notification from the Gotka Business Directory"
   - No buttons — the link is the body's own `{{3}}` variable; WhatsApp
     renders it as tappable on its own. Sample values Meta asks for when
     you submit: e.g. `Sarah Tan` / `Acme Corp` /
     `https://business.gotka.com/business-portal/business-leads/abc123`.

   Submit for review — Meta reviews the literal template text, so it
   should match what's above exactly.
5. **Nothing else to configure** — a partner with a phone number on file
   (required on their profile) gets the WhatsApp ping automatically once
   the template's approved; without WhatsApp connected in `/admin`, or
   while the template's still pending review, the lead is still created
   and still emailed (if configured) — only the WhatsApp half is silently
   skipped.

`{{1}}` is the visitor's name, `{{2}}` their company (or "No company
given"), `{{3}}` a link straight to the lead in that partner's portal,
built from `SITE_URL`.

## Deploying on cPanel

The app ships with everything needed for cPanel's **Setup Node.js App**
tool (Phusion Passenger): a plain-Node `server.js` entrypoint that
regenerates the Prisma Client and rebuilds the app itself on every start
(see "No `postinstall` step" under Troubleshooting for why that isn't
handled by `npm install`).

**Requirements:** a cPanel account with "Setup Node.js App" and
"PostgreSQL Databases" (not every cPanel install shows this by default —
ask your host to enable the `postgresql` feature on the account if it's
missing), and a Node.js version of 20.19+, 22.12+, or 24+ available in the
Node selector (Prisma 7 requires one of those).

1. **Create the database.** In cPanel → *PostgreSQL Databases*, create a
   database and a user, add the user to the database with all privileges.
2. **Get the code onto the server**, either:
   - cPanel → *Git Version Control* → clone this repo, then use
     *Manage → Pull or Deploy → Deploy HEAD Commit*. This runs the copy
     tasks in `.cpanel.yml` — edit the `DEPLOYPATH` in that file first to
     match the Application root you'll use in step 3, and commit that
     change.
   - or upload/`rsync` the repository contents directly into the
     Application root.
3. **Create the Node app.** cPanel → *Setup Node.js App* → Create:
   - Node.js version: 20.19+, 22.12+, or 24+
   - Application mode: `Production`
   - Application root: e.g. `business.gotka.com` (must match `DEPLOYPATH`
     in `.cpanel.yml` if you used Git deploy)
   - Application URL: `business.gotka.com`
   - Application startup file: `server.js`
4. **Set environment variables** in that same Node app screen —
   `DATABASE_URL`, `SESSION_SECRET`, `SITE_URL` at minimum (see
   `.env.example` for the rest).
5. **Install, generate, and migrate.** Click *Run NPM Install* in the Node
   app UI. Then open the app's terminal and run:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   npm run create-admin -- --email="you@example.com" --name="Your Name"
   ```
   `npx prisma generate` is required here — unlike `prisma migrate dev`,
   `migrate deploy` does **not** regenerate the Prisma Client, and this repo
   has no `postinstall` script to do it automatically either (see
   "No `postinstall` step" below). Skipping it fails every one of the
   commands above (and the app itself, until its first restart) with
   `Cannot find module '@/generated/prisma/client'`.
6. **Restart** the app from the Node.js Selector UI, then visit the
   Application URL. `server.js` builds the production bundle itself on
   every start (there's no separate "build" step to run) — the app takes
   ~20-30s to come up while `next build` runs; check `stderr.log` in the
   Application root if it doesn't come up.

No native binaries to worry about: Prisma 7's driver-adapter architecture
(`@prisma/adapter-pg`, already configured in `src/lib/db.ts`) talks to
Postgres through the pure-JS `pg` driver instead of a platform-specific
compiled binary, which tends to be the main source of pain on shared
hosting.

### Auto-deploy from GitHub

A push to one branch does everything the manual redeploy steps above do —
pull, install (only if `package-lock.json` changed), migrate, restart —
without touching cPanel. This only works when the Application root *is*
the Git checkout directory itself — the deploy script runs `git reset
--hard` directly on the Application root.

1. **Set `DEPLOY_WEBHOOK_SECRET` and `DEPLOY_BRANCH`** as environment
   variables in the Node app screen: a random secret
   (`openssl rand -base64 32`) and the exact branch name this environment
   deploys (e.g. `main`). Both are required together — auto-deploy stays
   off, returning `503` on the webhook, until they're set.
2. **Register the webhook.** On GitHub: repo → *Settings → Webhooks → Add
   webhook* — Payload URL `https://business.gotka.com/api/deploy/webhook`,
   Content type `application/json`, Secret: the same value as
   `DEPLOY_WEBHOOK_SECRET`, and just the `push` event. Save, then restart
   the app so it picks up the new env vars.
3. **Push to `DEPLOY_BRANCH`.** GitHub calls the webhook, which spawns the
   deploy in the background and responds immediately (so GitHub's own
   webhook delivery doesn't time out waiting on `npm install`/migrations)
   — a push to any other branch, or any other event GitHub might send
   (like its initial `ping` when you save the webhook), is acknowledged
   and ignored without deploying anything.

Everything the deploy does is appended to `deploy.log` in the Application
root (already covered by `.gitignore`) — check there first if a push
doesn't seem to have taken effect. **The deploy also tests itself**: after
signalling the restart, the script keeps polling `/api/health` (a public
JSON probe — which commit the running build was made from, whether the
database answers, whether `/public/sitemap.xml` and `/public/llms.txt` are
real or still their committed placeholders) until the app reports the new
commit as built, then checks what a broken deploy has actually broken
before: the served `/sitemap.xml`, `/zh/business` rendering with
`lang="zh"`, the directory's share image, one listing logo (the `og:image`
route handler), and that Googlebot/bingbot get a 200 (the AI crawlers —
GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot — are only warned about,
since a block there is usually a host rule). It needs the site's public
origin: `DEPLOY_SMOKE_URL` (or `SITE_URL`); with neither set it's skipped.
A failure can't undo the deploy — the restart already happened — but it
lands in `deploy.log` with the reason instead of leaving an old build
serving silently.

### Troubleshooting

- **"Deploy HEAD Commit" is greyed out** — that button deploys whatever
  commit is already in cPanel's *local* checkout, which is a separate copy
  from GitHub. Pushing a new commit doesn't update it by itself. Click
  *Update from Remote* first (same *Pull or Deploy* page) to fetch the new
  commit into the local checkout — *Deploy HEAD Commit* unlocks once its
  HEAD actually differs from what's currently deployed.
- **"The system cannot deploy" / "no uncommitted changes exist on the
  checked-out branch"** — the Git checkout (shown on the *Manage
  Repository* page) has local changes. If your Application root *is* the
  Git checkout directory (a valid, simpler setup — everything below
  assumes this), the usual cause is cPanel's own runtime files landing in
  it: `.htaccess` (the Node proxy config it writes), `stderr.log`/
  `stdout.log`, and `tmp/` (Passenger/LiteSpeed's restart signal) all show
  up as untracked files the moment the app starts. This repo's
  `.gitignore` already excludes them — `git status` in that directory
  should be clean after pulling the latest commit. If it's still dirty, a
  modified `package-lock.json` usually means `npm install` was run
  directly in that directory, which is fine — just
  `git checkout -- package-lock.json` and retry *Deploy HEAD Commit*.
- **`stderr.log` shows `Error: Cannot find module 'next'`** — dependencies
  aren't installed yet in the Application root. Click *Run NPM Install* in
  the Node app screen.
- **`stderr.log` shows `Could not find a production build in the '.next'
  directory`** or **the app still shows old behavior after redeploying and
  restarting** — redeploy the latest commit and restart; `server.js`
  rebuilds automatically on every start.
- **`next build` fails with `Error [TurbopackInternalError]: Symlink
  [project]/node_modules is invalid, it points out of the filesystem
  root`** — a `nodevenv`-hosting quirk: cPanel installs dependencies into
  a separate per-account directory and symlinks `node_modules` back into
  the Application root from there, which Turbopack refuses to follow by
  default. `next.config.ts` already works around this (it widens
  Turbopack's root to `$HOME` whenever `$HOME` is an ancestor of the app
  directory, which is exactly this situation) — if you still hit this,
  make sure you've deployed the latest commit.
- **`next build` fails with `Cannot find module '@tailwindcss/postcss'`**
  (or `'typescript'`) — cPanel's "Production" Application mode sets
  `NODE_ENV=production`, which makes `npm install` skip `devDependencies`.
  Since the build itself runs on this server, anything `next build` needs
  has to be a regular `dependency`, not a dev one. This repo already lists
  them that way; if you still hit this, re-run *Run NPM Install* after
  pulling the latest commit.
- **No `postinstall` step, on purpose.** Regenerating the Prisma Client
  automatically in a `postinstall` script, right after `npm install`, is
  fragile on at least one real cPanel/nodevenv hosting setup — that
  lifecycle script can run from inside the nodevenv's own internal
  directory rather than the project directory, and every npm-provided
  variable meant to work around exactly this (`$INIT_CWD`,
  `$npm_config_local_prefix`) can report that same wrong directory too.
  Instead, Prisma Client regeneration happens where it already works
  reliably: `server.js` regenerates it on every app start/restart, and
  `npx prisma migrate dev`/`migrate deploy` regenerate it as a side effect
  too — neither goes through an npm lifecycle script. *Run NPM Install*
  only installs dependencies — expect no Prisma-related output from it.
- **Build fails on `/icon` or `/apple-icon` with `vips2png: unable to
  write to target` / `glib: Error creating thread: Resource temporarily
  unavailable`** — the favicon/opengraph-image are rendered at build/
  request time via `next/og`, which briefly needs to spawn a native
  image-processing thread; on tightly resource-capped shared hosting that
  can momentarily fail. `server.js` keeps the previous build serving when
  this happens and retries the build by itself — up to 3 attempts per
  commit, 5 minutes apart, logged in `stderr.log`.
- **`/sitemap.xml` or `/llms.txt` serve a `Placeholder` comment with no
  URLs** — both are static files in `/public`, committed as placeholders
  and overwritten with real content when the app starts
  (`src/instrumentation.ts`) and on every publish/unpublish. Seeing the
  placeholder means the app process that should have written them never
  started on this commit: usually `next build` failed after a deploy and
  `server.js` restored the previous build. `GET /api/health` says which
  commit is actually built versus checked out; `stderr.log` has the build
  error.
- **Route handlers answer `500` after ~10 seconds while pages work**
  (`/api/directory-images/logo/...`) — a starved connection pool. Next.js
  compiles a server module once per bundling layer it's imported from, so
  pages and route handlers can each get their own `PrismaClient` and pool;
  `src/lib/db.ts` shares one client per process (cached on `globalThis` in
  production too) and fails a starved query after 5s so the symptom can't
  hide behind a slow page. If it still happens, the account is out of
  connections for some other reason — see the `pool timeout` entry below.
- **An AI crawler (`GPTBot`, `PerplexityBot`, ...) gets an empty `429` or
  `403` while browsers, Googlebot and bingbot get `200`** — the block is
  at the host, not in this app: `robots.txt` allows everything. On cPanel
  it's usually Imunify360's anti-bot rules or a LiteSpeed/`.htaccess` rule
  matching the user agent. If the directory is meant to be found and cited
  by AI answer engines, whitelist the crawler's user agent there.
- **`DEPLOYPATH`** in `.cpanel.yml` must match your actual Application
  root (it uses `$HOME` so only the folder name needs editing) — commit
  the change, since `.cpanel.yml` is read from the Git checkout, not the
  deployed app.
- **`stderr.log` fills with `failed to get redirect response ...
  ERR_SSL_PACKET_LENGTH_TOO_LONG` (or `ECONNREFUSED`) on every form
  submission**, sometimes alongside `Failed to find Server Action` —
  redeploy the latest commit and restart (`server.js` sets
  `__NEXT_PRIVATE_ORIGIN` so Server Actions that redirect don't guess the
  wrong port/protocol behind cPanel's TLS-terminating proxy); a page
  loaded before the redeploy may also throw one `Failed to find Server
  Action` on its first submission afterward — refreshing it clears that
  up.
- **A CLI script fails with `pool timeout: failed to retrieve a
  connection from pool` (`P2039`), or Postgres logs `sorry, too many
  clients already` / `remaining connection slots are reserved`** — the
  shared hosting account's Postgres `max_connections` is close to
  exhausted, usually by the always-running app's own connection pool.
  `src/lib/db.ts` already defaults to a conservative pool size (`max=5`);
  lower it further by adding `?max=2` to `DATABASE_URL`, or ask your host
  to raise `max_connections` for the account.

## Project structure

```
src/app/[locale]/business/     Public directory (home, listing, category, location, signup, benefits)
src/app/business-portal/       Partner login + dashboard (listing, leads, business CRM, profile)
src/app/admin/                 Staff moderation (approve/reject/unpublish listings, categories)
src/app/actions/               Server Actions
src/app/api/                   Route handlers (health, images, OAuth, deploy webhook, IndexNow key)
src/components/directory/      Public/partner-facing directory components
src/components/business-crm/   The business-portal's own Companies/Contacts/Deals/Tasks UI
src/components/ui/             Design-system primitives
src/lib/                       Data access, auth, SEO/sitemap generation, integrations
prisma/schema.prisma           Data model
server.js, scripts/deploy.ts   cPanel deploy pipeline
```

## Useful commands

```bash
npm run dev            # start the dev server
npm run build           # production build
npm run lint             # eslint
npx prisma studio        # browse the database
npm run create-admin -- --email="..." --name="..."   # create a staff/admin login
```
