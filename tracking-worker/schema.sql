CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  site_key TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  asn INTEGER,
  as_org TEXT,
  ua TEXT,
  bot_score INTEGER NOT NULL,
  bot_class TEXT NOT NULL,
  referrer TEXT,
  path TEXT,
  page_url TEXT,
  scroll_max INTEGER DEFAULT 0,
  engaged_ms INTEGER DEFAULT 0,
  viewport_w INTEGER DEFAULT 0,
  viewport_h INTEGER DEFAULT 0,
  screen_w INTEGER DEFAULT 0,
  screen_h INTEGER DEFAULT 0,
  payload_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_bot_score ON events(bot_score);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_as_org ON events(as_org);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  asn INTEGER,
  as_org TEXT,
  ua TEXT,
  events_count INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  max_scroll INTEGER NOT NULL DEFAULT 0,
  total_engaged_ms INTEGER NOT NULL DEFAULT 0,
  bot_score_avg INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen);
CREATE INDEX IF NOT EXISTS idx_sessions_bot_score_avg ON sessions(bot_score_avg);
CREATE INDEX IF NOT EXISTS idx_sessions_as_org ON sessions(as_org);

CREATE TABLE IF NOT EXISTS ingest_rate_limit (
  bucket_ts INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (bucket_ts, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_ingest_rate_limit_updated_at ON ingest_rate_limit(updated_at);

CREATE TABLE IF NOT EXISTS daily_rollups (
  day_key TEXT PRIMARY KEY,
  event_count INTEGER NOT NULL DEFAULT 0,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  session_count INTEGER NOT NULL DEFAULT 0,
  likely_human_events INTEGER NOT NULL DEFAULT 0,
  likely_bot_events INTEGER NOT NULL DEFAULT 0,
  uncertain_events INTEGER NOT NULL DEFAULT 0,
  avg_bot_score REAL NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_rollups_updated_at ON daily_rollups(updated_at);
