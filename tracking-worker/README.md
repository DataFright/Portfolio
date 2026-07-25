# Portfolio Tracker Worker

Private visitor intelligence backend for your portfolio.

This service is separate from your site UI. The frontend sends background events to this Worker, and you access raw/summary data through token-protected admin endpoints from terminal.

## What it captures

- Masked IP hash (not full IP storage)
- Country, region, city (Cloudflare edge metadata)
- ASN and network organization when available
- User-Agent and bot/human score
- Session engagement signals (scroll depth, engaged time)

## Security and abuse controls

- Strict allowed event types only (`page_view`, `scroll_depth`, `engagement`, `visibility_hidden`, `session_end`, `tracking_cleanup`)
- Request payload size limit
- Event timestamp freshness checks (rejects stale/future-skewed events)
- Per-IP-hash per-minute ingestion rate limit via D1 counters
- Token + access-code protection for admin endpoints

## Endpoints

- `POST /collect` - event ingestion from portfolio frontend
- `GET /admin/summary?days=7` - private summary
- `GET /admin/candidates?days=14&limit=25` - ranked likely-human candidate signals
- `GET /admin/daily?days=30` - daily aggregate rollups
- `POST /admin/rollup?day=YYYY-MM-DD` - force-refresh one day rollup
- `GET /admin/export?since=...&until=...&limit=250` - private raw export
- `GET /health` - health check

## Required secrets

Set in Cloudflare Worker secrets:

- `ADMIN_TOKEN`
- `ADMIN_CODE`

Command examples:

```bash
wrangler secret put ADMIN_TOKEN
wrangler secret put ADMIN_CODE
```

## Setup

1. Create D1 database:

```bash
wrangler d1 create portfolio_tracker
```

2. Copy returned `database_id` into `wrangler.toml`.
3. Apply schema:

```bash
wrangler d1 execute portfolio_tracker --file=./schema.sql
```

4. Set allowed origin in `wrangler.toml`:

- `ALLOWED_ORIGIN = "https://your-portfolio-domain.com"`

Optional hardening knobs in `wrangler.toml`:

- `RATE_LIMIT_PER_MIN` (default `90`)
- `MAX_EVENT_AGE_MS` (default `900000` / 15 minutes)
- `MAX_FUTURE_SKEW_MS` (default `120000` / 2 minutes)

Daily rollups are refreshed automatically by cron trigger in `wrangler.toml`.

5. Deploy:

```bash
wrangler deploy
```

## Admin access example

```bash
curl -s "https://your-worker-domain.workers.dev/admin/summary?days=7" \
  -H "Authorization: Bearer $TRACKING_ADMIN_TOKEN" \
  -H "X-Access-Code: $TRACKING_ADMIN_CODE"

curl -s "https://your-worker-domain.workers.dev/admin/candidates?days=14&limit=25" \
  -H "Authorization: Bearer $TRACKING_ADMIN_TOKEN" \
  -H "X-Access-Code: $TRACKING_ADMIN_CODE"
```
