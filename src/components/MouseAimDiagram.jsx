// Fig. 1 — the one idea behind the product, drawn in the site's own language.
// A labelled schematic, not a screenshot: nothing here pretends to be gameplay.
// Drawn on a 624 x 360 sheet (26 x 15 cells), so it sits on the grid at desktop size.

export default function MouseAimDiagram() {
  return (
    <svg
      className="aim-diagram"
      viewBox="0 0 624 360"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby="aim-diagram-title aim-diagram-desc"
    >
      <title id="aim-diagram-title">Mouse-aim schematic</title>
      <desc id="aim-diagram-desc">
        An aircraft seen from above. A dashed boresight line runs straight ahead. A solid line runs
        to the aim point the mouse has moved, and the autopilot turns the aircraft toward it.
      </desc>

      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* aircraft, from above, nose to the right */}
        <ellipse cx="180" cy="192" rx="62" ry="9" />
        <path d="M 196 184 L 164 120 L 178 120 L 222 184" />
        <path d="M 196 200 L 164 264 L 178 264 L 222 200" />
        <path d="M 128 188 L 114 160 L 126 160 L 148 188" />
        <path d="M 128 196 L 114 224 L 126 224 L 148 196" />

        {/* boresight: straight ahead of the nose */}
        <line x1="242" y1="192" x2="450" y2="192" strokeDasharray="6 6" opacity="0.7" />
        <rect x="450" y="186" width="12" height="12" opacity="0.7" />

        {/* the aim the mouse moved, and the turn the autopilot flies */}
        <line x1="242" y1="190" x2="443" y2="117" />
        <circle cx="456" cy="112" r="14" />
        <line x1="436" y1="112" x2="476" y2="112" />
        <line x1="456" y1="92" x2="456" y2="132" />
        <path d="M 342 192 A 100 100 0 0 0 336 158" opacity="0.85" />

        {/* the mouse that moved it */}
        <rect x="528" y="256" width="40" height="64" rx="20" />
        <line x1="548" y1="256" x2="548" y2="280" />
        <path d="M 548 256 C 548 210 520 170 486 130" strokeDasharray="2 6" opacity="0.8" />

        {/* the camera follows the aim, not the aircraft */}
        <g transform="rotate(-20 48 192)">
          <rect x="20" y="180" width="28" height="24" />
          <path d="M 48 186 L 66 176 L 66 208 L 48 198" />
        </g>

        {/* aim distance, as a drawing dimension */}
        <line x1="180" y1="288" x2="456" y2="288" />
        <line x1="180" y1="280" x2="180" y2="296" />
        <line x1="456" y1="280" x2="456" y2="296" />
        <line x1="456" y1="204" x2="456" y2="280" strokeDasharray="2 5" opacity="0.5" />
      </g>

      <g className="aim-labels">
        <text x="456" y="72" textAnchor="middle">Aim point</text>
        <text x="474" y="196">Boresight</text>
        <text x="352" y="180">Turn</text>
        <text x="258" y="173" transform="rotate(-20 258 173)">Autopilot flies to aim</text>
        <text x="318" y="314" textAnchor="middle">Aim distance</text>
        <text x="548" y="342" textAnchor="middle">Mouse</text>
        <text x="20" y="250">Camera</text>
        <text x="20" y="264">follows aim</text>
        <text x="24" y="28" className="aim-fig">Fig. 1 — mouse-aim schematic</text>
      </g>
    </svg>
  )
}
