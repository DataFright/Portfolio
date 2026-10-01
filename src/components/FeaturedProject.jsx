import MouseAimDiagram from "./MouseAimDiagram.jsx"
import { flyByMouse as fbm } from "../content/flyByMouse.js"

function Section({ section }) {
  return (
    <div>
      <h3>{section.title}</h3>
      {section.content ? (
        <p>{section.content}</p>
      ) : (
        <ul>
          {section.list.map(([key, text]) => (
            <li key={key}>
              <strong>{key}</strong>: {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// The featured card on the home page. Same panel language as the other project
// cards (.card, .section-tag, .chip-row, .detail), laid out as two columns on
// desktop: the schematic and package tree on the left, the write-up on the right.
export default function FeaturedProject() {
  return (
    <section className="featured" aria-label="Featured project">
      <article className="card card--featured reveal">
        <div className="feature-side">
          <a className="feature-media" href="/fly-by-mouse" aria-label="Fly By Mouse product page">
            <p className="section-tag section-tag--project">SECTION B1 : PROJECT_3 // FEATURED</p>
            <MouseAimDiagram />
          </a>
          <div className="card-body">
            <div className="detail structure-block">
              <h3>Package Structure</h3>
              <pre className="structure-tree">{fbm.structure}</pre>
            </div>
            <div className="detail open">
              {fbm.sections
                .filter(section => section.column === "side")
                .map(section => (
                  <Section key={section.title} section={section} />
                ))}
            </div>
          </div>
        </div>

        <div className="feature-main card-body">
          <h2>{fbm.name}</h2>
          <p className="url">Unity Asset Store · by DataFright</p>
          <div className="chip-row">
            <p className="type-pill">Focus Type: Unity tool, mouse-aim flight controller</p>
            <p className="type-pill soft">Unity 6.3 · URP · Input System</p>
            <p className="type-pill soft">{fbm.status}</p>
          </div>
          <div className="meta-links">
            <a className="action" href="/fly-by-mouse">
              Product Page
            </a>
            <a className="action secondary" href="/support">
              Support
            </a>
            <a className="action secondary" href="/contact">
              Contact
            </a>
          </div>

          <div className="detail open">
            {fbm.sections
              .filter(section => section.column !== "side")
              .map(section => (
                <Section key={section.title} section={section} />
              ))}
          </div>
        </div>
      </article>
    </section>
  )
}
