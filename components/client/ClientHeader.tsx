"use client"
import Link from "next/link"

export default function ClientHeader() {
  return (
    <header style={{
      height: "64px",
      background: "var(--color-neutral-0)",
      borderBottom: "1px solid var(--color-neutral-200)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 var(--space-8)",
      position: "sticky",
      top: 0,
      zIndex: "var(--z-sticky)",
    }}>
      <div style={{
        fontSize: "var(--text-sm)",
        color: "var(--color-neutral-500)",
        fontFamily: "var(--font-body)",
      }}>
        Bienvenue 👋
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href="/notifications" style={{
          color: "var(--color-neutral-500)",
          textDecoration: "none",
          fontSize: "1.3rem",
        }}>
          🔔
        </Link>

        <Link href="/profil" style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-full)",
          background: "var(--color-primary-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-semibold)",
          color: "var(--color-primary-700)",
          textDecoration: "none",
        }}>
          U
        </Link>
      </div>
    </header>
  )
}