import PageShell, { PageHero } from "../components/PageShell.jsx"
import { SITE } from "../content/site.js"
import { flyByMouse as fbm } from "../content/flyByMouse.js"

export default function SupportPage() {
  return (
    <PageShell
      title="Support — Fly By Mouse — DataFright"
      rail={{ prod: "DATAFRIGHT", self: "_INDIE STARTUP", live: "REPLY_WINDOW=3 BUSINESS DAYS" }}
    >
      <PageHero
        title="Support"
        sub={`Help with Fly By Mouse. I reply within ${SITE.replyWindow}.`}
        current="/support"
      />

      <section className="intro-grid" aria-label="Getting help">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION S-A : GET HELP</p>
          <h2>Get help</h2>
          <p>
            Email <a href={`mailto:${SITE.email}?subject=Fly%20By%20Mouse%20support`}>{SITE.email}</a>{" "}
            with “Fly By Mouse” in the subject. I reply within {SITE.replyWindow}.
          </p>
          <p>To let me reproduce it, please include:</p>
          <ul>
            <li>your Unity version (for example 6000.3.21f1) and render pipeline</li>
            <li>the Fly By Mouse version you imported</li>
            <li>the console message, copied in full</li>
            <li>what you did, and what you expected to happen</li>
            <li>a short screen capture, if the problem is visual</li>
          </ul>
        </article>

        <article className="intro-card contact-card">
          <h2>Direct</h2>
          <ul className="contact-list spec-list">
            <li>
              <span>Email</span>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <span>Reply</span>
              <b>within {SITE.replyWindow}</b>
            </li>
            <li>
              <span>Product</span>
              <a href="/fly-by-mouse">Fly By Mouse</a>
            </li>
            <li>
              <span>By</span>
              <b>{SITE.brand}</b>
            </li>
          </ul>
        </article>
      </section>

      <section className="intro-grid" aria-label="First-flight fixes">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION S-B : FIRST-FLIGHT FIXES</p>
          <h2>Try these first</h2>
          <p>
            Most first-flight problems are one of these. The package ships twelve docs; the full
            troubleshooting table is in <code>Documentation/01_FLIGHT_RIG.md</code>.
          </p>
          <ul>
            {fbm.firstFlightFixes.map(([symptom, cause]) => (
              <li key={symptom}>
                <strong>{symptom}</strong> — {cause}
              </li>
            ))}
          </ul>
        </article>

        <article className="intro-card contact-card">
          <h2>Requirements</h2>
          <ul className="contact-list spec-list">
            {fbm.requirements.map(([label, text]) => (
              <li key={label}>
                <span>{label}</span>
                <b>{text}</b>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="framework" aria-label="Support scope">
        <p className="section-tag section-tag--container">SECTION S-C : SCOPE</p>
        <div className="framework-head">
          <p className="eyebrow">What I can help with</p>
          <h2>Scope of support</h2>
          <p>
            Fly By Mouse is the flight feel and the pieces of a flyable game; the game around it is
            yours. Support follows that line.
          </p>
        </div>

        <div className="framework-grid">
          <article className="framework-card">
            <h3>Covered</h3>
            <ul>
              <li>Bugs in the package.</li>
              <li>Setup and documentation questions.</li>
              <li>Questions about the supported configuration.</li>
            </ul>
          </article>
          <article className="framework-card">
            <h3>Not covered</h3>
            <ul>
              <li>Building or integrating your own game around it.</li>
              <li>Other Unity versions: Unity 6.3 with URP is the supported configuration. I will look at reports from others but cannot promise a fix.</li>
            </ul>
          </article>
          <article className="framework-card">
            <h3>Purchases and refunds</h3>
            <ul>
              <li>Purchases, invoices and refund requests are handled through the Unity Asset Store.</li>
            </ul>
          </article>
        </div>
      </section>
    </PageShell>
  )
}
