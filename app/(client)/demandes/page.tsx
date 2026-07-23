"use client"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import DemandeCard, { Demande } from "@/components/demandes/DemandeCard"
import DemandeFilters, { DemandeFilterState } from "@/components/demandes/DemandeFilters"
import { supabase } from "@/lib/supabase"

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<DemandeFilterState>({ statut: "Tous", categorie: "Toutes" })

  useEffect(() => {
    const loadDemandes = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data, error } = await supabase
        .from("demandes")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        const demandeIds = data.map((d: any) => d.id)

        // Comptage des devis par demande (devis_count n'existe pas sur demandes)
        const devisCounts: Record<string, number> = {}
        if (demandeIds.length > 0) {
          const { data: devisData, error: devisError } = await supabase
            .from("devis")
            .select("demande_id")
            .in("demande_id", demandeIds)

          if (devisError) {
            console.error("Erreur récupération devis:", devisError)
          } else if (devisData) {
            for (const row of devisData) {
              devisCounts[row.demande_id] = (devisCounts[row.demande_id] || 0) + 1
            }
          }
        }

        const formatted: Demande[] = data.map((d: any) => ({
          id: d.id,
          titre: d.titre || d.description?.slice(0, 50) || "Demande sans titre",
          description: d.description || "",
          categorie: d.metier_type || "Non renseigné",
          ville: d.ville || "Non renseignée",
          statut: d.status || "Ouvert",
          dateCreation: new Date(d.created_at).toLocaleDateString("fr-FR"),
          devisCount: devisCounts[d.id] || 0,
        }))
        setDemandes(formatted)
      }

      setIsLoading(false)
    }

    loadDemandes()
  }, [])

  const handleAnnuler = async (id: string) => {
    const { error } = await supabase
      .from("demandes")
      .update({ status: "Annulé" })
      .eq("id", id)

    if (!error) {
      setDemandes((prev) => prev.map((d) => d.id === id ? { ...d, statut: "Annulé" as const } : d))
    } else {
      console.error("Erreur annulation demande:", error)
    }
  }

  const filtered = useMemo(() => demandes.filter((d) => {
    if (filters.statut !== "Tous" && d.statut !== filters.statut) return false
    if (filters.categorie !== "Toutes" && d.categorie !== filters.categorie) return false
    return true
  }), [demandes, filters])

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", fontFamily: "var(--font-display)", color: "var(--color-neutral-900)", margin: "0 0 var(--space-1)" }}>
            Mes demandes
          </h1>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-500)" }}>
            {filtered.length} demande{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/devis/nouvelle" style={{
          padding: "var(--space-3) var(--space-5)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-primary-500)",
          color: "white",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-semibold)",
          textDecoration: "none",
        }}>
          + Nouvelle demande
        </Link>
      </div>

      <div style={{ marginBottom: "var(--space-5)" }}>
        <DemandeFilters filters={filters} onChange={setFilters} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-16) 0", color: "var(--color-neutral-400)" }}>
          <p style={{ fontSize: "3rem" }}>📋</p>
          <p>Aucune demande pour le moment</p>
          <Link href="/devis/nouvelle" style={{ color: "var(--color-primary-500)", fontSize: "var(--text-sm)" }}>
            Créer votre première demande →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {filtered.map((d) => <DemandeCard key={d.id} demande={d} onSupprimer={handleAnnuler} />)}
        </div>
      )}
    </div>
  )
}