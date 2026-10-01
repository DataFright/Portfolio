import PageShell, { PageHero } from "../components/PageShell.jsx"
import ContactList from "../components/ContactList.jsx"
import { SITE } from "../content/site.js"

export default function ContactPage() {
  return (
    <PageShell
      title="Contact — Matthew Swaney"
      rail={{ prod: "DATAFRIGHT", self: "_INDIE STARTUP", live: "SHEET_04 : CONTACT" }}
    >
      <PageHero
        title="Contact"
        sub="Questions, bug reports, work, or anything else — email is the fastest route."
        current="/contact"
      />

      <section className="intro-grid" aria-label="Contact">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION K-A : CONTACT</p>
          <h2>Email</h2>
          <p className="intro-line">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
          <p>I reply within {SITE.replyWindow}.</p>
          <p>
            Need help with Fly By Mouse? Include your Unity version and the console message — the
            <a href="/support"> support page</a> lists everything that helps.
          </p>
          <p>
            Hiring, collaborating, or just curious about the project? Same address. More about me and
            my other projects is on the <a href="/">home page</a>.
          </p>
        </article>

        <article className="intro-card contact-card">
          <h2>Contact</h2>
          <ContactList />
        </article>
      </section>
    </PageShell>
  )
}
