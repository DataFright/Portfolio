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

function usage() {
  console.log(`Usage:
  node scripts/tracking-query.mjs summary [--days=7]
  node scripts/tracking-query.mjs recent [--limit=50]
  node scripts/tracking-query.mjs candidates [--days=14] [--limit=25]
  node scripts/tracking-query.mjs daily [--days=30]
  node scripts/tracking-query.mjs report [--days=14] [--limit=15]
  node scripts/tracking-query.mjs export [--since=2026-07-01T00:00:00.000Z] [--until=2026-07-25T23:59:59.000Z] [--limit=250]

Required env vars:
  TRACKING_ADMIN_URL=https://your-worker-domain.workers.dev
  TRACKING_ADMIN_TOKEN=...
  TRACKING_ADMIN_CODE=...

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
    printJson(data)
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

  if (command === 'daily') {
    const days = options.days || '30'
    const data = await request(`/admin/daily?days=${encodeURIComponent(days)}`)
    printJson(data)
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
