"use client"
import { useState } from "react"

interface ArtisanActionsProps {
  artisanId: string
  artisanName: string
}

export default function ArtisanActions({ artisanId, artisanName }: ArtisanActionsProps) {
  const [favori, setFavori] = useState(false)
  const [contactDebloque, setContactDebloque] = useState(false)

  const btnPrimary = {
    padding: "var(--space-3) var(--space-6)",
    borderRadius: "var(--radius-lg)",
    border: "none",
    background: "var(--color-primary-500)",
    color: "white",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-semibold)",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    width: "100%",
    marginBottom: "var(--space-3)",
  }

  const btnSecondary = {
    padding: "var(--space-3) var(--space-6)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--color-neutral-300)",
    background: "var(--color-neutral-0)",
    color: "var(--color-neutral-700)",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-medium)",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    width: "100%",
    marginBottom: "var(--space-3)",
  }

  return (
    <div style={{
      background: "var(--color-neutral-0)",
      border: "1px solid var(--color-neutral-200)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-6)",
    }}>
      <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
        Contacter {artisanName}
      </h3>

      <button style={btnPrimary} onClick={() => alert("Redirection vers messagerie...")}>
        💬 Envoyer un message
      </button>

      <button
        style={{ ...btnSecondary, color: favori ? "var(--color-error-600)" : "var(--color-neutral-700)", borderColor: favori ? "var(--color-error-300)" : "var(--color-neutral-300)" }}
        onClick={() => setFavori(!favori)}
      >
        {favori ? "❤️ Retiré des favoris" : "🤍 Ajouter aux favoris"}
      </button>

      {!contactDebloque ? (
        <div>
          <button style={{ ...btnSecondary, background: "var(--color-secondary-50)", borderColor: "var(--color-secondary-300)", color: "var(--color-secondary-700)" }}
            onClick={() => setContactDebloque(true)}>
            🔓 Débloquer les coordonnées
          </button>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-400)", textAlign: "center", margin: 0 }}>
            Coût : 500 FCFA depuis votre portefeuille
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--color-success-50)", border: "1px solid var(--color-success-200)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
          <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-xs)", color: "var(--color-success-700)", fontWeight: "var(--font-semibold)" }}>
            ✓ Coordonnées débloquées
          </p>
          <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-sm)", color: "var(--color-neutral-700)" }}>📞 +229 97 XX XX XX</p>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-700)" }}>📧 artisan@email.com</p>
        </div>
      )}
    </div>
  )
}