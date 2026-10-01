import App from "./App.jsx"
import FlyByMousePage from "./pages/FlyByMousePage.jsx"
import SupportPage from "./pages/SupportPage.jsx"
import ContactPage from "./pages/ContactPage.jsx"
import PrivacyPage from "./pages/PrivacyPage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"

// One real URL per sheet. Every link between sheets is a plain <a href>, so each
// navigation is a normal page load: the blueprint engine, the vertical snap and the
// visit tracker all start fresh. Production serves index.html for these paths via
// vercel.json (keep the two lists in step); anything else is a real 404 there.
const routes = {
  "/": App,
  "/fly-by-mouse": FlyByMousePage,
  "/support": SupportPage,
  "/contact": ContactPage,
  "/privacy": PrivacyPage,
}

export function resolveRoute(pathname) {
  const clean = pathname.replace(/\/+$/, "").toLowerCase() || "/"
  return routes[clean] || NotFoundPage
}
