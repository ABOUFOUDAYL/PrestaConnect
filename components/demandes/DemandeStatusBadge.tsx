import { LucideIcon, Clock, Inbox, RefreshCw, CheckCircle2, XCircle } from "lucide-react"

type Statut = "En attente" | "Ouvert" | "En cours" | "Terminé" | "Annulé"

const config: Record<Statut, { bg: string; color: string; icon: LucideIcon }> = {
  "En attente": { bg: "var(--color-warning-50)",  color: "var(--color-warning-700)",  icon: Clock },
  "Ouvert":     { bg: "var(--color-info-50)",     color: "var(--color-info-700)",     icon: Inbox },
  "En cours":   { bg: "var(--color-primary-50)",  color: "var(--color-primary-700)",  icon: RefreshCw },
  "Terminé":    { bg: "var(--color-success-50)",  color: "var(--color-success-700)",  icon: CheckCircle2 },
  "Annulé":     { bg: "var(--color-error-50)",    color: "var(--color-error-700)",    icon: XCircle },
}

export default function DemandeStatusBadge({ statut }: { statut: Statut }) {
  const c = config[statut]
  const Icon = c.icon
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px", borderRadius: "var(--radius-full)",
      background: c.bg, color: c.color,
      fontSize: "var(--text-xs)", fontWeight: "var(--font-semibold)",
    }}>
      <Icon size={12} strokeWidth={2} /> {statut}
    </span>
  )
}