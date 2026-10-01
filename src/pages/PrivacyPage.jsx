import PageShell, { PageHero } from "../components/PageShell.jsx"
import { SITE } from "../content/site.js"

// A plain description of what the code does — see src/tracking/visitorTracker.js
// and tracking-worker/. If the tracker changes, change this page with it.
export default function PrivacyPage() {
  return (
    <PageShell
      title="Data notice — Matthew Swaney"
      rail={{ prod: "DATAFRIGHT", self: "_INDIE STARTUP", live: "SHEET_05 : DATA NOTICE" }}
    >
      <PageHero
        title="Data notice"
        sub="What this site records when you visit, in plain language."
        current="/privacy"
      />

      <section className="intro-grid" aria-label="What this site records">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION P-A : WHAT IS RECORDED</p>
          <h2>Anonymous visit statistics</h2>
          <p>
            This site has no accounts, forms or advertising, and it never asks you for personal
            details. It does record how it is used.
          </p>
          <p>From your browser:</p>
          <ul>
            <li>A random ID kept in your browser storage, and a per-visit session ID, so repeat visits can be recognised.</li>
            <li>The page you viewed, the page you came from, your language and time zone, and your screen and window size.</li>
            <li>How long you stayed and how far you scrolled.</li>
            <li>Whether your browser sends Do Not Track. It is recorded; the site does not currently act on it.</li>
          </ul>
          <p>Added by the server:</p>
          <ul>
            <li>A one-way hash of your IP address — not the address itself.</li>
            <li>Country, region and city, and the network and organization your connection belongs to, as reported by Cloudflare.</li>
            <li>Your browser’s user-agent string, and a score for how likely the visit is a bot.</li>
          </ul>
        </article>

        <article className="intro-card contact-card">
          <h2>Where it goes</h2>
          <ul className="contact-list spec-list">
            <li>
              <span>Host</span>
              <b>Vercel</b>
            </li>
            <li>
              <span>Stored</span>
              <b>Cloudflare D1, a database I control</b>
            </li>
            <li>
              <span>Used</span>
              <b>Traffic statistics and bot filtering</b>
            </li>
            <li>
              <span>Kept</span>
              <b>No automatic deletion yet</b>
            </li>
          </ul>
        </article>
      </section>

      <section className="intro-grid" aria-label="Other services and questions">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION P-B : OTHER SERVICES</p>
          <h2>Third parties</h2>
          <p>
            There are no third-party analytics or advertising scripts. The Groupz preview image on
            the home page is loaded from image.thum.io, so that service receives your request for it.
          </p>
          <p>
            Questions about any of this, or want to know what is held about a visit? Email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. I reply within {SITE.replyWindow}.
          </p>
          <p>Last reviewed 2026-10-01. This describes what the site’s code does; it is not legal advice.</p>
        </article>
      </section>
    </PageShell>
  )
}
