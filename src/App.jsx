import { useLayoutEffect } from 'react'
import { snapVertical } from './blueprint.js'

const projects = [
  {
    name: "Groupz",
    url: "https://groupz-seven.vercel.app/",
    trimUrl: "groupz-seven.vercel.app",
    repo: "https://github.com/DataFright/Groupz",
    appType: "SPA",
    type: "Focus Type: SPA with stateless request boundaries",
    status: "Live and fully deployed",
    preview: "https://image.thum.io/get/width/900/noanimate/https://groupz-seven.vercel.app/",
    sections: [
      {
        title: "Concept",
        content:
          "Real-time group location sharing for caravans, road trips, festivals, and meetups. Users create a 6-character room code, share it, and coordinate on a live map without accounts.",
      },
      {
        title: "Utility",
        content:
          "Fast ad hoc coordination tool designed for temporary sessions. It focuses on low-friction entry, quick group creation/join, and clear host controls for ending or managing sessions.",
      },
      {
        title: "Development",
        content:
          "Two-process architecture: React + Vite frontend and Node.js + Express + Socket.IO backend. Frontend runs on port 3000 and proxies websocket traffic to backend on port 3001.",
      },
      {
        title: "Structure",
        list: [
          ["server/src/app.js", "createApp factory with REST + socket handlers"],
          ["server/src/helpers.js", "validation, code generation, member shaping"],
          ["client/src/components", "Home, GroupMap, MemberList, IconPicker"],
          ["docs/", "architecture, protocol, mobile, deployment, benchmarks, scaling"],
        ],
      },
      {
        title: "Testing",
        content:
          "Documented automated coverage includes Server Vitest (171 tests), Client Vitest (89 tests), and Cypress E2E (105 tests across 17 specs), for 365 tracked tests across the stack.",
      },
      {
        title: "Deployment and Ops",
        content:
          "Fully deployed in production: frontend on Vercel (groupz-seven.vercel.app) and backend on Render. Includes Docker workflows, docker smoke checks, metrics endpoint support, and sustained socket load-test scripts.",
      },
    ],
  },
  {
    name: "Screenr",
    url: "https://screenr-iota.vercel.app/",
    trimUrl: "screenr-iota.vercel.app",
    repo: "https://github.com/DataFright/Screenr",
    appType: "PWA-ready",
    type: "Focus Type: modern web app with PWA-ready patterns",
    status: "Live and fully deployed",
    preview: "https://image.thum.io/get/width/900/noanimate/https://screenr-iota.vercel.app/",
    sections: [
      {
        title: "Concept",
        content:
          "AI-assisted resume screening app that grades and ranks candidate resumes against a job title and description, then exports results for hiring review.",
      },
      {
        title: "Utility",
        content:
          "Helps compress initial resume triage by giving multi-criteria scoring and ranked outputs. Public web usage enforces practical limits for consistency and predictable response quality.",
      },
      {
        title: "Development",
        content:
          "Built with Next.js App Router and TypeScript. API routes include health and grading endpoints; grading integrates OpenRouter model access and PDF text extraction pipeline.",
      },
      {
        title: "Structure",
        list: [
          ["src/app/api/grade/route.ts", "core grading endpoint"],
          ["src/app/page.tsx", "upload, grading workflow, result rendering, CSV export"],
          ["cypress/e2e", "end-to-end UI suites and performance batch spec"],
          ["tests/api + tests/load", "shell suites for API, security, and load behavior"],
        ],
      },
      {
        title: "Testing",
        content:
          "README-documented verification includes Cypress E2E (9 specs, 70 tests), API shell suites (13 suites, 118 tests), and load testing (1 suite, 6 tests), with additional long-running performance checks for release gates.",
      },
      {
        title: "Production Readiness",
        content:
          "Fully deployed and publicly live at screenr-iota.vercel.app. Uses standalone production builds and Docker workflows; release verification covers linting, core suites, long-running checks, and report artifact generation.",
      },
    ],
  },
]

const frameworkCards = [
  {
    title: "Focus App Types",
    items: [
      "Stateless: each request is independent with no stored interaction context.",
      "SPA: one-page runtime with dynamic updates and no full page reloads.",
      "PWA: installable web experience with offline capability and native-like behavior.",
    ],
  },
  {
    title: "App Blueprint Framework",
    items: [
      "Problem Statement and Target Users",
      "Elevator Pitch and Core Features",
      "MVP scope and Tech Stack selection",
      "Wireframe and Userflow before implementation",
    ],
  },
  {
    title: "Build Architecture",
    items: [
      "TDD where practical for high-risk logic",
      "Explicit Error Handling and controlled failure paths",
      "Status Code Mapping from domain errors to API responses",
    ],
  },
  {
    title: "Test Discipline",
    items: [
      "Smoke, Unit, Function, Integration, and E2E coverage",
      "Automation and regression checks on every meaningful change",
      "Linting as baseline quality gate",
    ],
  },
  {
    title: "Secure and Deploy",
    items: [
      "Security design as a first-class architecture decision",
      "Rate limiting to protect services and preserve stability",
      "Planned deployment strategy with CI/CD verification",
    ],
  },
  {
    title: "Scale Strategy",
    items: [
      "Load testing before tier upgrades",
      "Scalability planning based on observed bottlenecks",
      "Horizontal scaling through additional service capacity",
    ],
  },
]

function ProjectCard({ project }) {
  return (
    <article className="card reveal">
      <a className="preview-link" href={project.url} target="_blank" rel="noreferrer">
        <img className="preview" src={project.preview} alt={`Preview of ${project.trimUrl}`} loading="lazy" />
      </a>
      <div className="card-body">
        <h2>{project.name}</h2>
        <p className="url">{project.trimUrl}</p>
        <div className="chip-row">
          <p className="type-pill">{project.type}</p>
          <p className="type-pill soft">{project.appType}</p>
          <p className="type-pill soft">{project.status}</p>
        </div>
        <div className="meta-links">
          <a className="action" href={project.url} target="_blank" rel="noreferrer">
            Visit site
          </a>
          <a className="action secondary" href={project.repo} target="_blank" rel="noreferrer">
            View repo
          </a>
        </div>

        <div className="detail open">
          {project.sections.map(section => (
            <div key={section.title}>
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
          ))}
        </div>
      </div>
    </article>
  )
}

function App() {
  useLayoutEffect(() => {
    let resizeFrame = 0

    const resnap = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => {
        snapVertical()
        resizeFrame = 0
      })
    }

    // Snap every section's height to the 24px grid so tops cascade on-grid.
    // useLayoutEffect fires synchronously after DOM paint — ideal for layout measurement.
    snapVertical()
    // Re-snap after fonts finish loading (avoids measuring before web fonts render)
    document.fonts.ready.then(snapVertical)

    window.addEventListener('resize', resnap, { passive: true })

    return () => {
      window.removeEventListener('resize', resnap)
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
    }
  }, [])

  return (
    <main className="page">
      <header className="hero">
        <h1>Matthew Swaney</h1>
        <p className="subhead">
          Self-taught engineer focused on shipping production-ready apps with clear architecture,
          strong testing discipline, and practical delivery from MVP to scale.
        </p>
      </header>

      <section className="intro-grid" aria-label="Profile">
        <article className="intro-card">
          <h2>Matthew Swaney</h2>
          <p className="intro-line">Bentonville, AR, USA</p>
          <p>
            Self-taught programmer with 5+ years of hands-on development and 3 years at Walmart as
            a mid-level engineer on an international team.
          </p>
          <p>
            I design and ship practical web products with strong testing discipline, operational
            guardrails, and a clear path from MVP to scale.
          </p>
        </article>

        <article className="intro-card contact-card">
          <h2>Contact</h2>
          <ul className="contact-list">
            <li>
              <span>Phone</span>
              <a href="tel:+18169447474">816 944 7474</a>
            </li>
            <li>
              <span>Email</span>
              <a href="mailto:matthew.j.swaney@gmail.com">matthew.j.swaney@gmail.com</a>
            </li>
            <li>
              <span>LinkedIn</span>
              <a href="https://www.linkedin.com/in/matthew-swaney82" target="_blank" rel="noreferrer">
                matthew-swaney82
              </a>
            </li>
            <li>
              <span>GitHub</span>
              <a href="https://github.com/DataFright" target="_blank" rel="noreferrer">
                github.com/DataFright
              </a>
            </li>
          </ul>
        </article>
      </section>

      <section className="grid" aria-label="Project list">
        {projects.map(project => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </section>

      <section className="framework" aria-label="Personal methodology">
        <div className="framework-head">
          <p className="eyebrow">Personal Methodology</p>
          <h2>From Idea to Delivery</h2>
          <p>
            A practical framework designed for repeatable execution: define the problem, build only
            the essentials first, test deeply, secure defaults, deploy safely, then scale with data.
          </p>
        </div>

        <div className="framework-grid">
          {frameworkCards.map(card => (
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
    </main>
  )
}

export default App
