"use client"
import Link from "next/link"
import DemandeStatusBadge from "./DemandeStatusBadge"

export interface Demande {
  id: string
  titre: string
  description: string
  categorie: string
  ville: string
  statut: "En attente" | "Ouvert" | "En cours" | "Terminé" | "Annulé"
  dateCreation: string
  devisCount: number
}

interface DemandeCardProps {
  demande: Demande
  onSupprimer?: (id: string) => void
}

export default function DemandeCard({ demande, onSupprimer }: DemandeCardProps) {
  return (
    <div style={{
      background: "var(--color-neutral-0)",
      border: "1px solid var(--color-neutral-200)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-5)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
              {demande.titre}
            </h3>
            <DemandeStatusBadge statut={demande.statut} />
          </div>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-500)" }}>
            📍 {demande.ville} · 🗂️ {demande.categorie} · 📅 {demande.dateCreation}
          </p>
        </div>
      </div>

      <p style={{ margin: "0 0 var(--space-4)", fontSize: "var(--text-sm)", color: "var(--color-neutral-600)", lineHeight: "var(--leading-relaxed)" }}>
        {demande.description.slice(0, 120)}...
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: "var(--text-xs)", background: "var(--color-primary-50)",
          color: "var(--color-primary-700)", padding: "3px 10px", borderRadius: "var(--radius-full)",
        }}>
          📄 {demande.devisCount} devis reçu{demande.devisCount > 1 ? "s" : ""}
        </span>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link href={`/demandes/${demande.id}`} style={{
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-primary-300)",
            background: "var(--color-primary-50)",
            color: "var(--color-primary-700)",
            fontSize: "var(--text-xs)",
            fontWeight: "var(--font-medium)",
            textDecoration: "none",
          }}>
            Voir détails
          </Link>
          {onSupprimer && demande.statut !== "En cours" && demande.statut !== "Terminé" && (
            <button onClick={() => onSupprimer(demande.id)} style={{
              padding: "var(--space-2) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-error-300)",
              background: "var(--color-error-50)",
              color: "var(--color-error-700)",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-medium)",
              cursor: "pointer",
            }}>
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  )
}