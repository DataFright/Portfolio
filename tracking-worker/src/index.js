const BOT_UA_PATTERN = /(bot|spider|crawler|slurp|wget|curl|headless|python-requests|go-http-client|ahrefs|semrush|bytespider|dataprovider)/i
const KNOWN_HIRING_NETWORK_PATTERN = /(amazon|microsoft|google|meta|apple|netflix|cloudflare|github|linkedin|indeed|glassdoor|salesforce|oracle|walmart|accenture|deloitte|ibm)/i
const DATACENTER_NETWORK_PATTERN = /(amazon|aws|google cloud|microsoft|azure|digitalocean|linode|ovh|oracle cloud|cloudflare|vultr|choopa|alibaba cloud|hetzner)/i
const RESIDENTIAL_NETWORK_PATTERN = /(communications|telecom|broadband|cable|fiber|wireless|mobile|xfinity|spectrum|charter|cox|comcast|verizon|at&t|centurylink|isp)/i
const VPN_HINT_PATTERN = /(vpn|proxy|anonym|hosting|datacenter|cloud|server)/i
const ALLOWED_EVENT_TYPES = new Set([
  'page_view',
  'scroll_depth',
  'engagement',
  'visibility_hidden',
  'session_end',
  'tracking_cleanup',
])
const MAX_BODY_BYTES = 8 * 1024

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  })
}

function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.origin
  } catch {
    return null
  }
}

function getAllowedOrigins(env) {
  const values = []
  if (typeof env.ALLOWED_ORIGINS === 'string' && env.ALLOWED_ORIGINS.trim()) {
    values.push(...env.ALLOWED_ORIGINS.split(','))
  }
  if (typeof env.ALLOWED_ORIGIN === 'string' && env.ALLOWED_ORIGIN.trim()) {
    values.push(env.ALLOWED_ORIGIN)
  }

  return Array.from(new Set(values.map(normalizeOrigin).filter(Boolean)))
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!allowedOrigins.length) return true
  const normalized = normalizeOrigin(origin)
  if (!normalized) return false
  return allowedOrigins.includes(normalized)
}

function getCorsHeaders(origin, allowedOrigins) {
  const allowAll = !allowedOrigins.length
  const allowed = isOriginAllowed(origin, allowedOrigins)
  const allowOrigin = allowAll ? '*' : (allowed ? normalizeOrigin(origin) : 'null')

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Access-Code',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function toInt(v, fallback = 0) {
  const parsed = Number.parseInt(String(v), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toFloat(v, fallback = 0) {
  const parsed = Number.parseFloat(String(v))
  return Number.isFinite(parsed) ? parsed : fallback
}

function cleanString(value, maxLen = 240) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLen)
}

function cleanId(value) {
  const str = cleanString(value, 80)
  if (!str) return null
  return /^[A-Za-z0-9._:-]+$/.test(str) ? str : null
}

function getEventMaxAgeMs(env) {
  return Math.max(60_000, Math.min(86_400_000, toInt(env.MAX_EVENT_AGE_MS, 900_000)))
}

function getFutureSkewMs(env) {
  return Math.max(1_000, Math.min(300_000, toInt(env.MAX_FUTURE_SKEW_MS, 120_000)))
}

function getRateLimitPerMinute(env) {
  return Math.max(20, Math.min(2000, toInt(env.RATE_LIMIT_PER_MIN, 90)))
}

function deviceTypeFromUa(ua, touchPoints) {
  const text = (ua || '').toLowerCase()
  if (/ipad|tablet/.test(text)) return 'tablet'
  if (/iphone|android|mobile/.test(text)) return 'mobile'
  if (toInt(touchPoints, 0) > 0 && /macintosh/.test(text)) return 'touch_desktop'
  return 'desktop'
}

function classifyNetwork(asOrg) {
  const org = String(asOrg || '').toLowerCase()
  if (!org) {
    return { networkType: 'unknown', vpnSuspected: 0 }
  }
  if (DATACENTER_NETWORK_PATTERN.test(org)) {
    return { networkType: 'datacenter', vpnSuspected: 1 }
  }
  if (RESIDENTIAL_NETWORK_PATTERN.test(org)) {
    return { networkType: 'residential', vpnSuspected: 0 }
  }
  if (VPN_HINT_PATTERN.test(org)) {
    return { networkType: 'proxy_or_vpn', vpnSuspected: 1 }
  }
  return { networkType: 'corporate_or_unknown', vpnSuspected: 0 }
}

async function buildVisitorKey(payload, ua, ipHash) {
  const base = [
    ipHash,
    cleanString(ua, 300) || '',
    cleanString(payload?.timezone, 120) || '',
    toInt(payload?.screen?.width, 0),
    toInt(payload?.screen?.height, 0),
    cleanString(payload?.language, 40) || '',
  ].join('|')
  return (await sha256Hex(base)).slice(0, 24)
}

function botAnalysisFromRequest(ua, payload) {
  let score = 0
  const reasons = []
  const uaText = (ua || '').toLowerCase()

  if (!ua) {
    score += 25
    reasons.push('no_user_agent')
  }
  if (BOT_UA_PATTERN.test(uaText)) {
    score += 70
    reasons.push('bot_pattern_in_ua')
  }
  if (uaText.includes('headlesschrome')) {
    score += 30
    reasons.push('headless_chrome')
  }
  if (uaText.includes('phantomjs')) {
    score += 30
    reasons.push('phantomjs_runtime')
  }
  if (uaText.includes('playwright')) {
    score += 40
    reasons.push('playwright_runtime')
  }

  if ((payload.touchPoints || 0) === 0 && /mobile|android|iphone|ipad/i.test(ua || '')) {
    score += 15
    reasons.push('mobile_ua_without_touch')
  }

  if (!payload.language) {
    score += 6
    reasons.push('missing_language')
  }
  if (!payload.timezone) {
    score += 10
    reasons.push('missing_timezone')
  }

  const eventType = String(payload.type || '').trim()
  if (eventType === 'session_end' && toInt(payload.engagedMs, 0) < 1200) {
    score += 8
    reasons.push('very_short_session')
  }

  const engagedMs = toInt(payload.engagedMs, 0)
  const scrollMax = toInt(payload.scrollMax, 0)

  if (engagedMs > 45000) {
    score -= 15
    reasons.push('long_engagement_human_signal')
  }
  if (scrollMax >= 50) {
    score -= 10
    reasons.push('deep_scroll_human_signal')
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
  }
}

function classifyVisitor(score) {
  if (score >= 70) return 'likely_bot'
  if (score >= 40) return 'uncertain'
  return 'likely_human'
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function recruiterInterestScore(session, repeatVisits) {
  let score = 0

  const botAvg = toFloat(session.bot_score_avg, 100)
  const engagedMs = toInt(session.total_engaged_ms, 0)
  const scroll = toInt(session.max_scroll, 0)
  const pageViews = toInt(session.page_views, 0)
  const eventsCount = toInt(session.events_count, 0)
  const org = String(session.as_org || '')

  if (botAvg < 35) score += 25
  else if (botAvg < 50) score += 10

  if (engagedMs >= 180000) score += 30
  else if (engagedMs >= 90000) score += 22
  else if (engagedMs >= 45000) score += 14

  if (scroll >= 90) score += 18
  else if (scroll >= 75) score += 12
  else if (scroll >= 50) score += 6

  if (pageViews >= 3) score += 12
  else if (pageViews >= 2) score += 7

  if (eventsCount >= 6) score += 8

  if (repeatVisits >= 3) score += 18
  else if (repeatVisits >= 2) score += 10

  if (KNOWN_HIRING_NETWORK_PATTERN.test(org)) score += 12

  return clamp(score, 0, 100)
}

function recruiterBand(score) {
  if (score >= 75) return 'strong_candidate_signal'
  if (score >= 55) return 'moderate_candidate_signal'
  return 'weak_candidate_signal'
}

function requireAdminAuth(request, env) {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const code = request.headers.get('X-Access-Code') || ''

  if (!env.ADMIN_TOKEN || !env.ADMIN_CODE) {
    return 'Server secrets are not configured'
  }

  if (token !== env.ADMIN_TOKEN || code !== env.ADMIN_CODE) {
    return 'Unauthorized'
  }

  return null
}

async function consumeIngestBudget(env, ipHash, nowTs) {
  const bucket = Math.floor(nowTs / 60_000)

  await env.DB.prepare(`
    INSERT INTO ingest_rate_limit (bucket_ts, ip_hash, hits, updated_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(bucket_ts, ip_hash)
    DO UPDATE SET
      hits = ingest_rate_limit.hits + 1,
      updated_at = excluded.updated_at
  `).bind(bucket, ipHash, nowTs).run()

  const row = await env.DB.prepare(`
    SELECT hits
    FROM ingest_rate_limit
    WHERE bucket_ts = ? AND ip_hash = ?
  `).bind(bucket, ipHash).first()

  // Opportunistic cleanup for old buckets (~24h retention for limiter state)
  await env.DB.prepare(`
    DELETE FROM ingest_rate_limit
    WHERE bucket_ts < ?
  `).bind(bucket - 1440).run()

  const hits = toInt(row?.hits, 0)
  return {
    hits,
    limit: getRateLimitPerMinute(env),
  }
}

async function insertEvent(env, event) {
  const stmt = env.DB.prepare(`
    INSERT INTO events (
      id, ts, event_type, site_key, visitor_id, session_id, ip_hash,
      country, region, city, timezone, asn, as_org,
      ua, bot_score, bot_class, referrer, path, page_url,
      scroll_max, engaged_ms, viewport_w, viewport_h, screen_w, screen_h,
      payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  await stmt.bind(
    event.id,
    event.ts,
    event.eventType,
    event.siteKey,
    event.visitorId,
    event.sessionId,
    event.ipHash,
    event.country,
    event.region,
    event.city,
    event.timezone,
    event.asn,
    event.asOrg,
    event.ua,
    event.botScore,
    event.botClass,
    event.referrer,
    event.path,
    event.pageUrl,
    event.scrollMax,
    event.engagedMs,
    event.viewportW,
    event.viewportH,
    event.screenW,
    event.screenH,
    JSON.stringify(event.payload)
  ).run()

  await env.DB.prepare(`
    INSERT INTO event_enrichment (
      event_id, visit_iso, visitor_key, device_type,
      network_type, vpn_suspected, bot_reasons
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.id,
    event.visitIso,
    event.visitorKey,
    event.deviceType,
    event.networkType,
    event.vpnSuspected,
    JSON.stringify(event.botReasons || [])
  ).run()

  const upsertSession = env.DB.prepare(`
    INSERT INTO sessions (
      session_id, visitor_id, ip_hash, first_seen, last_seen,
      country, region, city, asn, as_org, ua,
      events_count, page_views, max_scroll, total_engaged_ms, bot_score_avg
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      last_seen = excluded.last_seen,
      events_count = sessions.events_count + 1,
      page_views = sessions.page_views + excluded.page_views,
      max_scroll = MAX(sessions.max_scroll, excluded.max_scroll),
      total_engaged_ms = MAX(sessions.total_engaged_ms, excluded.total_engaged_ms),
      bot_score_avg = ROUND((sessions.bot_score_avg + excluded.bot_score_avg) / 2)
  `)

  const pageViewInc = event.eventType === 'page_view' ? 1 : 0
  await upsertSession.bind(
    event.sessionId,
    event.visitorId,
    event.ipHash,
    event.ts,
    event.ts,
    event.country,
    event.region,
    event.city,
    event.asn,
    event.asOrg,
    event.ua,
    pageViewInc,
    event.scrollMax,
    event.engagedMs,
    event.botScore
  ).run()
}

function parseTimestamp(input, fallback) {
  const date = input ? new Date(input) : null
  const ms = date && Number.isFinite(date.getTime()) ? date.getTime() : fallback
  return Math.floor(ms)
}

function utcDayKeyFromTs(ts) {
  const d = new Date(ts)
  return d.toISOString().slice(0, 10)
}

function dayKeyRange(dayKey) {
  const start = Date.parse(`${dayKey}T00:00:00.000Z`)
  if (!Number.isFinite(start)) return null
  return { start, end: start + 24 * 60 * 60 * 1000 - 1 }
}

function normalizeDayKey(value, fallbackTs = Date.now()) {
  const raw = cleanString(value, 10)
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  return utcDayKeyFromTs(fallbackTs)
}

async function refreshDailyRollup(env, dayKey) {
  const range = dayKeyRange(dayKey)
  if (!range) return

  const row = await env.DB.prepare(`
    SELECT
      COUNT(*) AS event_count,
      COUNT(DISTINCT visitor_id) AS visitor_count,
      COUNT(DISTINCT session_id) AS session_count,
      SUM(CASE WHEN bot_class = 'likely_human' THEN 1 ELSE 0 END) AS likely_human_events,
      SUM(CASE WHEN bot_class = 'likely_bot' THEN 1 ELSE 0 END) AS likely_bot_events,
      SUM(CASE WHEN bot_class = 'uncertain' THEN 1 ELSE 0 END) AS uncertain_events,
      ROUND(AVG(bot_score), 1) AS avg_bot_score
    FROM events
    WHERE ts BETWEEN ? AND ?
  `).bind(range.start, range.end).first()

  await env.DB.prepare(`
    INSERT INTO daily_rollups (
      day_key, event_count, visitor_count, session_count,
      likely_human_events, likely_bot_events, uncertain_events,
      avg_bot_score, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(day_key) DO UPDATE SET
      event_count = excluded.event_count,
      visitor_count = excluded.visitor_count,
      session_count = excluded.session_count,
      likely_human_events = excluded.likely_human_events,
      likely_bot_events = excluded.likely_bot_events,
      uncertain_events = excluded.uncertain_events,
      avg_bot_score = excluded.avg_bot_score,
      updated_at = excluded.updated_at
  `).bind(
    dayKey,
    toInt(row?.event_count, 0),
    toInt(row?.visitor_count, 0),
    toInt(row?.session_count, 0),
    toInt(row?.likely_human_events, 0),
    toInt(row?.likely_bot_events, 0),
    toInt(row?.uncertain_events, 0),
    toFloat(row?.avg_bot_score, 0),
    Date.now()
  ).run()
}

async function refreshRecentRollups(env, dayCount = 2) {
  const now = Date.now()
  for (let i = 0; i < dayCount; i += 1) {
    const ts = now - i * 24 * 60 * 60 * 1000
    await refreshDailyRollup(env, utcDayKeyFromTs(ts))
  }
}

async function handleCollect(request, env) {
  const origin = request.headers.get('Origin')
  const allowedOrigins = getAllowedOrigins(env)
  const cors = getCorsHeaders(origin, allowedOrigins)

  if (allowedOrigins.length && !origin) {
    return json({ ok: false, error: 'Missing origin header' }, 403, cors)
  }

  if (!isOriginAllowed(origin, allowedOrigins)) {
    return json({ ok: false, error: 'Origin not allowed' }, 403, cors)
  }

  const contentLength = toInt(request.headers.get('content-length') || 0, 0)
  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Payload too large' }, 413, cors)
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON payload' }, 400, cors)
  }

  const eventType = cleanString(payload.type, 40)
  const visitorId = cleanId(payload.visitorId)
  const sessionId = cleanId(payload.sessionId)

  if (!eventType || !visitorId || !sessionId) {
    return json({ ok: false, error: 'Missing required fields: type, visitorId, sessionId' }, 400, cors)
  }

  if (!ALLOWED_EVENT_TYPES.has(eventType)) {
    return json({ ok: false, error: 'Invalid event type' }, 400, cors)
  }

  const nowTs = Date.now()
  const incomingTs = toInt(payload.timestamp, nowTs)
  const maxAgeMs = getEventMaxAgeMs(env)
  const maxFutureMs = getFutureSkewMs(env)
  if (incomingTs < nowTs - maxAgeMs || incomingTs > nowTs + maxFutureMs) {
    return json({ ok: false, error: 'Event timestamp outside allowed window' }, 400, cors)
  }

  const ua = request.headers.get('User-Agent') || ''
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0'
  const ipHash = (await sha256Hex(ip)).slice(0, 24)
  const budget = await consumeIngestBudget(env, ipHash, nowTs)
  if (budget.hits > budget.limit) {
    return json({ ok: false, error: 'Rate limit exceeded for ingestion' }, 429, {
      ...cors,
      'Retry-After': '60',
    })
  }

  const botAnalysis = botAnalysisFromRequest(ua, payload)
  const botScore = botAnalysis.score
  const botClass = classifyVisitor(botScore)
  const network = classifyNetwork(request.cf?.asOrganization)
  const visitorKey = await buildVisitorKey(payload, ua, ipHash)

  const event = {
    id: crypto.randomUUID(),
    ts: incomingTs,
    visitIso: new Date(incomingTs).toISOString(),
    eventType,
    siteKey: cleanString(payload.siteKey, 80) || 'portfolio',
    visitorId,
    sessionId,
    visitorKey,
    ipHash,
    country: request.cf?.country || null,
    region: request.cf?.regionCode || request.cf?.region || null,
    city: request.cf?.city || null,
    timezone: cleanString(payload.timezone, 120) || cleanString(request.cf?.timezone, 120),
    asn: toInt(request.cf?.asn, 0),
    asOrg: cleanString(request.cf?.asOrganization, 180),
    ua: cleanString(ua, 500),
    deviceType: deviceTypeFromUa(ua, payload.touchPoints),
    networkType: network.networkType,
    vpnSuspected: network.vpnSuspected,
    botReasons: botAnalysis.reasons,
    botScore,
    botClass,
    referrer: cleanString(payload.referrer, 500),
    path: cleanString(payload.path, 300),
    pageUrl: cleanString(payload.pageUrl, 500),
    scrollMax: toInt(payload.scrollMax || payload.scrollDepth, 0),
    engagedMs: toInt(payload.engagedMs, 0),
    viewportW: toInt(payload.viewport?.width, 0),
    viewportH: toInt(payload.viewport?.height, 0),
    screenW: toInt(payload.screen?.width, 0),
    screenH: toInt(payload.screen?.height, 0),
    payload,
  }

  await insertEvent(env, event)

  return json({ ok: true }, 202, cors)
}

async function handleSummary(request, env) {
  const authError = requireAdminAuth(request, env)
  if (authError) return json({ ok: false, error: authError }, 401)

  await refreshRecentRollups(env, 2)

  const { searchParams } = new URL(request.url)
  const days = Math.max(1, Math.min(90, toInt(searchParams.get('days'), 7)))
  const sinceTs = Date.now() - days * 24 * 60 * 60 * 1000

  const totals = await env.DB.prepare(`
    SELECT
      COUNT(*) AS event_count,
      COUNT(DISTINCT session_id) AS session_count,
      COUNT(DISTINCT visitor_id) AS visitor_count,
      ROUND(AVG(bot_score), 1) AS avg_bot_score
    FROM events
    WHERE ts >= ?
  `).bind(sinceTs).first()

  const topNetworks = await env.DB.prepare(`
    SELECT as_org, asn, COUNT(*) AS hits
    FROM events
    WHERE ts >= ? AND as_org IS NOT NULL AND as_org != ''
    GROUP BY as_org, asn
    ORDER BY hits DESC
    LIMIT 10
  `).bind(sinceTs).all()

  const botBreakdown = await env.DB.prepare(`
    SELECT bot_class, COUNT(*) AS hits
    FROM events
    WHERE ts >= ?
    GROUP BY bot_class
    ORDER BY hits DESC
  `).bind(sinceTs).all()

  const recentSessions = await env.DB.prepare(`
    SELECT
      session_id, visitor_id, country, region, city, as_org,
      page_views, events_count, max_scroll, total_engaged_ms, bot_score_avg,
      first_seen, last_seen
    FROM sessions
    WHERE last_seen >= ?
    ORDER BY last_seen DESC
    LIMIT 150
  `).bind(sinceTs).all()

  const repeatVisitorRows = await env.DB.prepare(`
    SELECT visitor_id, COUNT(*) AS sessions_seen
    FROM sessions
    WHERE last_seen >= ?
    GROUP BY visitor_id
  `).bind(sinceTs).all()

  const repeatMap = new Map((repeatVisitorRows.results || []).map(row => [row.visitor_id, toInt(row.sessions_seen, 1)]))

  const likelyHumans = await env.DB.prepare(`
    SELECT
      session_id, visitor_id, country, region, city, as_org,
      page_views, events_count, max_scroll, total_engaged_ms, bot_score_avg,
      first_seen, last_seen
    FROM sessions
    WHERE last_seen >= ?
      AND bot_score_avg < 45
      AND page_views >= 1
      AND (total_engaged_ms >= 45000 OR max_scroll >= 75)
    ORDER BY last_seen DESC
    LIMIT 50
  `).bind(sinceTs).all()

  const candidateSignals = (recentSessions.results || [])
    .map(session => {
      const repeatVisits = repeatMap.get(session.visitor_id) || 1
      const interestScore = recruiterInterestScore(session, repeatVisits)
      return {
        ...session,
        repeat_visits: repeatVisits,
        interest_score: interestScore,
        interest_band: recruiterBand(interestScore),
      }
    })
    .filter(session => toFloat(session.bot_score_avg, 100) < 50)
    .sort((a, b) => b.interest_score - a.interest_score)
    .slice(0, 50)

  return json({
    ok: true,
    windowDays: days,
    generatedAt: new Date().toISOString(),
    totals,
    botBreakdown: botBreakdown.results || [],
    topNetworks: topNetworks.results || [],
    likelyHumanHighInterestSessions: likelyHumans.results || [],
    candidateSignals,
  })
}

async function handleDaily(request, env) {
  const authError = requireAdminAuth(request, env)
  if (authError) return json({ ok: false, error: authError }, 401)

  const { searchParams } = new URL(request.url)
  const days = Math.max(1, Math.min(90, toInt(searchParams.get('days'), 30)))

  await refreshRecentRollups(env, 2)

  const rows = await env.DB.prepare(`
    SELECT
      day_key, event_count, visitor_count, session_count,
      likely_human_events, likely_bot_events, uncertain_events,
      avg_bot_score, updated_at
    FROM daily_rollups
    ORDER BY day_key DESC
    LIMIT ?
  `).bind(days).all()

  return json({
    ok: true,
    days,
    generatedAt: new Date().toISOString(),
    results: rows.results || [],
  })
}

async function handleRollup(request, env) {
  const authError = requireAdminAuth(request, env)
  if (authError) return json({ ok: false, error: authError }, 401)

  const { searchParams } = new URL(request.url)
  const dayKey = normalizeDayKey(searchParams.get('day'))
  await refreshDailyRollup(env, dayKey)

  return json({
    ok: true,
    dayKey,
    refreshedAt: new Date().toISOString(),
  })
}

async function handleCandidates(request, env) {
  const authError = requireAdminAuth(request, env)
  if (authError) return json({ ok: false, error: authError }, 401)

  const { searchParams } = new URL(request.url)
  const days = Math.max(1, Math.min(90, toInt(searchParams.get('days'), 14)))
  const limit = Math.max(1, Math.min(100, toInt(searchParams.get('limit'), 25)))
  const sinceTs = Date.now() - days * 24 * 60 * 60 * 1000

  const sessions = await env.DB.prepare(`
    SELECT
      session_id, visitor_id, country, region, city, as_org,
      page_views, events_count, max_scroll, total_engaged_ms, bot_score_avg,
      first_seen, last_seen
    FROM sessions
    WHERE last_seen >= ?
    ORDER BY last_seen DESC
    LIMIT 300
  `).bind(sinceTs).all()

  const repeatVisitorRows = await env.DB.prepare(`
    SELECT visitor_id, COUNT(*) AS sessions_seen
    FROM sessions
    WHERE last_seen >= ?
    GROUP BY visitor_id
  `).bind(sinceTs).all()

  const repeatMap = new Map((repeatVisitorRows.results || []).map(row => [row.visitor_id, toInt(row.sessions_seen, 1)]))

  const candidates = (sessions.results || [])
    .map(session => {
      const repeatVisits = repeatMap.get(session.visitor_id) || 1
      const interestScore = recruiterInterestScore(session, repeatVisits)
      return {
        ...session,
        repeat_visits: repeatVisits,
        interest_score: interestScore,
        interest_band: recruiterBand(interestScore),
        human_confidence: Math.max(0, 100 - toFloat(session.bot_score_avg, 100)),
      }
    })
    .filter(session => toFloat(session.bot_score_avg, 100) < 55)
    .sort((a, b) => b.interest_score - a.interest_score)
    .slice(0, limit)

  return json({
    ok: true,
    windowDays: days,
    limit,
    generatedAt: new Date().toISOString(),
    candidates,
  })
}

async function handleVisits(request, env) {
  const authError = requireAdminAuth(request, env)
  if (authError) return json({ ok: false, error: authError }, 401)

  const { searchParams } = new URL(request.url)
  const days = Math.max(1, Math.min(90, toInt(searchParams.get('days'), 14)))
  const limit = Math.max(1, Math.min(200, toInt(searchParams.get('limit'), 50)))
  const sinceTs = Date.now() - days * 24 * 60 * 60 * 1000

  const rows = await env.DB.prepare(`
    WITH filtered AS (
      SELECT
        e.id, e.ts, e.event_type, e.site_key, e.visitor_id, e.session_id, e.ip_hash,
        e.country, e.region, e.city, e.timezone, e.asn, e.as_org,
        e.ua, e.bot_score, e.bot_class, e.referrer, e.path, e.page_url,
        e.scroll_max, e.engaged_ms,
        x.visit_iso, x.visitor_key, x.device_type, x.network_type, x.vpn_suspected, x.bot_reasons
      FROM events e
      LEFT JOIN event_enrichment x ON x.event_id = e.id
      WHERE e.ts >= ?
    ),
    latest AS (
      SELECT session_id, MAX(ts) AS max_ts
      FROM filtered
      GROUP BY session_id
    )
    SELECT f.*
    FROM filtered f
    JOIN latest l
      ON l.session_id = f.session_id
     AND l.max_ts = f.ts
    ORDER BY f.ts DESC
    LIMIT ?
  `).bind(sinceTs, limit).all()

  const results = (rows.results || []).map(row => ({
    ...row,
    bot_reasons: row.bot_reasons ? JSON.parse(row.bot_reasons) : [],
  }))

  return json({
    ok: true,
    windowDays: days,
    limit,
    generatedAt: new Date().toISOString(),
    results,
  })
}

async function handleExport(request, env) {
  const authError = requireAdminAuth(request, env)
  if (authError) return json({ ok: false, error: authError }, 401)

  const { searchParams } = new URL(request.url)
  const limit = Math.max(1, Math.min(1000, toInt(searchParams.get('limit'), 250)))
  const since = parseTimestamp(searchParams.get('since'), Date.now() - 7 * 24 * 60 * 60 * 1000)
  const until = parseTimestamp(searchParams.get('until'), Date.now())

  const rows = await env.DB.prepare(`
    SELECT
      ts, event_type, site_key, visitor_id, session_id, ip_hash,
      country, region, city, timezone, asn, as_org,
      ua, bot_score, bot_class, referrer, path, page_url,
      scroll_max, engaged_ms, viewport_w, viewport_h, screen_w, screen_h,
      x.visit_iso, x.visitor_key, x.device_type, x.network_type, x.vpn_suspected, x.bot_reasons,
      payload_json
    FROM events
    LEFT JOIN event_enrichment x ON x.event_id = events.id
    WHERE ts BETWEEN ? AND ?
    ORDER BY ts DESC
    LIMIT ?
  `).bind(since, until, limit).all()

  const results = (rows.results || []).map(row => ({
    ...row,
    bot_reasons: row.bot_reasons ? JSON.parse(row.bot_reasons) : [],
  }))

  return json({
    ok: true,
    since,
    until,
    limit,
    count: results.length,
    results,
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const method = request.method.toUpperCase()
    const origin = request.headers.get('Origin')
    const cors = getCorsHeaders(origin, getAllowedOrigins(env))

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (method === 'POST' && url.pathname === '/collect') {
      return handleCollect(request, env)
    }

    if (method === 'GET' && url.pathname === '/admin/summary') {
      return handleSummary(request, env)
    }

    if (method === 'GET' && url.pathname === '/admin/export') {
      return handleExport(request, env)
    }

    if (method === 'GET' && url.pathname === '/admin/daily') {
      return handleDaily(request, env)
    }

    if (method === 'POST' && url.pathname === '/admin/rollup') {
      return handleRollup(request, env)
    }

    if (method === 'GET' && url.pathname === '/admin/candidates') {
      return handleCandidates(request, env)
    }

    if (method === 'GET' && url.pathname === '/admin/visits') {
      return handleVisits(request, env)
    }

    if (method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'portfolio-tracker-worker' })
    }

    return json({ ok: false, error: 'Not found' }, 404, cors)
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(refreshRecentRollups(env, 2))
  },
}
