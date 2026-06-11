"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/dashboard",     label: "Tableau de bord", icon: "🏠" },
  { href: "/artisans",      label: "Artisans",         icon: "🔨" },
  { href: "/demandes",      label: "Mes demandes",     icon: "📋" },
  { href: "/messages",      label: "Messages",         icon: "💬" },
  { href: "/favoris",       label: "Favoris",          icon: "❤️" },
  { href: "/notifications", label: "Notifications",    icon: "🔔" },
]

export default function ClientSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: "260px",
      minHeight: "100vh",
      background: "var(--color-neutral-0)",
      borderRight: "1px solid var(--color-neutral-200)",
      padding: "var(--space-6) 0",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
    }}>
      <div style={{
        padding: "0 var(--space-6) var(--space-6)",
        borderBottom: "1px solid var(--color-neutral-100)",
        marginBottom: "var(--space-4)",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          fontWeight: "var(--font-bold)",
          color: "var(--color-primary-500)",
        }}>
          Presta<span style={{ color: "var(--color-secondary-500)" }}>Connect</span>
        </span>
      </div>

      <nav style={{ flex: 1, padding: "0 var(--space-3)" }}>
        {links.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "var(--space-1)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: active ? "var(--font-semibold)" : "var(--font-regular)",
              color: active ? "var(--color-primary-600)" : "var(--color-neutral-600)",
              background: active ? "var(--color-primary-50)" : "transparent",
              textDecoration: "none",
              transition: "var(--transition-fast)",
            }}>
              <span style={{ fontSize: "1.1rem" }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}