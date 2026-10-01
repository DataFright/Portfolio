import PageShell, { PageHero } from "../components/PageShell.jsx"

export default function NotFoundPage() {
  return (
    <PageShell
      title="Sheet not found — Matthew Swaney"
      rail={{ prod: "DATAFRIGHT", self: "_INDIE STARTUP", live: "SHEET_404 : NOT FOUND" }}
    >
      <PageHero title="Sheet not found" sub="There is no drawing at this address." current="" />

      <section className="intro-grid" aria-label="Not found">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION E-404 : OFF THE GRID</p>
          <h2>Try the index</h2>
          <p>
            The links under the title go to every page on this site. Or head back to the{" "}
            <a href="/">home page</a>.
          </p>
        </article>
      </section>
    </PageShell>
  )
}
