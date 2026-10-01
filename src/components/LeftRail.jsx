// The blueprint side notes. Home passes its own wording; other sheets pass theirs.
export default function LeftRail({
  prod = "PRODUCTION READY",
  self = "_SELF TAUGHT",
  circa = "CIRCA2026",
  live,
}) {
  return (
    <aside className="left-rail" aria-label="Blueprint side notes">
      <p className="rail-text rail-text--prod">{prod}</p>
      <p className="rail-text rail-text--self">{self}</p>
      <p className="rail-text rail-text--formula">d = sqrt((x_2 - x_1)^2 + (y_2 - y_1)^2)</p>
      <p className="rail-text rail-text--circa">{circa}</p>

      <div className="rail-scale" aria-hidden="true">
        <span className="rail-scale-line" />
        <span className="rail-scale-label">72 px</span>
      </div>

      <p className="rail-text rail-text--live">{live}</p>
    </aside>
  )
}
