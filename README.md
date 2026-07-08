# Matthew Swaney's Portfolio

This portfolio is intentionally built like a technical blueprint, not a default website template.

The goal was to make the page feel engineered:
- crisp grid lines in the background
- foreground panels that lock to the same grid math
- subtle motion that still preserves structural alignment
- strong visual hierarchy without relying on generic UI kits

It was also just fun to build this way.

## Design Concept

Most portfolio pages use a common pattern:
- soft card layout
- standard responsive breakpoints
- utility-first classes or starter theme defaults

This project takes a different approach.

The page uses a 24px blueprint cell as the base design unit. Layout, spacing, panel widths, offsets, and decorative annotations all reference this same unit. That keeps the composition visually coherent even as breakpoints change.

## Blueprint System

### 1) Single source of geometry truth

The geometry engine lives in [src/blueprint.js](src/blueprint.js).

It computes:
- layout columns by breakpoint
- section spans and card starts in grid cells
- custom CSS variables consumed by styles

Instead of hardcoding unrelated CSS values across components, the engine writes coordinated variables to the root, and CSS consumes those values.

### 2) Shared background and foreground grid language

The page background and panel surfaces both use layered grid lines:
- minor lines every 24px
- major lines every 5 cells

This produces the drafting-table look while keeping panels and page framing aligned to the same visual rhythm.

### 3) Vertical snapping for structural rhythm

After render, visible sections and panel blocks are snapped so heights land on 24px boundaries.

Why this matters:
- prevents subtle drift where card edges land "almost" on grid lines
- keeps stacked sections visually disciplined
- makes the layout feel intentional at all viewport sizes

## Foreground Motion, But Controlled

The foreground plane has a slight drift effect tied to wheel/scroll impulse.

Key point:
- motion is decorative, but bounded and damped
- sections remain synchronized as one plane
- grid integrity is preserved instead of becoming chaotic parallax

This gives the interface energy while still feeling engineered.

## Why this is better than a basic template

For this specific portfolio concept, this approach gives benefits a stock template does not:

1. Strong identity
A blueprint language makes the project memorable and communicates systems thinking.

2. Visual consistency through math
A grid-driven layout scales with fewer random spacing decisions.

3. Better storytelling for engineering work
The UI itself demonstrates structure, constraints, and implementation discipline.

4. Easier intentional iteration
Because spacing and placement are cell-based, adjustments are predictable and coherent.

## Left-Rail Annotations

The left-side annotation rail extends the blueprint metaphor:
- technical labels
- measurement reference line (grid-derived pixel length)
- formula note

On smaller viewports, behavior is adjusted so details remain visible rather than clipping off-screen.

## Project Structure Sections

Each featured project includes:
- direct links
- architecture/testing/deployment notes
- explicit repository tree block for fast technical scanning

This helps technical reviewers understand scope and maturity quickly.

## Run Locally

Install and run:

```bash
npm install
npm run dev
```

Default local URL:
- http://localhost:3000/

## Build

```bash
npm run build
```

## Test Files

Alignment and blueprint integrity checks are in:
- [tests/alignment.spec.js](tests/alignment.spec.js)
- [tests/alignment.js](tests/alignment.js)

## Stack

- React
- Vite
- Playwright (alignment/visual behavior checks)

## Closing Note

This was built to feel like a crafted system, not a pre-packaged theme.

It combines technical rigor (geometry, snapping, consistency) with personality (blueprint aesthetic, motion, annotations), which is exactly what this portfolio is meant to communicate.
