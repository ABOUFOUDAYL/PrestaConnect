type Statut = "En attente" | "Ouvert" | "En cours" | "Terminé" | "Annulé"

const config: Record<Statut, { bg: string; color: string; icon: string }> = {
  "En attente": { bg: "var(--color-warning-50)",  color: "var(--color-warning-700)",  icon: "⏳" },
  "Ouvert":     { bg: "var(--color-info-50)",     color: "var(--color-info-700)",     icon: "📬" },
  "En cours":   { bg: "var(--color-primary-50)",  color: "var(--color-primary-700)",  icon: "🔄" },
  "Terminé":    { bg: "var(--color-success-50)",  color: "var(--color-success-700)",  icon: "✅" },
  "Annulé":     { bg: "var(--color-error-50)",    color: "var(--color-error-700)",    icon: "❌" },
}

export default function DemandeStatusBadge({ statut }: { statut: Statut }) {
  const c = config[statut]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px", borderRadius: "var(--radius-full)",
      background: c.bg, color: c.color,
      fontSize: "var(--text-xs)", fontWeight: "var(--font-semibold)",
    }}>
      {c.icon} {statut}
    </span>
  )
}