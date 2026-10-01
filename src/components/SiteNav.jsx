import { navLinks } from "../content/site.js"

// Sheet index: a plain row of real links, so every page is one click from every other.
export default function SiteNav({ current }) {
  return (
    <nav className="site-nav" aria-label="Site">
      {navLinks.map(link => (
        <a
          key={link.href}
          href={link.href}
          aria-current={link.href === current ? "page" : undefined}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
