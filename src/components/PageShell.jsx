import LeftRail from "./LeftRail.jsx"
import SiteNav from "./SiteNav.jsx"
import { usePageEffects } from "../usePageEffects.js"

/** The page frame: left rail + content, with the shared per-page behaviour. */
export default function PageShell({ title, rail, children }) {
  usePageEffects(title)

  return (
    <main className="page">
      <LeftRail {...rail} />
      {children}
    </main>
  )
}

/** Title block at the top of every sheet. */
export function PageHero({ title, sub, current }) {
  return (
    <header className="hero">
      <h1>{title}</h1>
      <p className="subhead">{sub}</p>
      <SiteNav current={current} />
    </header>
  )
}
