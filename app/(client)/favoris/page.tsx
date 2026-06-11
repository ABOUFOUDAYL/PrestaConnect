"use client"
import { useState } from "react"
import FavorisGrid from "@/components/favoris/FavorisGrid"
import { Artisan } from "@/components/artisans/ArtisanCard"

const FAVORIS_INITIAUX: Artisan[] = [
  { id: "1", name: "Jean Kouassi", metier: "Plombier", ville: "Cotonou", note: 4.8, avis: 32, verifie: true, description: "Plombier expérimenté spécialisé dans les installations sanitaires.", categories: ["Plomberie"] },
  { id: "4", name: "Afi Togbe", metier: "Peintre", ville: "Cotonou", note: 4.9, avis: 27, verifie: true, description: "Peintre professionnelle spécialisée en décoration intérieure.", categories: ["Peinture"] },
  { id: "6", name: "Sèna Kpodo", metier: "Climatiseur", ville: "Cotonou", note: 4.7, avis: 21, verifie: true, description: "Technicien climatisation pour installation et entretien.", categories: ["Climatisation"] },
]

export default function FavorisPage() {
  const [favoris, setFavoris] = useState<Artisan[]>(FAVORIS_INITIAUX)

  const handleRetirer = (id: string) => {
    setFavoris((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", fontFamily: "var(--font-display)", color: "var(--color-neutral-900)", margin: "0 0 var(--space-1)" }}>
          Mes favoris
        </h1>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-500)" }}>
          {favoris.length} artisan{favoris.length > 1 ? "s" : ""} sauvegardé{favoris.length > 1 ? "s" : ""}
        </p>
      </div>

      <FavorisGrid artisans={favoris} onRetirer={handleRetirer} />
    </div>
  )
}