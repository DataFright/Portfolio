/**
 * blueprint.js — Portfolio Grid Geometry Engine
 *
 * The page background uses a 24px cell grid. This engine defines the
 * foreground layout in the same cell coordinate system so every panel
 * edge, gutter, and section boundary lands on a grid line.
 *
 *   1 cell = CELL_SIZE px (24)
 *   major line every MAJOR_STEP cells (5)
 *
 * Flow:
 *   viewport width → available cells → pick layout
 *   layout (cell coordinates) → CSS custom properties
 *   CSS Grid reads properties → browser renders
 *
 * Responsive model (columns switch, not styles):
 *   desktop  ≥ 56 cells wide
 *   tablet   ≥ 40 cells wide
 *   mobile   < 40 cells wide (24-column fallback)
 */

// ─── Grid constants ───────────────────────────────────────────────────────────
export const CELL_SIZE  = 24   // px per cell — must match --grid-unit in CSS
export const MAJOR_STEP = 5    // minor cells per major grid line

// ─── Math utilities ───────────────────────────────────────────────────────────

/** Convert a cell count to pixels. */
export const px = n => n * CELL_SIZE

/** Round an arbitrary pixel value to the nearest cell boundary. */
export const snap = v => Math.round(v / CELL_SIZE) * CELL_SIZE

/** Snap a pixel value down (floor) to the nearest cell boundary. */
export const snapDown = v => Math.floor(v / CELL_SIZE) * CELL_SIZE

/**
 * Return true when a placement fits within the available column count.
 * @param {number} start  1-based start column
 * @param {number} span   column span
 * @param {number} cols   total columns available
 */
export const fits = (start, span, cols) =>
  start >= 1 && start - 1 + span <= cols

/**
 * Distribute `count` equal-width items across `totalSpan` cells,
 * with `gap` whole-cell gaps between each item.
 *
 * Returns:
 *   itemSpan  — cells each item occupies
 *   starts    — 1-based column start for each item
 *
 * Example: distribute(52, 3, 2)
 *   → itemSpan = 16, starts = [1, 19, 37]
 *   → [16 cells][2 gap][16 cells][2 gap][16 cells] = 52 ✓
 */
export function distribute(totalSpan, count, gap = 1) {
  const totalGaps = (count - 1) * gap
  const itemSpan  = Math.floor((totalSpan - totalGaps) / count)
  const starts    = Array.from({ length: count }, (_, i) => 1 + i * (itemSpan + gap))
  return { itemSpan, starts }
}

// ─── Layout definitions (in cells) ───────────────────────────────────────────
// All coordinates are 1-based. Intra-section coordinates are relative to that
// section's own subgrid (column 1 = first column of the section).

function makeDesktop() {
  const columns      = 56
  const contentSpan  = 52       // 56 − 2 left cells − 2 right cells
  const contentStart = 3        // first page column of content area

  // Intro: [31 about][1 gap][20 contact] = 52 ✓
  const introMainCells    = 31
  const introContactCells = 20
  const introGap          = contentSpan - introMainCells - introContactCells   // 1
  const introContactStart = introMainCells + introGap + 1                       // 33

  // Projects: [25][2 gap][25] = 52 ✓
  const { itemSpan: projCells, starts: [pLeft, pRight] } = distribute(contentSpan, 2, 2)

  // Framework: [16][2 gap][16][2 gap][16] = 52 ✓
  const { itemSpan: fwCells, starts: [fw1, fw2, fw3] } = distribute(contentSpan, 3, 2)

  return {
    name: 'desktop',
    columns,
    pad: { top: 3, bottom: 4 },
    hero:    { start: contentStart, span: 40 },
    intro: {
      start: contentStart, span: contentSpan,
      main:    { start: 1,                span: introMainCells },
      contact: { start: introContactStart, span: introContactCells },
    },
    projects: {
      start: contentStart, span: contentSpan,
      cardCells: projCells, leftStart: pLeft, rightStart: pRight,
    },
    framework: {
      start: contentStart, span: contentSpan,
      cardCells: fwCells, colStarts: [fw1, fw2, fw3],
    },
    previewH: 15,
  }
}

function makeTablet() {
  const columns      = 40
  const contentSpan  = 36       // 40 − 2 left − 2 right
  const contentStart = 3

  // Framework: [17][2 gap][17] = 36 ✓
  const { itemSpan: fwCells, starts: [fw1, fw2] } = distribute(contentSpan, 2, 2)

  return {
    name: 'tablet',
    columns,
    pad: { top: 2, bottom: 3 },
    hero:    { start: contentStart, span: 32 },
    intro: {
      start: contentStart, span: contentSpan,
      main:    { start: 1, span: contentSpan },
      contact: { start: 1, span: contentSpan },
    },
    projects: {
      start: contentStart, span: contentSpan,
      cardCells: contentSpan, leftStart: 1, rightStart: 1,
    },
    framework: {
      start: contentStart, span: contentSpan,
      cardCells: fwCells, colStarts: [fw1, fw2, fw1],
    },
    previewH: 12,
  }
}

function makeSmallTablet() {
  const columns      = 36
  const contentSpan  = 32       // 36 − 2 left − 2 right
  const contentStart = 3

  // Framework: [15][2 gap][15] = 32 ✓
  const { itemSpan: fwCells, starts: [fw1, fw2] } = distribute(contentSpan, 2, 2)

  return {
    name: 'small-tablet',
    columns,
    pad: { top: 2, bottom: 3 },
    hero: { start: contentStart, span: 28 },
    intro: {
      start: contentStart, span: contentSpan,
      main:    { start: 1, span: contentSpan },
      contact: { start: 1, span: contentSpan },
    },
    projects: {
      start: contentStart, span: contentSpan,
      cardCells: contentSpan, leftStart: 1, rightStart: 1,
    },
    framework: {
      start: contentStart, span: contentSpan,
      cardCells: fwCells, colStarts: [fw1, fw2, fw1],
    },
    previewH: 10,
  }
}

function makeMobile() {
  const columns      = 24
  const contentSpan  = 24
  const contentStart = 1

  return {
    name: 'mobile',
    columns,
    pad: { top: 2, bottom: 3 },
    hero:    { start: 1, span: columns },
    intro: {
      start: contentStart, span: contentSpan,
      main:    { start: 1, span: contentSpan },
      contact: { start: 1, span: contentSpan },
    },
    projects: {
      start: contentStart, span: contentSpan,
      cardCells: contentSpan, leftStart: 1, rightStart: 1,
    },
    framework: {
      start: contentStart, span: contentSpan,
      cardCells: contentSpan, colStarts: [1, 1, 1],
    },
    previewH: 9,
  }
}

const DESKTOP      = makeDesktop()
const TABLET       = makeTablet()
const SMALL_TABLET = makeSmallTablet()
const MOBILE       = makeMobile()

// ─── Breakpoint resolver ──────────────────────────────────────────────────────

function resolveLayout(viewportWidth) {
  const availCells = Math.floor(viewportWidth / CELL_SIZE)
  if (availCells >= DESKTOP.columns)      return DESKTOP
  if (availCells >= TABLET.columns)       return TABLET
  if (availCells >= SMALL_TABLET.columns) return SMALL_TABLET
  return MOBILE
}

// ─── CSS custom property writer ───────────────────────────────────────────────

function applyLayout(L) {
  const R   = document.documentElement
  const set = (k, v) => R.style.setProperty(k, String(v))

  // Snap the page's left margin to a cell boundary so page columns align
  // with the background blueprint grid (which starts at viewport x=0).
  const pageWidth   = px(L.columns)
  const rawLeft     = (window.innerWidth - pageWidth) / 2
  const snappedLeft = rawLeft > 0 ? snapDown(rawLeft) : 0
  set('--page-margin-left', snappedLeft + 'px')

  // Set data-bp attribute for CSS [data-bp="…"] responsive selectors
  R.dataset.bp = L.name

  // Grid geometry
  set('--layout-columns',          L.columns)
  set('--layout-top-pad-cells',    L.pad.top)
  set('--layout-bottom-pad-cells', L.pad.bottom)

  // Hero
  set('--hero-start', L.hero.start)
  set('--hero-cells', L.hero.span)

  // Intro section
  set('--intro-start',         L.intro.start)
  set('--intro-span-cells',    L.intro.span)
  set('--intro-main-start',    L.intro.main.start)
  set('--intro-main-cells',    L.intro.main.span)
  set('--intro-contact-start', L.intro.contact.start)
  set('--intro-contact-cells', L.intro.contact.span)

  // Project cards
  set('--projects-start',      L.projects.start)
  set('--projects-span-cells', L.projects.span)
  set('--project-card-cells',  L.projects.cardCells)
  set('--project-left-start',  L.projects.leftStart)
  set('--project-right-start', L.projects.rightStart)

  // Framework section
  set('--framework-start',      L.framework.start)
  set('--framework-span-cells', L.framework.span)
  set('--framework-card-cells', L.framework.cardCells)
  L.framework.colStarts.forEach((s, i) =>
    set(`--framework-col-${i + 1}-start`, s)
  )

  // Preview image height
  set('--preview-height-cells', L.previewH)
}

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Initialize the blueprint geometry engine.
 *
 * Computes the layout for the current viewport, writes it as CSS custom
 * properties, and re-runs on every resize (debounced to one
 * requestAnimationFrame per frame to avoid jank).
 *
 * Returns a cleanup function that removes the event listener.
 */
export function initBlueprint() {
  let raf = null

  function onResize() {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      applyLayout(resolveLayout(window.innerWidth))
      raf = null
    })
  }

  // Apply synchronously on first call so CSS vars are set before first paint
  applyLayout(resolveLayout(window.innerWidth))

  window.addEventListener('resize', onResize, { passive: true })

  return function cleanup() {
    window.removeEventListener('resize', onResize)
    if (raf) cancelAnimationFrame(raf)
  }
}
