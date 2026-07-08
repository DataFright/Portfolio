/**
 * Blueprint Grid Alignment Tests
 *
 * Verifies that every major layout element's left edge, width, and right edge
 * are exact multiples of the 24px cell size.
 *
 * Run via browser console (paste the IIFE), or via:
 *   node tests/run-alignment.js
 *
 * Pass: |actual - nearest_24px_multiple| <= 0.5px (sub-pixel rounding tolerance)
 */

;(function blueprintAlignmentTests() {
  const CELL = 24
  const TOL  = 0.5   // sub-pixel rounding tolerance in px

  const root          = document.documentElement
  const pageMarginL   = parseFloat(root.style.getPropertyValue('--page-margin-left') || '0')
  const layoutColumns = parseInt(root.style.getPropertyValue('--layout-columns')    || '56')
  const dataBp        = root.dataset.bp || '(not set)'

  const results = []

  // ─── Core math ─────────────────────────────────────────────────────────────
  function snapNearest(v) { return Math.round(v / CELL) * CELL }

  function check(name, value) {
    const nearest = snapNearest(value)
    const delta   = Math.abs(value - nearest)
    const pass    = delta <= TOL
    results.push({ name, value: +value.toFixed(2), nearest, delta: +delta.toFixed(2), pass })
    return pass
  }

  function measureEl(label, query) {
    const node = typeof query === 'string'
      ? document.querySelector(query)
      : query
    if (!node) {
      results.push({ name: label + '.left', value: NaN, nearest: NaN, delta: NaN, pass: false, error: 'element not found' })
      return
    }
    const r = node.getBoundingClientRect()
    check(`${label}.left`,  r.left)
    check(`${label}.width`, r.width)
    check(`${label}.right`, r.right)
  }

  // ─── Test cases ─────────────────────────────────────────────────────────────
  measureEl('page',        '.page')
  measureEl('hero',        '.hero')
  measureEl('intro-grid',  '.intro-grid')

  document.querySelectorAll('.intro-card').forEach((n, i) =>
    measureEl(`intro-card[${i + 1}]`, n))

  measureEl('projects-grid', '.grid')

  document.querySelectorAll('.card').forEach((n, i) =>
    measureEl(`project-card[${i + 1}]`, n))

  measureEl('framework', '.framework')

  document.querySelectorAll('.framework-card').forEach((n, i) =>
    measureEl(`fw-card[${i + 1}]`, n))

  // ─── Report ─────────────────────────────────────────────────────────────────
  const passed  = results.filter(r => r.pass)
  const failed  = results.filter(r => !r.pass)

  const header = [
    '┌──────────────────────────────────────────────────────┐',
    `│  Blueprint Alignment Report                          │`,
    `│  Breakpoint : ${dataBp.padEnd(10)}  Columns : ${String(layoutColumns).padEnd(4)}          │`,
    `│  Page margin: ${String(pageMarginL + 'px').padEnd(10)}  Cell : ${CELL}px               │`,
    `│  Passed : ${String(passed.length).padEnd(5)}  Failed : ${String(failed.length).padEnd(5)}  Total : ${results.length}          │`,
    '└──────────────────────────────────────────────────────┘',
  ].join('\n')

  console.log(header)

  if (failed.length === 0) {
    console.log('%c All elements align to the 24px blueprint grid ✓', 'color: #57b0ff; font-weight: bold')
  } else {
    console.warn(`\n${failed.length} FAILURES:\n`)
    failed.forEach(f => {
      const msg = f.error
        ? `  ✗  ${f.name.padEnd(35)}  → ${f.error}`
        : `  ✗  ${f.name.padEnd(35)}  actual: ${String(f.value + 'px').padEnd(9)}  off by: ${f.delta}px  (nearest: ${f.nearest}px)`
      console.warn(msg)
    })

    if (passed.length > 0) {
      console.log(`\n${passed.length} passing:\n`)
      passed.forEach(p =>
        console.log(`  ✓  ${p.name.padEnd(35)}  ${p.value}px`))
    }
  }

  return {
    bp: dataBp,
    columns: layoutColumns,
    pageMarginLeft: pageMarginL,
    summary: { pass: passed.length, fail: failed.length, total: results.length },
    failures: failed,
    all: results,
  }
})()
