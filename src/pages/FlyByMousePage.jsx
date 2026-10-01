import PageShell, { PageHero } from "../components/PageShell.jsx"
import MouseAimDiagram from "../components/MouseAimDiagram.jsx"
import { flyByMouse as fbm } from "../content/flyByMouse.js"

export default function FlyByMousePage() {
  return (
    <PageShell
      title="Fly By Mouse — a mouse-aim flight controller for Unity — DataFright"
      rail={{ prod: "DATAFRIGHT", self: "_INDIE STARTUP", live: "FLY_BY_MOUSE=PRE-LAUNCH" }}
    >
      <PageHero title={fbm.name} sub={`${fbm.tagline} ${fbm.inspiredBy}`} current="/fly-by-mouse" />

      <section className="intro-grid" aria-label="What it is">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION F-A : WHAT IT IS</p>
          <h2>Point where you want to go</h2>
          <p>{fbm.summary}</p>
          <p>
            The camera follows the aim, not the aircraft, so it stays calm while the aircraft works
            hard. Around that core you get the pieces of a flyable game: data-driven aircraft, a plane
            mode and a spaceship mode, configurable worlds, guns and damage, a HUD, a basic enemy AI,
            pause and respawn. <strong>You get the pieces; the game is yours.</strong>
          </p>
        </article>

        <article className="intro-card contact-card">
          <h2>Spec sheet</h2>
          <ul className="contact-list spec-list">
            {fbm.requirements.map(([label, text]) => (
              <li key={label}>
                <span>{label}</span>
                <b>{text}</b>
              </li>
            ))}
            <li>
              <span>Stage</span>
              <b>{fbm.status}</b>
            </li>
            <li>
              <span>Store</span>
              <b>{fbm.store}</b>
            </li>
            <li>
              <span>By</span>
              <b>DataFright</b>
            </li>
          </ul>
        </article>
      </section>

      <section className="featured" aria-label="Schematic">
        <article className="card card--figure">
          <div className="feature-media feature-media--wide">
            <p className="section-tag section-tag--project">SECTION F-B : FIG. 1</p>
            <MouseAimDiagram />
          </div>
        </article>
      </section>

      <section className="grid" aria-label="Captures from the Unity Game view">
        {fbm.shots.map((shot, i) => (
          <article className="card reveal" key={shot.src}>
            <div className="preview-link">
              <p className="section-tag section-tag--project">SECTION F-B{i + 1} : PLAYTEST_DEMO_{i + 1}</p>
              <img className="preview" src={shot.src} alt={shot.alt} loading="lazy" />
            </div>
            <div className="card-body">
              <h2>{shot.title}</h2>
              <p className="url">{fbm.shotsNote}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="framework" aria-label="What is in the package">
        <p className="section-tag section-tag--container">SECTION F-C : IN THE BOX</p>
        <div className="framework-head">
          <p className="eyebrow">What you get</p>
          <h2>The pieces of a flyable game</h2>
          <p>
            One drag-in prefab, the three-asset data model that makes aircraft and worlds
            configuration rather than code, and twelve docs that ship with it.
          </p>
        </div>

        <div className="framework-grid">
          {fbm.features.map(card => (
            <article className="framework-card" key={card.title}>
              <h3>{card.title}</h3>
              <ul>
                {card.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="intro-grid" aria-label="Getting started">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION F-D : FLY IN FIVE MINUTES</p>
          <h2>Fly in five minutes</h2>
          <ol>
            {fbm.flyInFive.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="intro-card contact-card">
          <h2>Not in the box</h2>
          <p>{fbm.notInTheBox}</p>
        </article>
      </section>

      <section className="intro-grid" aria-label="Release and support">
        <article className="intro-card">
          <p className="section-tag section-tag--container">SECTION F-E : RELEASE</p>
          <h2>Status</h2>
          <p>
            <strong>{fbm.status}.</strong> Fly By Mouse is being prepared for the Unity Asset Store as
            a single paid package, published by DataFright. The store link will appear here when it is
            live.
          </p>
          <p>
            Questions before then? <a href="/contact">Get in touch</a>. Already have it and stuck?{" "}
            <a href="/support">Support</a> lists what to send and the first-flight fixes.
          </p>
        </article>

        <article className="intro-card contact-card">
          <h2>Elsewhere</h2>
          <ul className="contact-list spec-list">
            <li>
              <span>Support</span>
              <a href="/support">/support</a>
            </li>
            <li>
              <span>Contact</span>
              <a href="/contact">/contact</a>
            </li>
            <li>
              <span>Privacy</span>
              <a href="/privacy">/privacy</a>
            </li>
          </ul>
        </article>
      </section>
    </PageShell>
  )
}
