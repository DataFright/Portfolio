// Site-wide facts used by more than one page. Change a value here and every
// page that shows it follows.

export const SITE = {
  owner: "Matthew Swaney",
  brand: "DataFright",
  email: "matthew.j.swaney@gmail.com",
  replyWindow: "3 business days",
}

export const contacts = [
  { label: "Phone", text: "816 944 7474", href: "tel:+18169447474" },
  { label: "Email", text: SITE.email, href: `mailto:${SITE.email}` },
  {
    label: "LinkedIn",
    text: "matthew-swaney82",
    href: "https://www.linkedin.com/in/matthew-swaney82",
    external: true,
  },
  {
    label: "GitHub",
    text: "github.com/DataFright",
    href: "https://github.com/DataFright",
    external: true,
  },
]

// The sheet index shown under every page title. Each entry is a real URL (see
// src/routes.jsx and vercel.json), so it is also what the Unity Asset Store
// publisher profile links to.
export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/fly-by-mouse", label: "Fly By Mouse" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
]
