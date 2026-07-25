const TRACKING_ENDPOINT = (import.meta.env.VITE_TRACKING_ENDPOINT || '').trim()
const SITE_KEY = (import.meta.env.VITE_TRACKING_SITE_KEY || 'portfolio').trim()

let pageViewSent = false

function nowMs() {
  return Date.now()
}

function getOrCreateVisitorId() {
  const key = 'portfolio_visitor_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing

  const created = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${nowMs()}-${Math.random().toString(36).slice(2)}`

  localStorage.setItem(key, created)
  return created
}

function getOrCreateSessionId() {
  const key = 'portfolio_session_id'
  const existing = sessionStorage.getItem(key)
  if (existing) return existing

  const created = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${nowMs()}-${Math.random().toString(36).slice(2)}`

  sessionStorage.setItem(key, created)
  return created
}

function buildBaseEvent() {
  return {
    siteKey: SITE_KEY,
    visitorId: getOrCreateVisitorId(),
    sessionId: getOrCreateSessionId(),
    pageUrl: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    language: navigator.language || null,
    screen: {
      width: window.screen?.width || null,
      height: window.screen?.height || null,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    doNotTrack: navigator.doNotTrack || null,
    touchPoints: navigator.maxTouchPoints || 0,
  }
}

function postEvent(type, payload = {}, useBeacon = false) {
  if (!TRACKING_ENDPOINT) return

  const body = JSON.stringify({
    type,
    timestamp: nowMs(),
    ...buildBaseEvent(),
    ...payload,
  })

  const url = `${TRACKING_ENDPOINT.replace(/\/$/, '')}/collect`

  if (useBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon(url, blob)
    return
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Tracking must never interfere with UX.
  })
}

export function trackPageView() {
  if (pageViewSent) return
  pageViewSent = true
  postEvent('page_view')
}

export function startEngagementTracking() {
  if (!TRACKING_ENDPOINT) return () => {}

  const thresholds = [25, 50, 75, 90]
  const seen = new Set()
  const startedAt = nowMs()
  let maxScroll = 0

  const pctScrolled = () => {
    const doc = document.documentElement
    const max = Math.max(1, doc.scrollHeight - window.innerHeight)
    const current = Math.max(0, window.scrollY)
    return Math.min(100, Math.round((current / max) * 100))
  }

  const onScroll = () => {
    maxScroll = Math.max(maxScroll, pctScrolled())
    thresholds.forEach(t => {
      if (maxScroll >= t && !seen.has(t)) {
        seen.add(t)
        postEvent('scroll_depth', { scrollDepth: t })
      }
    })
  }

  const sendHeartbeat = (type, useBeacon = false) => {
    postEvent(type, {
      engagedMs: Math.max(0, nowMs() - startedAt),
      scrollMax: maxScroll,
    }, useBeacon)
  }

  const heartbeat = window.setInterval(() => sendHeartbeat('engagement'), 30000)

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      sendHeartbeat('visibility_hidden', true)
    }
  }

  const onPageHide = () => sendHeartbeat('session_end', true)

  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', onPageHide)

  onScroll()

  return () => {
    clearInterval(heartbeat)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', onPageHide)
    sendHeartbeat('tracking_cleanup', true)
  }
}
