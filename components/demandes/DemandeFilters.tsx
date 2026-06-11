"use client"

export interface DemandeFilterState {
  statut: string
  categorie: string
}

interface DemandeFiltersProps {
  filters: DemandeFilterState
  onChange: (f: DemandeFilterState) => void
}

const statuts = ["Tous", "En attente", "Ouvert", "En cours", "Terminé", "Annulé"]
const categories = ["Toutes", "Plomberie", "Électricité", "Maçonnerie", "Menuiserie", "Peinture", "Climatisation"]

export default function DemandeFilters({ filters, onChange }: DemandeFiltersProps) {
  const selectStyle = {
    padding: "var(--space-2) var(--space-3)",
    border: "1px solid var(--color-neutral-300)",
    borderRadius: "var(--radius-lg)",
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-body)",
    background: "var(--color-neutral-0)",
    color: "var(--color-neutral-800)",
  }

  return (
    <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
      <select value={filters.statut} onChange={(e) => onChange({ ...filters, statut: e.target.value })} style={selectStyle}>
        {statuts.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={filters.categorie} onChange={(e) => onChange({ ...filters, categorie: e.target.value })} style={selectStyle}>
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>
    </div>
  )
}