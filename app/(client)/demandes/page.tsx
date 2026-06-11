"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import DemandeCard, { Demande } from "@/components/demandes/DemandeCard"
import DemandeFilters, { DemandeFilterState } from "@/components/demandes/DemandeFilters"

const DEMANDES_INITIALES: Demande[] = [
  { id: "1", titre: "Plombier urgence - fuite cuisine", description: "J'ai une fuite sous mon évier de cuisine qui s'aggrave. Besoin d'une intervention rapide pour réparer la canalisation et vérifier les joints.", categorie: "Plomberie", ville: "Cotonou", statut: "En cours", dateCreation: "Aujourd'hui", devisCount: 3 },
  { id: "2", titre: "Installation prise électrique extérieure", description: "Je souhaite installer 2 prises électriques étanches dans mon jardin pour alimenter des équipements extérieurs.", categorie: "Électricité", ville: "Cotonou", statut: "Ouvert", dateCreation: "Hier", devisCount: 1 },
  { id: "3", titre: "Peinture salon et chambre", description: "Besoin de repeindre mon salon (30m²) et ma chambre principale (20m²). Murs et plafonds. Fourniture de la peinture incluse.", categorie: "Peinture", ville: "Porto-Novo", statut: "En attente", dateCreation: "Il y a 3 jours", devisCount: 0 },
  { id: "4", titre: "Réparation climatiseur", description: "Mon climatiseur de salon ne refroidit plus correctement. Besoin d'un diagnostic et réparation.", categorie: "Climatisation", ville: "Cotonou", statut: "Terminé", dateCreation: "Il y a 1 semaine", devisCount: 2 },
]

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>(DEMANDES_INITIALES)
  const [filters, setFilters] = useState<DemandeFilterState>({ statut: "Tous", categorie: "Toutes" })

  const filtered = useMemo(() => demandes.filter((d) => {
    if (filters.statut !== "Tous" && d.statut !== filters.statut) return false
    if (filters.categorie !== "Toutes" && d.categorie !== filters.categorie) return false
    return true
  }), [demandes, filters])

  const handleAnnuler = (id: string) => {
    setDemandes((prev) => prev.map((d) => d.id === id ? { ...d, statut: "Annulé" as const } : d))
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
          <p>Aucune demande trouvée</p>
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