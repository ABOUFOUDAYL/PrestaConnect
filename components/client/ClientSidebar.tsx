"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const links = [
  { href: "/dashboard",     label: "Tableau de bord", icon: "🏠" },
  { href: "/artisans",      label: "Artisans",         icon: "🔨" },
  { href: "/demandes",      label: "Mes demandes",     icon: "📋" },
  { href: "/messages",      label: "Messages",         icon: "💬" },
  { href: "/favoris",       label: "Favoris",          icon: "❤️" },
  { href: "/notifications", label: "Notifications",    icon: "🔔" },
  { href: "/mon-profil",    label: "Mon profil",       icon: "👤" },
]

const mainLinks = links.slice(0, 4)
const moreLinks = links.slice(4)

export default function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")
  const moreActive = moreLinks.some((l) => isActive(l.href))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const linkStyle = (active: boolean) => ({
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
  })

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="client-sidebar-desktop" style={{
        width: "260px",
        minHeight: "100vh",
        background: "var(--color-neutral-0)",
        borderRight: "1px solid var(--color-neutral-200)",
        padding: "var(--space-6) 0",
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
            const active = isActive(href)
            return (
              <Link key={href} href={href} style={linkStyle(active)}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{
          padding: "var(--space-3)",
          borderTop: "1px solid var(--color-neutral-100)",
          marginTop: "var(--space-4)",
        }}>
          <Link href="/parametres-client" style={linkStyle(isActive("/parametres-client"))}>
            <span style={{ fontSize: "1.1rem" }}>⚙️</span>
            Paramètres
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-regular)",
              color: "#e63946",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left" as const,
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Barre de navigation — mobile */}
      <nav className="client-bottom-nav" style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "space-around",
        background: "var(--color-neutral-0)",
        borderTop: "1px solid var(--color-neutral-200)",
        padding: "var(--space-2) 0",
        zIndex: 50,
      }}>
        {mainLinks.map(({ href, label, icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} onClick={() => setMoreOpen(false)} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              flex: 1,
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: active ? "var(--font-semibold)" : "var(--font-regular)",
              color: active ? "var(--color-primary-600)" : "var(--color-neutral-600)",
            }}>
              <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              {label.split(" ")[0]}
            </Link>
          )
        })}

        <button onClick={() => setMoreOpen((v) => !v)} style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          flex: 1,
          background: "none",
          border: "none",
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          fontWeight: moreActive ? "var(--font-semibold)" : "var(--font-regular)",
          color: moreActive || moreOpen ? "var(--color-primary-600)" : "var(--color-neutral-600)",
          cursor: "pointer",
        }}>
          <span style={{ fontSize: "1.2rem" }}>⋯</span>
          Plus
        </button>
      </nav>

      {/* Panneau "Plus" — mobile */}
      {moreOpen && (
        <div className="client-bottom-nav" style={{
          position: "fixed",
          bottom: "64px",
          right: "var(--space-3)",
          flexDirection: "column",
          background: "var(--color-neutral-0)",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.10)",
          padding: "var(--space-2)",
          minWidth: "180px",
          zIndex: 51,
        }}>
          {moreLinks.map(({ href, label, icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} onClick={() => setMoreOpen(false)} style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-lg)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                fontWeight: active ? "var(--font-semibold)" : "var(--font-regular)",
                color: active ? "var(--color-primary-600)" : "var(--color-neutral-600)",
                background: active ? "var(--color-primary-50)" : "transparent",
                textDecoration: "none",
              }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                {label}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "#e63946",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left" as const,
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🚪</span>
            Déconnexion
          </button>
        </div>
      )}
    </>
  )
}