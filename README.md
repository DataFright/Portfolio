# Matthew Swaney's Portfolio

This portfolio is intentionally built like a technical blueprint, not a default website template.

The goal was to make the page feel engineered:
- crisp grid lines in the background
- foreground panels that lock to the same grid math
- subtle motion that still preserves structural alignment
- strong visual hierarchy without relying on generic UI kits

It was also just fun to build this way.

## Design Concept

Most portfolio pages use a common pattern:
- soft card layout
- standard responsive breakpoints
- utility-first classes or starter theme defaults

This project takes a different approach.

The page uses a 24px blueprint cell as the base design unit. Layout, spacing, panel widths, offsets, and decorative annotations all reference this same unit. That keeps the composition visually coherent even as breakpoints change.

## Blueprint System

### 1) Single source of geometry truth

The geometry engine lives in [src/blueprint.js](src/blueprint.js).

It computes:
- layout columns by breakpoint
- section spans and card starts in grid cells
- custom CSS variables consumed by styles

Instead of hardcoding unrelated CSS values across components, the engine writes coordinated variables to the root, and CSS consumes those values.

### 2) Shared background and foreground grid language

The page background and panel surfaces both use layered grid lines:
- minor lines every 24px
- major lines every 5 cells

This produces the drafting-table look while keeping panels and page framing aligned to the same visual rhythm.

### 3) Vertical snapping for structural rhythm

After render, visible sections and panel blocks are snapped so heights land on 24px boundaries.

Why this matters:
- prevents subtle drift where card edges land "almost" on grid lines
- keeps stacked sections visually disciplined
- makes the layout feel intentional at all viewport sizes

## Foreground Motion, But Controlled

The foreground plane has a slight drift effect tied to wheel/scroll impulse.

Key point:
- motion is decorative, but bounded and damped
- sections remain synchronized as one plane
- grid integrity is preserved instead of becoming chaotic parallax

This gives the interface energy while still feeling engineered.

## Why this is better than a basic template

For this specific portfolio concept, this approach gives benefits a stock template does not:

1. Strong identity
A blueprint language makes the project memorable and communicates systems thinking.

2. Visual consistency through math
A grid-driven layout scales with fewer random spacing decisions.

3. Better storytelling for engineering work
The UI itself demonstrates structure, constraints, and implementation discipline.

4. Easier intentional iteration
Because spacing and placement are cell-based, adjustments are predictable and coherent.

## Left-Rail Annotations

The left-side annotation rail extends the blueprint metaphor:
- technical labels
- measurement reference line (grid-derived pixel length)
- formula note

On smaller viewports, behavior is adjusted so details remain visible rather than clipping off-screen.

## Project Structure Sections

Each featured project includes:
- direct links
- architecture/testing/deployment notes
- explicit repository tree block for fast technical scanning

This helps technical reviewers understand scope and maturity quickly.

## Run Locally

Install and run:

```bash
npm install
npm run dev
```

Default local URL:
- http://localhost:3000/

## Build

```bash
npm run build
```

## Test Files

Alignment and blueprint integrity checks are in:
- [tests/alignment.spec.js](tests/alignment.spec.js)
- [tests/alignment.js](tests/alignment.js)

## Stack

- React
- Vite
- Playwright (alignment/visual behavior checks)

## Private Visitor Tracking (No UI Display)

This repo now includes private visitor intelligence plumbing that does not render on the portfolio page.

### What was added

- Frontend tracker module: [src/tracking/visitorTracker.js](src/tracking/visitorTracker.js)
- Frontend wiring:
	- [src/main.jsx](src/main.jsx) sends `page_view`
	- [src/App.jsx](src/App.jsx) sends engagement signals (time and scroll depth)
- Cloudflare backend scaffold:
	- [tracking-worker/src/index.js](tracking-worker/src/index.js)
	- [tracking-worker/schema.sql](tracking-worker/schema.sql)
	- [tracking-worker/wrangler.toml](tracking-worker/wrangler.toml)
	- [tracking-worker/README.md](tracking-worker/README.md)
- Terminal query helper: [scripts/tracking-query.mjs](scripts/tracking-query.mjs)

### Data captured (backend-only)

- Masked IP hash (not full IP)
- Country/region/city (Cloudflare edge metadata)
- ASN and network org where available
- User-Agent and bot/human score
- Engagement metrics: time on page, max scroll depth, repeat sessions
- Visit timestamp in UTC (`visit_iso`)
- Stable visitor key hash (`visitor_key`) for repeat-identification without personal name data
- Device classification (`desktop`, `mobile`, `tablet`, `touch_desktop`)
- Network classification (`residential`, `datacenter`, `proxy_or_vpn`, `corporate_or_unknown`)
- VPN/proxy suspicion flag and bot-reason signals

### Backend hardening controls

- Allowed event-type validation on collector endpoint
- Payload size limits
- Timestamp freshness checks to reject stale/future spoofed events
- Per-IP-hash per-minute ingestion rate limiting in D1
- Dual admin auth (`Authorization` bearer token + `X-Access-Code`)

### Important limitation

You cannot reliably get a real visitor name from passive web traffic. Best practical recruiter signal is organization network plus engagement behavior.

### Frontend environment

Copy values from [.env.example](.env.example) into your local `.env.local` and in Vercel environment variables:

- `VITE_TRACKING_ENDPOINT`
- `VITE_TRACKING_SITE_KEY`

### Backend deployment (Cloudflare Worker + D1)

See [tracking-worker/README.md](tracking-worker/README.md) for full setup.

High level:

1. Create D1 database.
2. Apply [tracking-worker/schema.sql](tracking-worker/schema.sql).
3. Configure [tracking-worker/wrangler.toml](tracking-worker/wrangler.toml) with real domain and DB id.
4. Set Worker secrets:
	 - `ADMIN_TOKEN`
	 - `ADMIN_CODE`
5. Deploy Worker.

### Terminal-only access

Copy values from [tracking.env.example](tracking.env.example) into local `tracking.env`.

The query script auto-loads `tracking.env`, so you do not need to export variables manually each terminal session.

Optional parser setting in `tracking.env`:

- `TRACKING_OWNER_TIMEZONE` (example: `America/Chicago`) for owner-local time display in visit reports.

Run:

```bash
npm run tracking:summary -- --days=7
npm run tracking:recent -- --limit=50
npm run tracking:candidates -- --days=14 --limit=25
npm run tracking:visits -- --days=14 --limit=50
npm run tracking:daily -- --days=30
npm run tracking:report -- --days=14 --limit=15
npm run tracking:export -- --since=2026-07-01T00:00:00.000Z --until=2026-07-25T23:59:59.000Z --limit=250
```

`tracking:summary`, `tracking:daily`, and `tracking:visits` now use a parser-style terminal layout for easier reading.

If you need raw JSON output for automation, add `--json=true` to `tracking:summary` or `tracking:daily`.

`tracking:report` prints a concise recruiter-signal table (score, human confidence, org/geo, engagement, and repeat visits) for fast terminal review.

These commands call private admin endpoints and require both token and access code.

### Fast Deployment Path (Windows)

Run this once to generate secure token and access code values:

```bash
npm run tracking:bootstrap
```

Then deploy backend in order:

```bash
npm run tracking:worker:login
npm run tracking:worker:d1:create
```

Update [tracking-worker/wrangler.toml](tracking-worker/wrangler.toml) with your real `database_id` and portfolio origin, then continue:

```bash
npm run tracking:worker:d1:migrate
npm run tracking:worker:secret:token
npm run tracking:worker:secret:code
npm run tracking:worker:deploy
```

Important:

- Set `ALLOWED_ORIGIN` in [tracking-worker/wrangler.toml](tracking-worker/wrangler.toml) to your exact live portfolio origin (for example, `https://yourdomain.com`).
- If `ALLOWED_ORIGIN` stays as the placeholder value, frontend event collection will be blocked by origin checks.
- Right after workers.dev subdomain registration, SSL/DNS propagation can briefly delay successful HTTPS checks.

After deploy, set Vercel variables:

- `VITE_TRACKING_ENDPOINT`
- `VITE_TRACKING_SITE_KEY`

Then verify private data access from terminal:

```bash
npm run tracking:summary -- --days=7
npm run tracking:candidates -- --days=14 --limit=25
```

## Closing Note

This was built to feel like a crafted system, not a pre-packaged theme.

It combines technical rigor (geometry, snapping, consistency) with personality (blueprint aesthetic, motion, annotations), which is exactly what this portfolio is meant to communicate.
