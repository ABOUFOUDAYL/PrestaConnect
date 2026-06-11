"use client"

export interface Filters {
  search: string
  metier: string
  ville: string
  categorie: string
  noteMin: number
  verifieOnly: boolean
}

interface ArtisanFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const metiers = ["Tous", "Plombier", "Électricien", "Maçon", "Menuisier", "Peintre", "Carreleur", "Climatiseur"]
const villes = ["Toutes", "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Bohicon"]
const categories = ["Toutes", "Bâtiment", "Électricité", "Plomberie", "Menuiserie", "Peinture", "Climatisation"]

export default function ArtisanFilters({ filters, onChange }: ArtisanFiltersProps) {
  const update = (key: keyof Filters, value: string | number | boolean) =>
    onChange({ ...filters, [key]: value })

  const inputStyle = {
    width: "100%",
    padding: "var(--space-2-5) var(--space-3)",
    border: "1px solid var(--color-neutral-300)",
    borderRadius: "var(--radius-lg)",
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-body)",
    color: "var(--color-neutral-800)",
    background: "var(--color-neutral-0)",
    outline: "none",
    boxSizing: "border-box" as const,
  }

  return (
    <div style={{
      background: "var(--color-neutral-0)",
      border: "1px solid var(--color-neutral-200)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
    }}>
      <input
        type="text"
        placeholder="🔍 Rechercher un artisan..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        style={{ ...inputStyle, fontSize: "var(--text-base)" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
        <div>
          <label style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-500)", display: "block", marginBottom: "var(--space-1)" }}>Métier</label>
          <select value={filters.metier} onChange={(e) => update("metier", e.target.value)} style={inputStyle}>
            {metiers.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-500)", display: "block", marginBottom: "var(--space-1)" }}>Ville</label>
          <select value={filters.ville} onChange={(e) => update("ville", e.target.value)} style={inputStyle}>
            {villes.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-500)", display: "block", marginBottom: "var(--space-1)" }}>Catégorie</label>
          <select value={filters.categorie} onChange={(e) => update("categorie", e.target.value)} style={inputStyle}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-500)", display: "block", marginBottom: "var(--space-1)" }}>Note minimum</label>
          <select value={filters.noteMin} onChange={(e) => update("noteMin", Number(e.target.value))} style={inputStyle}>
            {[0,1,2,3,4,5].map((n) => <option key={n} value={n}>{n === 0 ? "Toutes" : `${n}★ et +`}</option>)}
          </select>
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", fontSize: "var(--text-sm)", color: "var(--color-neutral-700)" }}>
        <input
          type="checkbox"
          checked={filters.verifieOnly}
          onChange={(e) => update("verifieOnly", e.target.checked)}
        />
        Artisans vérifiés uniquement ✓
      </label>
    </div>
  )
}