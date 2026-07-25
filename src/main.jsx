import React from "react"
import { createRoot } from "react-dom/client"
import { initBlueprint } from "./blueprint.js"
import { trackPageView } from "./tracking/visitorTracker.js"
import App from "./App"
import "../styles.css"

// Run before React renders so CSS vars are set on first paint
initBlueprint()
trackPageView()

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
