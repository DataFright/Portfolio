import { contacts } from "../content/site.js"

export default function ContactList() {
  return (
    <ul className="contact-list">
      {contacts.map(item => (
        <li key={item.label}>
          <span>{item.label}</span>
          <a
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  )
}
