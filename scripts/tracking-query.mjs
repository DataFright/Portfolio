#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

function loadTrackingEnvFile() {
  const filePath = path.join(ROOT_DIR, 'tracking.env')
  if (!existsSync(filePath)) return

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equalAt = trimmed.indexOf('=')
    if (equalAt <= 0) continue

    const key = trimmed.slice(0, equalAt).trim()
    const rawValue = trimmed.slice(equalAt + 1).trim()
    if (!key) continue
    if (process.env[key]) continue

    process.env[key] = rawValue.replace(/^['\"]|['\"]$/g, '')
  }
}

loadTrackingEnvFile()

const BASE_URL = process.env.TRACKING_ADMIN_URL
const TOKEN = process.env.TRACKING_ADMIN_TOKEN
const CODE = process.env.TRACKING_ADMIN_CODE
const OWNER_TIMEZONE = process.env.TRACKING_OWNER_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

function usage() {
  console.log(`Usage:
  node scripts/tracking-query.mjs summary [--days=7]
  node scripts/tracking-query.mjs recent [--limit=50]
  node scripts/tracking-query.mjs candidates [--days=14] [--limit=25]
  node scripts/tracking-query.mjs visits [--days=14] [--limit=50]
  node scripts/tracking-query.mjs daily [--days=30]
  node scripts/tracking-query.mjs report [--days=14] [--limit=15]
  node scripts/tracking-query.mjs export [--since=2026-07-01T00:00:00.000Z] [--until=2026-07-25T23:59:59.000Z] [--limit=250]

Required env vars:
  TRACKING_ADMIN_URL=https://your-worker-domain.workers.dev
  TRACKING_ADMIN_TOKEN=...
  TRACKING_ADMIN_CODE=...
Optional env vars:
  TRACKING_OWNER_TIMEZONE=America/Chicago

If those are not exported, this script also reads ./tracking.env automatically.
`)
}

function parseArgs(argv) {
  const [command, ...rest] = argv
  const options = {}
  for (const item of rest) {
    if (!item.startsWith('--')) continue
    const [k, v] = item.slice(2).split('=')
    options[k] = v
  }
  return { command, options }
}

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'X-Access-Code': CODE,
    },
  })

  const text = await response.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = { raw: text }
  }

  if (!response.ok) {
    console.error(JSON.stringify(parsed, null, 2))
    process.exit(1)
  }

  return parsed
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2))
}

function shortDate(ts) {
  if (!ts) return '-'
  const d = new Date(Number(ts))
  if (!Number.isFinite(d.getTime())) return '-'
  return d.toISOString().replace('T', ' ').slice(0, 16)
}

function formatInTimezone(ts, timezone) {
  if (!ts) return '-'
  const d = new Date(Number(ts))
  if (!Number.isFinite(d.getTime())) return '-'

  const tz = timezone || 'UTC'
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    return fmt.format(d).replace(',', '')
  } catch {
    return shortDate(ts)
  }
}

function toNumber(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function pad(value, width) {
  const text = String(value)
  if (text.length >= width) return text.slice(0, width)
  return text + ' '.repeat(width - text.length)
}

function printRecruiterReport(data, days, limit) {
  const rows = Array.isArray(data?.candidates) ? data.candidates : []
  console.log(`Recruiter Signal Report (${days}d, top ${limit})`)
  console.log(`Generated: ${data?.generatedAt || '-'}\n`)

  if (!rows.length) {
    console.log('No candidate-like sessions found in the selected window.')
    return
  }

  const header = [
    pad('score', 6),
    pad('human', 6),
    pad('band', 24),
    pad('org', 28),
    pad('geo', 18),
    pad('engaged_s', 10),
    pad('scroll', 8),
    pad('repeat', 7),
    pad('last_seen_utc', 16),
  ].join(' | ')

  console.log(header)
  console.log('-'.repeat(header.length))

  rows.forEach(row => {
    const geo = [row.country, row.region, row.city].filter(Boolean).join('/') || '-'
    const engagedSec = Math.round(toNumber(row.total_engaged_ms, 0) / 1000)
    const line = [
      pad(toNumber(row.interest_score, 0), 6),
      pad(Math.round(toNumber(row.human_confidence, 0)), 6),
      pad(row.interest_band || '-', 24),
      pad((row.as_org || '-').replace(/\s+/g, ' '), 28),
      pad(geo, 18),
      pad(engagedSec, 10),
      pad(toNumber(row.max_scroll, 0), 8),
      pad(toNumber(row.repeat_visits, 1), 7),
      pad(shortDate(row.last_seen), 16),
    ].join(' | ')
    console.log(line)
  })
}

function printSummaryReport(data, days) {
  const totals = data?.totals || {}
  const bots = Array.isArray(data?.botBreakdown) ? data.botBreakdown : []
  const networks = Array.isArray(data?.topNetworks) ? data.topNetworks : []
  const candidates = Array.isArray(data?.candidateSignals) ? data.candidateSignals : []

  console.log(`Tracking Summary (${days}d)`)
  console.log(`Generated: ${data?.generatedAt || '-'}\n`)

  console.log(`Events: ${toNumber(totals.event_count, 0)}`)
  console.log(`Sessions: ${toNumber(totals.session_count, 0)}`)
  console.log(`Visitors: ${toNumber(totals.visitor_count, 0)}`)
  console.log(`Average bot score: ${toNumber(totals.avg_bot_score, 0)}\n`)

  if (bots.length) {
    console.log('Bot Breakdown:')
    bots.forEach(row => {
      console.log(`- ${row.bot_class}: ${toNumber(row.hits, 0)}`)
    })
    console.log('')
  }

  if (networks.length) {
    console.log('Top Networks:')
    networks.forEach(row => {
      console.log(`- ${row.as_org || '-'} (ASN ${toNumber(row.asn, 0)}): ${toNumber(row.hits, 0)} hits`)
    })
    console.log('')
  }

  if (candidates.length) {
    console.log('Top Candidate Signals:')
    candidates.slice(0, 5).forEach(row => {
      console.log(`- score ${toNumber(row.interest_score, 0)} | ${row.interest_band || '-'} | ${row.as_org || '-'} | ${row.country || '-'} ${row.region || '-'} | last ${shortDate(row.last_seen)} UTC`)
    })
  } else {
    console.log('Top Candidate Signals: none yet')
  }
}

function printDailyReport(data, days) {
  const rows = Array.isArray(data?.results) ? data.results : []
  console.log(`Daily Rollups (${days}d)`)
  console.log(`Generated: ${data?.generatedAt || '-'}\n`)

  if (!rows.length) {
    console.log('No daily rollups found in the selected window.')
    return
  }

  const header = [
    pad('day', 10),
    pad('events', 8),
    pad('visitors', 8),
    pad('sessions', 8),
    pad('human', 8),
    pad('bot', 8),
    pad('uncertain', 10),
    pad('avg_bot', 8),
  ].join(' | ')

  console.log(header)
  console.log('-'.repeat(header.length))

  rows.forEach(row => {
    console.log([
      pad(row.day_key || '-', 10),
      pad(toNumber(row.event_count, 0), 8),
      pad(toNumber(row.visitor_count, 0), 8),
      pad(toNumber(row.session_count, 0), 8),
      pad(toNumber(row.likely_human_events, 0), 8),
      pad(toNumber(row.likely_bot_events, 0), 8),
      pad(toNumber(row.uncertain_events, 0), 10),
      pad(toNumber(row.avg_bot_score, 0), 8),
    ].join(' | '))
  })
}

function printVisitIntelReport(data, days, limit) {
  const rows = Array.isArray(data?.results) ? data.results : []
  console.log(`Visit Intel Report (${days}d, top ${limit} sessions)`) 
  console.log(`Generated: ${data?.generatedAt || '-'}\n`)
  console.log(`Owner timezone for local view: ${OWNER_TIMEZONE}\n`)

  if (!rows.length) {
    console.log('No visits found in the selected window.')
    return
  }

  const header = [
    pad('when_utc', 16),
    pad('visitor_local_time', 19),
    pad('owner_local_time', 19),
    pad('person_bot', 11),
    pad('visitor_key', 24),
    pad('affiliation', 28),
    pad('network', 16),
    pad('vpn?', 5),
    pad('device', 12),
    pad('location', 20),
  ].join(' | ')

  console.log(header)
  console.log('-'.repeat(header.length))

  rows.forEach(row => {
    const location = [row.country, row.region, row.city].filter(Boolean).join('/') || '-'
    const visitorTime = formatInTimezone(row.ts, row.timezone)
    const ownerTime = formatInTimezone(row.ts, OWNER_TIMEZONE)
    const line = [
      pad(shortDate(row.ts), 16),
      pad(visitorTime, 19),
      pad(ownerTime, 19),
      pad(row.bot_class || '-', 11),
      pad(row.visitor_key || row.visitor_id || '-', 24),
      pad((row.as_org || '-').replace(/\s+/g, ' '), 28),
      pad(row.network_type || '-', 16),
      pad(row.vpn_suspected ? 'yes' : 'no', 5),
      pad(row.device_type || '-', 12),
      pad(location, 20),
    ].join(' | ')
    console.log(line)
    if (Array.isArray(row.bot_reasons) && row.bot_reasons.length) {
      console.log(`  bot_reasons: ${row.bot_reasons.join(', ')}`)
    }
  })
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2))

  if (!BASE_URL || !TOKEN || !CODE) {
    usage()
    process.exit(1)
  }

  if (!command || command === 'help') {
    usage()
    process.exit(0)
  }

  if (command === 'summary') {
    const days = options.days || '7'
    const data = await request(`/admin/summary?days=${encodeURIComponent(days)}`)
    if (options.json === '1' || options.json === 'true') {
      printJson(data)
    } else {
      printSummaryReport(data, days)
    }
    return
  }

  if (command === 'recent') {
    const limit = options.limit || '50'
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const until = new Date().toISOString()
    const data = await request(`/admin/export?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}&limit=${encodeURIComponent(limit)}`)
    printJson(data)
    return
  }

  if (command === 'export') {
    const since = options.since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const until = options.until || new Date().toISOString()
    const limit = options.limit || '250'
    const data = await request(`/admin/export?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}&limit=${encodeURIComponent(limit)}`)
    printJson(data)
    return
  }

  if (command === 'candidates') {
    const days = options.days || '14'
    const limit = options.limit || '25'
    const data = await request(`/admin/candidates?days=${encodeURIComponent(days)}&limit=${encodeURIComponent(limit)}`)
    printJson(data)
    return
  }

  if (command === 'visits') {
    const days = options.days || '14'
    const limit = options.limit || '50'
    const data = await request(`/admin/visits?days=${encodeURIComponent(days)}&limit=${encodeURIComponent(limit)}`)
    printVisitIntelReport(data, days, limit)
    return
  }

  if (command === 'daily') {
    const days = options.days || '30'
    const data = await request(`/admin/daily?days=${encodeURIComponent(days)}`)
    if (options.json === '1' || options.json === 'true') {
      printJson(data)
    } else {
      printDailyReport(data, days)
    }
    return
  }

  if (command === 'report') {
    const days = options.days || '14'
    const limit = options.limit || '15'
    const data = await request(`/admin/candidates?days=${encodeURIComponent(days)}&limit=${encodeURIComponent(limit)}`)
    printRecruiterReport(data, days, limit)
    return
  }

  usage()
  process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
