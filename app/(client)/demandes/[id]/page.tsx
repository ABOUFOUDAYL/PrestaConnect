import Link from "next/link"
import DemandeStatusBadge from "@/components/demandes/DemandeStatusBadge"

const DEMANDES: Record<string, any> = {
  "1": { id: "1", titre: "Plombier urgence - fuite cuisine", description: "J'ai une fuite sous mon évier de cuisine qui s'aggrave. Besoin d'une intervention rapide pour réparer la canalisation et vérifier les joints.", categorie: "Plomberie", ville: "Cotonou", statut: "En cours", dateCreation: "Aujourd'hui", devisCount: 3,
    devis: [
      { id: "d1", artisan: "Jean Kouassi", montant: "15 000 FCFA", delai: "2h", note: 4.8, message: "Je peux intervenir dans l'heure. Matériaux inclus." },
      { id: "d2", artisan: "Kofi Mensah", montant: "12 000 FCFA", delai: "3h", note: 4.2, message: "Disponible aujourd'hui après-midi." },
      { id: "d3", artisan: "Sèna Kpodo", montant: "18 000 FCFA", delai: "1h", note: 4.7, message: "Intervention express possible immédiatement." },
    ]
  },
}

export default function DemandeDetailPage({ params }: { params: { id: string } }) {
  const demande = DEMANDES[params.id]

  if (!demande) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-16) 0" }}>
        <p style={{ fontSize: "3rem" }}>📋</p>
        <h1 style={{ color: "var(--color-neutral-700)" }}>Demande introuvable</h1>
        <Link href="/demandes" style={{ color: "var(--color-primary-500)" }}>← Retour aux demandes</Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/demandes" style={{ fontSize: "var(--text-sm)", color: "var(--color-primary-500)", textDecoration: "none" }}>
          ← Retour aux demandes
        </Link>
      </div>

      <div style={{ background: "var(--color-neutral-0)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: "var(--font-bold)", fontFamily: "var(--font-display)", color: "var(--color-neutral-900)" }}>
            {demande.titre}
          </h1>
          <DemandeStatusBadge statut={demande.statut} />
        </div>
        <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", color: "var(--color-neutral-500)" }}>
          📍 {demande.ville} · 🗂️ {demande.categorie} · 📅 {demande.dateCreation}
        </p>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-700)", lineHeight: "var(--leading-relaxed)" }}>
          {demande.description}
        </p>
      </div>

      <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)", margin: "0 0 var(--space-4)" }}>
        Devis reçus ({demande.devis.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {demande.devis.map((d: any) => (
          <div key={d.id} style={{ background: "var(--color-neutral-0)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
              <div>
                <h3 style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
                  {d.artisan}
                </h3>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-secondary-600)" }}>
                  {"★".repeat(Math.round(d.note))} {d.note}/5
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 2px", fontSize: "var(--text-lg)", fontWeight: "var(--font-bold)", color: "var(--color-primary-600)" }}>{d.montant}</p>
                <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>⏱ Délai : {d.delai}</p>
              </div>
            </div>
            <p style={{ margin: "0 0 var(--space-4)", fontSize: "var(--text-sm)", color: "var(--color-neutral-600)" }}>{d.message}</p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button style={{ padding: "var(--space-2) var(--space-5)", borderRadius: "var(--radius-lg)", border: "none", background: "var(--color-primary-500)", color: "white", fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", cursor: "pointer" }}>
                ✓ Accepter
              </button>
              <Link href="/messages" style={{ padding: "var(--space-2) var(--space-5)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-0)", color: "var(--color-neutral-700)", fontSize: "var(--text-sm)", textDecoration: "none" }}>
                💬 Contacter
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}