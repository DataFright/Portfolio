import React from "react"
import { createRoot } from "react-dom/client"
import { initBlueprint } from "./blueprint.js"
import { trackPageView } from "./tracking/visitorTracker.js"
import { resolveRoute } from "./routes.jsx"
import "../styles.css"

// Run before React renders so CSS vars are set on first paint
initBlueprint()
trackPageView()

const Page = resolveRoute(window.location.pathname)

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
)
