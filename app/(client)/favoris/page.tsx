"use client"
import { useState, useEffect } from "react"
import FavorisGrid from "@/components/favoris/FavorisGrid"
import { Artisan } from "@/components/artisans/ArtisanCard"
import { supabase } from "@/lib/supabase"

export default function FavorisPage() {
  const [favoris, setFavoris] = useState<Artisan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFavoris = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: favData, error: favError } = await supabase
        .from("favoris")
        .select("id, prestataire_id")
        .eq("user_id", user.id)

      if (favError || !favData || favData.length === 0) {
        setFavoris([])
        setIsLoading(false)
        return
      }

      const prestataireIds = favData.map((f) => f.prestataire_id)

      const { data: prestatairesData } = await supabase
        .from("prestataires")
        .select("id, user_id, nom, metier, statut, note_moyenne, nombre_avis, description")
        .in("id", prestataireIds)

      const userIds = (prestatairesData || []).map((p) => p.user_id)

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, ville, photo_url")
        .in("user_id", userIds)

      const profilesMap = new Map((profilesData || []).map((p) => [p.user_id, p]))
      const prestatairesMap = new Map((prestatairesData || []).map((p) => [p.id, p]))

      const formatted: Artisan[] = favData
        .filter((f) => prestatairesMap.has(f.prestataire_id))
        .map((f) => {
          const presta = prestatairesMap.get(f.prestataire_id)!
          const profil = profilesMap.get(presta.user_id)

          return {
            id: presta.id,
            name: presta.nom || "Artisan",
            metier: presta.metier || "Non renseigné",
            ville: profil?.ville || "Non renseignée",
            note: presta.note_moyenne || 0,
            avis: presta.nombre_avis || 0,
            verifie: presta.statut === "approuve",
            description: presta.description || "",
            categories: presta.metier ? [presta.metier] : [],
            photo_url: profil?.photo_url || null,
            favori_id: f.id,
          }
        })

      setFavoris(formatted)
      setIsLoading(false)
    }

    loadFavoris()
  }, [])

  const handleRetirer = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("favoris")
      .delete()
      .eq("prestataire_id", id)
      .eq("user_id", user.id)

    if (!error) {
      setFavoris((prev) => prev.filter((a) => a.id !== id))
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #e63946", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <p style={{ color: "var(--color-neutral-500)", marginTop: "16px" }}>Chargement...</p>
        </div>
      </div>
    )
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

      {favoris.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-16) 0", color: "var(--color-neutral-400)" }}>
          <p style={{ fontSize: "3rem" }}>❤️</p>
          <p>Aucun artisan sauvegardé pour le moment</p>
          <a href="/artisans" style={{ color: "var(--color-primary-500)", fontSize: "var(--text-sm)" }}>
            Découvrir des artisans →
          </a>
        </div>
      ) : (
        <FavorisGrid artisans={favoris} onRetirer={handleRetirer} />
      )}
    </div>
  )
}