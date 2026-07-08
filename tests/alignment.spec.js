/**
 * Blueprint Grid Alignment — Playwright E2E Tests
 *
 * These tests verify actual rendered behaviour, not just CSS math.
 * They would have caught the two bugs that existed before:
 *   1. background-attachment: fixed  (panel grids drift on scroll)
 *   2. box-shadow: inset ring on .framework (visual inconsistency)
 *   3. fw-card edges 1px off-grid (border + padding misalignment)
 *
 * Run: npx playwright test tests/alignment.spec.js --reporter=list
 */

// @ts-check
import { test, expect } from '@playwright/test'

const CELL = 24
const TOL  = 0.5  // sub-pixel rounding tolerance

// ─── helpers ─────────────────────────────────────────────────────────────────
const onGrid = v => Math.abs(v - Math.round(v / CELL) * CELL) <= TOL

test.describe('Blueprint Grid Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1200 })
    await page.goto('http://localhost:3000/')
    await page.waitForSelector('.framework-card')
    await page.evaluate(() => window.scrollTo(0, 0))
  })

  // ─── 1. Computed-style checks — catch CSS pattern bugs ──────────────────────

  test('panels do NOT use fixed background-attachment (causes scroll drift)', async ({ page }) => {
    const results = await page.evaluate(() => {
      return ['.intro-card', '.card', '.framework', '.framework-card'].map(sel => {
        const el = document.querySelector(sel)
        const attachment = el ? getComputedStyle(el).backgroundAttachment : 'NOT FOUND'
        return { sel, attachment }
      })
    })

    for (const { sel, attachment } of results) {
      // Every layer must be scroll, NOT fixed
      expect(attachment, `${sel} uses fixed background-attachment → grid drifts on scroll`).not.toContain('fixed')
    }
  })

  test('all panels use the same ring mechanism (border, not inset box-shadow)', async ({ page }) => {
    const results = await page.evaluate(() => {
      return ['.intro-card', '.card', '.framework', '.framework-card'].map(sel => {
        const el = document.querySelector(sel)
        if (!el) return { sel, error: 'not found' }
        const cs = getComputedStyle(el)
        return {
          sel,
          hasInsetShadow: cs.boxShadow.toLowerCase().includes('inset'),
          borderWidth:    cs.borderLeftWidth,
        }
      })
    })

    for (const r of results) {
      expect(r.hasInsetShadow, `${r.sel} uses inset box-shadow for ring — inconsistent with other panels`).toBe(false)
      expect(r.borderWidth, `${r.sel} has no border`).toBe('1px')
    }
  })

  // ─── 2. CSS box position checks — outer edges on 24px grid ──────────────────

  test('all major element edges land on the 24px grid', async ({ page }) => {
    const failures = await page.evaluate((CELL) => {
      const results = []
      const check = (name, v) => {
        const nearest = Math.round(v / CELL) * CELL
        const delta   = Math.abs(v - nearest)
        if (delta > 0.5) results.push({ name, value: +v.toFixed(2), nearest, delta: +delta.toFixed(2) })
      }
      // accepts a CSS selector string OR an Element directly
      const measure = (label, query) => {
        const node = typeof query === 'string' ? document.querySelector(query) : query
        if (!node) { results.push({ name: label, error: 'not found' }); return }
        const r = node.getBoundingClientRect()
        check(`${label}.left`,  r.left)
        check(`${label}.width`, r.width)
        check(`${label}.right`, r.right)
      }

      measure('page',          '.page')
      measure('hero',          '.hero')
      measure('intro-grid',    '.intro-grid')
      document.querySelectorAll('.intro-card').forEach((n, i)     => measure(`intro-card[${i+1}]`,   n))
      measure('projects-grid', '.grid')
      document.querySelectorAll('.card').forEach((n, i)           => measure(`project-card[${i+1}]`, n))
      measure('framework',     '.framework')
      document.querySelectorAll('.framework-card').forEach((n, i) => measure(`fw-card[${i+1}]`,      n))

      return results
    }, CELL)

    if (failures.length > 0) {
      const msg = failures.map(f =>
        f.error ? `  ${f.name}: ${f.error}` : `  ${f.name}: ${f.value}px (off ${f.delta}px, nearest ${f.nearest}px)`
      ).join('\n')
      expect.soft(failures.length, `Grid alignment failures:\n${msg}`).toBe(0)
    }
  })

  // ─── 3. Content-area alignment — inner grid starts on-grid ──────────────────

  test('framework content area (where fw-cards live) starts on the 24px grid', async ({ page }) => {
    const result = await page.evaluate((CELL) => {
      const fw     = document.querySelector('.framework')
      const fwCard = document.querySelector('.framework-card')
      const fwGrid = document.querySelector('.framework-grid')
      const fwCards = Array.from(document.querySelectorAll('.framework-card'))
      if (!fw || !fwCard || !fwGrid) return { error: 'elements not found' }

      const fwRect   = fw.getBoundingClientRect()
      const cardRect = fwCard.getBoundingClientRect()
      const gridRect = fwGrid.getBoundingClientRect()
      const cs       = getComputedStyle(fw)
      const maxOverflowRight = fwCards.reduce((max, el) => {
        const r = el.getBoundingClientRect()
        return Math.max(max, r.right - gridRect.right)
      }, -Infinity)

      const borderLeft  = parseFloat(cs.borderLeftWidth)
      const paddingLeft = parseFloat(cs.paddingLeft)
      const contentX    = fwRect.left + borderLeft + paddingLeft
      const nearest     = Math.round(contentX / CELL) * CELL
      const delta       = Math.abs(contentX - nearest)

      return {
        frameworkLeft: fwRect.left,
        borderLeft, paddingLeft,
        contentX: +contentX.toFixed(2),
        nearest, delta: +delta.toFixed(2),
        pass: delta <= 0.5,
        // Also check first fw-card
        fwCardLeft: +cardRect.left.toFixed(2),
        fwCardDelta: +Math.abs(cardRect.left - Math.round(cardRect.left / CELL) * CELL).toFixed(2),
        fwGridRight: +gridRect.right.toFixed(2),
        maxOverflowRight: +maxOverflowRight.toFixed(2),
      }
    }, CELL)

    expect(result.pass,
      `framework content area at ${result.contentX}px is ${result.delta}px off-grid ` +
      `(border ${result.borderLeft}px + padding ${result.paddingLeft}px = ${result.borderLeft + result.paddingLeft}px inset)`
    ).toBe(true)

    expect(result.fwCardDelta <= 0.5,
      `fw-card[1] left edge ${result.fwCardLeft}px is ${result.fwCardDelta}px off grid`
    ).toBe(true)

    expect(result.maxOverflowRight <= 0.5,
      `framework cards extend ${result.maxOverflowRight}px past framework-grid right edge ${result.fwGridRight}px`
    ).toBe(true)
  })

  // ─── 4. Scroll stability — grid must stay aligned after scrolling ────────────

  test('element horizontal positions stay on-grid after scrolling 120px', async ({ page }) => {
    // Scroll down 5 cells (120px = 5 × 24px)
    await page.evaluate(() => window.scrollTo(0, 120))
    await page.waitForTimeout(100) // allow reflow

    const failures = await page.evaluate((CELL) => {
      const results = []
      const sel = ['.page', '.intro-grid', '.grid', '.framework']
      sel.forEach(s => {
        const el = document.querySelector(s)
        if (!el) return
        const left = el.getBoundingClientRect().left
        const d = Math.abs(left - Math.round(left / CELL) * CELL)
        if (d > 0.5) results.push({ sel: s, left: +left.toFixed(2), delta: +d.toFixed(2) })
      })
      return results
    }, CELL)

    expect(failures.length, `After scroll, elements drifted off-grid: ${JSON.stringify(failures)}`).toBe(0)
  })

  // ─── 5. Panel grid overlay alignment ─────────────────────────────────────────

  test('panel background grids use scroll attachment matching the page grid', async ({ page }) => {
    // If fixed: panel bg position in viewport doesn't change when scrolled.
    //           body bg position in viewport DOES change (by scroll amount).
    //           → they diverge → visual misalignment.
    // If scroll: both move together → stay aligned.

    // Capture the computed background position of the page body background at scroll=0
    const at0 = await page.evaluate(() => {
      window.scrollTo(0, 0)
      const cs = getComputedStyle(document.body)
      return { bodyBgPos: cs.backgroundPosition }
    })

    await page.evaluate(() => window.scrollTo(0, 48))

    const at48 = await page.evaluate(() => {
      const fwCard = document.querySelector('.framework-card')
      if (!fwCard) return { error: 'not found' }
      const cs = getComputedStyle(fwCard)
      return {
        bgAttachment: cs.backgroundAttachment,
        allScroll: !cs.backgroundAttachment.includes('fixed'),
      }
    })

    expect(at48.allScroll,
      `Framework-card background uses 'fixed' attachment — panel grid will drift on scroll`
    ).toBe(true)
  })

  // ─── 6. Vertical alignment — section heights and tops must be on-grid ────────

  test('section and panel heights are multiples of 24px after snapVertical()', async ({ page }) => {
    // snapVertical() is called via useLayoutEffect in App.jsx.
    // Verify both outer sections and visible nested panels at desktop width.
    const failures = await page.evaluate((CELL) => {
      const sels = ['.hero', '.intro-grid', '.grid', '.framework', '.intro-card', '.contact-card', '.card', '.framework-card']
      return sels.flatMap(sel => {
        return Array.from(document.querySelectorAll(sel)).flatMap((el, i) => {
          const h = el.getBoundingClientRect().height
          const delta = Math.abs(h % CELL < CELL / 2 ? h % CELL : CELL - (h % CELL))
          if (delta > 0.5) {
            return [{ sel: `${sel}[${i + 1}]`, height: +h.toFixed(2), mod: +(h % CELL).toFixed(2), delta: +delta.toFixed(2) }]
          }
          return []
        })
      })
    }, CELL)

    if (failures.length) {
      const msg = failures.map(f => f.error
        ? `  ${f.sel}: ${f.error}`
        : `  ${f.sel}: height ${f.height}px — ${f.mod}px past last cell (need +${(CELL - f.mod).toFixed(1)}px snap)`)
        .join('\n')
      expect(failures.length, `Section/panel heights not on vertical grid:\n${msg}`).toBe(0)
    }
  })

  test('section and panel top positions are on the vertical 24px grid (at scroll=0)', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0))

    const failures = await page.evaluate((CELL) => {
      const sels = ['.hero', '.intro-grid', '.grid', '.framework', '.intro-card', '.contact-card', '.card', '.framework-card']
      return sels.flatMap(sel => {
        return Array.from(document.querySelectorAll(sel)).flatMap((el, i) => {
          const top = el.getBoundingClientRect().top
          const delta = Math.abs(top - Math.round(top / CELL) * CELL)
          if (delta > 0.5) {
            return [{ sel: `${sel}[${i + 1}]`, top: +top.toFixed(2), nearest: Math.round(top / CELL) * CELL, delta: +delta.toFixed(2) }]
          }
          return []
        })
      })
    }, CELL)

    if (failures.length) {
      const msg = failures.map(f => f.error
        ? `  ${f.sel}: ${f.error}`
        : `  ${f.sel}: top ${f.top}px — ${f.delta}px off nearest grid line ${f.nearest}px`)
        .join('\n')
      expect(failures.length, `Section/panel tops not on vertical grid:\n${msg}`).toBe(0)
    }
  })
})

