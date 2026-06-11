"use client"
import FavorisCard from "./FavorisCard"
import { Artisan } from "@/components/artisans/ArtisanCard"
import Link from "next/link"

interface FavorisGridProps {
  artisans: Artisan[]
  onRetirer: (id: string) => void
}

export default function FavorisGrid({ artisans, onRetirer }: FavorisGridProps) {
  if (artisans.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-16) 0", color: "var(--color-neutral-400)" }}>
        <p style={{ fontSize: "3rem" }}>🤍</p>
        <p style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
          Vous n'avez pas encore de favoris
        </p>
        <Link href="/artisans" style={{
          padding: "var(--space-3) var(--space-6)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-primary-500)",
          color: "white",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-semibold)",
          textDecoration: "none",
        }}>
          Découvrir des artisans →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {artisans.map((artisan) => (
        <FavorisCard key={artisan.id} artisan={artisan} onRetirer={onRetirer} />
      ))}
    </div>
  )
}