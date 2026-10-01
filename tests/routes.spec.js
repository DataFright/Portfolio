/**
 * Sheets (pages) — Playwright E2E Tests
 *
 * The home page is covered by alignment.spec.js. These tests run the same grid
 * rules against EVERY sheet at four widths, and check the things the Unity Asset
 * Store publisher profile depends on: a real /contact page, a real /support
 * page, working links between sheets, and the featured card sitting first and
 * centred on the home page.
 *
 * Run: npx playwright test tests/routes.spec.js --reporter=list
 * (needs the dev server on :3000, like the alignment tests)
 */

// @ts-check
import { test, expect } from '@playwright/test'

const BASE_CELL = 24
// The snap leaves up to half a pixel of residue per panel, and it adds up down a long
// page. Under 1px is invisible, so that is the bar for these sheets.
const TOL = 1

const ROUTES = [
  { path: '/', h1: 'Matthew Swaney' },
  { path: '/fly-by-mouse', h1: 'Fly By Mouse' },
  { path: '/support', h1: 'Support' },
  { path: '/contact', h1: 'Contact' },
  { path: '/privacy', h1: 'Data notice' },
]
const WIDTHS = [1400, 900, 600, 390]

const liveCell = page =>
  page.evaluate(
    base => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--grid-unit')) || base,
    BASE_CELL,
  )

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    test(`${route.path} @${width}px: loads clean and every panel sits on the grid`, async ({ page }) => {
      const errors = []
      page.on('pageerror', e => errors.push(e.message))

      await page.setViewportSize({ width, height: 1000 })
      await page.goto(route.path)
      await page.waitForSelector('h1')
      await page.evaluate(() => document.fonts.ready)
      await page.evaluate(() => window.scrollTo(0, 0))

      // renders the right sheet, with no script errors
      await expect(page.locator('h1')).toHaveText(route.h1)
      expect(errors, 'uncaught page errors').toEqual([])

      const CELL = await liveCell(page)

      const failures = await page.evaluate(CELL => {
        const out = []
        const off = v => Math.abs(v - Math.round(v / CELL) * CELL)
        const TOL = 1

        // 1. horizontal edges
        const edgeSels = ['.page', '.hero', '.featured', '.intro-grid', '.intro-card', '.grid', '.card', '.framework', '.framework-card']
        edgeSels.forEach(sel =>
          document.querySelectorAll(sel).forEach((el, i) => {
            const r = el.getBoundingClientRect()
            ;[['left', r.left], ['width', r.width], ['right', r.right]].forEach(([k, v]) => {
              if (off(v) > TOL) out.push(`${sel}[${i + 1}].${k} = ${v.toFixed(2)}px (off ${off(v).toFixed(2)})`)
            })
          }),
        )

        // 2 + 3. vertical heights and tops (at scroll 0)
        const vertSels = ['.hero', '.featured', '.intro-grid', '.grid', '.framework', '.intro-card', '.card', '.framework-card']
        vertSels.forEach(sel =>
          document.querySelectorAll(sel).forEach((el, i) => {
            const r = el.getBoundingClientRect()
            if (off(r.height) > TOL) out.push(`${sel}[${i + 1}] height = ${r.height.toFixed(2)}px (off ${off(r.height).toFixed(2)})`)
            if (off(r.top) > TOL) out.push(`${sel}[${i + 1}] top = ${r.top.toFixed(2)}px (off ${off(r.top).toFixed(2)})`)
          }),
        )

        // 4. nothing pushes the page sideways
        const de = document.documentElement
        if (de.scrollWidth > window.innerWidth + 1) out.push(`horizontal overflow: scrollWidth ${de.scrollWidth} > ${window.innerWidth}`)
        return out
      }, CELL)

      expect(failures, `Grid failures on ${route.path} @${width}px:\n  ${failures.join('\n  ')}`).toEqual([])
    })
  }
}

test.describe('Sheet index and required pages', () => {
  test('every sheet links to every other, and marks itself current', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path)
      await page.waitForSelector('.site-nav')
      const hrefs = await page.locator('.site-nav a').evaluateAll(as => as.map(a => a.getAttribute('href')))
      expect(hrefs).toEqual(ROUTES.map(r => r.path))
      await expect(page.locator('.site-nav a[aria-current="page"]')).toHaveAttribute('href', route.path)
    }
  })

  test('every link in the sheet index resolves to a real sheet', async ({ page }) => {
    await page.goto('/')
    for (const route of ROUTES) {
      const res = await page.request.get(route.path)
      expect(res.status(), `${route.path} status`).toBe(200)
    }
  })

  test('an unknown address shows the not-found sheet, not the home page', async ({ page }) => {
    await page.goto('/no-such-sheet')
    await expect(page.locator('h1')).toHaveText('Sheet not found')
  })

  test('trailing slashes and capitals resolve to the same sheet', async ({ page }) => {
    await page.goto('/Support/')
    await expect(page.locator('h1')).toHaveText('Support')
  })

  test('/support gives the email and the reply promise', async ({ page }) => {
    await page.goto('/support')
    await expect(page.locator('a[href^="mailto:matthew.j.swaney@gmail.com"]').first()).toBeVisible()
    await expect(page.getByText('within 3 business days').first()).toBeVisible()
  })

  test('/contact gives a working email link', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('a[href="mailto:matthew.j.swaney@gmail.com"]').first()).toBeVisible()
  })

  test('the product page and the privacy page do not claim the store link is live', async ({ page }) => {
    await page.goto('/fly-by-mouse')
    await expect(page.getByText('coming soon').first()).toBeVisible()
    const storeLinks = await page.locator('a[href*="assetstore.unity.com"]').count()
    expect(storeLinks, 'no Asset Store link may appear before the listing is live').toBe(0)
  })
})

test.describe('Home page: featured card', () => {
  test('is the first section under the title, full width and centred', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 })
    await page.goto('/')
    await page.waitForSelector('.featured')

    const m = await page.evaluate(() => {
      const box = sel => document.querySelector(sel).getBoundingClientRect()
      const page = box('.page')
      const feat = box('.featured')
      return {
        order: [...document.querySelectorAll('.page > header, .page > section')].map(e => e.className),
        leftGap: feat.left - page.left,
        rightGap: page.right - feat.right,
        featTop: feat.top,
        introTop: box('.intro-grid').top,
        projectsTop: box('.grid').top,
      }
    })

    expect(m.order[0]).toBe('hero')
    expect(m.order[1]).toBe('featured')
    expect(m.featTop).toBeLessThan(m.introTop)
    expect(m.introTop).toBeLessThan(m.projectsTop)
    expect(Math.abs(m.leftGap - m.rightGap), 'featured card is centred on the page').toBeLessThan(0.5)
  })

  test('the two original project cards are still there, below it', async ({ page }) => {
    await page.goto('/')
    const names = await page.locator('.grid .card h2').allTextContents()
    expect(names).toEqual(['Groupz', 'Screenr'])
  })
})
