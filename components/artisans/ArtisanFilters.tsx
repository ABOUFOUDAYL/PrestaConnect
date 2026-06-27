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

const METIERS_BENIN = [
  "Plombier", "Électricien", "Maçon", "Menuisier", "Charpentier", "Peintre",
  "Carreleur", "Climatiseur", "Soudeur", "Mécanicien", "Serrurier", "Vitrier",
  "Couvreur", "Jardinier", "Électroménagiste", "Ferrailleur", "Poseur de faux plafond",
  "Technicien en informatique", "Plâtrier", "Démolisseur", "Excavateur",
  "Électricien automobile", "Carrossier", "Vulcanisateur", "Tapissier",
  "Cuisiniste", "Installateur de panneaux solaires", "Fontainier", "Paysagiste",
  "Décorateur d'intérieur", "Réparateur d'électroménager", "Photographe",
  "Vidéaste", "Imprimeur", "Tailleur", "Coiffeur", "Esthéticienne",
  "Tôlier", "Carreleur", "Poseur de parquet", "Installateur de portes et fenêtres",
  "Technicien en alarme et sécurité", "Réparateur de téléphones",
]

const VILLES_BENIN = [
  "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Bohicon", "Natitingou",
  "Abomey", "Kandi", "Lokossa", "Ouidah", "Djougou", "Savalou", "Nikki",
  "Malanville", "Banikoara", "Tchaourou", "Dassa-Zoumé", "Comè", "Pobè",
  "Aplahoué", "Dogbo", "Bembèrèkè", "Ndali", "Péhunco", "Kétou", "Sakété",
  "Covè", "Zagnanado", "Zogbodomey", "Adja-Ouèrè", "Ifangni", "Dangbo",
  "Aguégués", "Sèmè-Podji", "Calavi", "Abomey-Calavi", "Toffo", "Tori-Bossito",
  "Allada", "Kpomassè", "Ouidah", "Zè", "Mono", "Athiémé", "Bopa", "Grand-Popo",
  "Houéyogbé", "Toviklin", "Djakotomey", "Klouékanmè", "Lalo",
]

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

  const labelStyle = {
    fontSize: "var(--text-xs)",
    color: "var(--color-neutral-500)",
    display: "block",
    marginBottom: "var(--space-1)",
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

      {/* Recherche libre */}
      <input
        type="text"
        placeholder="🔍 Rechercher un artisan, un métier..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        style={{ ...inputStyle, fontSize: "var(--text-base)" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>

        {/* Métier — saisie libre avec suggestions */}
        <div>
          <label style={labelStyle}>Métier</label>
          <input
            type="text"
            list="metiers-list"
            placeholder="Ex: Plombier, Maçon..."
            value={filters.metier === "Tous" ? "" : filters.metier}
            onChange={(e) => update("metier", e.target.value || "Tous")}
            style={inputStyle}
          />
          <datalist id="metiers-list">
            {METIERS_BENIN.map((m) => <option key={m} value={m} />)}
          </datalist>
        </div>

        {/* Ville — saisie libre avec suggestions */}
        <div>
          <label style={labelStyle}>Ville</label>
          <input
            type="text"
            list="villes-list"
            placeholder="Ex: Cotonou, Parakou..."
            value={filters.ville === "Toutes" ? "" : filters.ville}
            onChange={(e) => update("ville", e.target.value || "Toutes")}
            style={inputStyle}
          />
          <datalist id="villes-list">
            {VILLES_BENIN.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>

        {/* Note minimum */}
        <div>
          <label style={labelStyle}>Note minimum</label>
          <select
            value={filters.noteMin}
            onChange={(e) => update("noteMin", Number(e.target.value))}
            style={inputStyle}
          >
            {[0,1,2,3,4,5].map((n) => (
              <option key={n} value={n}>{n === 0 ? "Toutes les notes" : `${n}★ et +`}</option>
            ))}
          </select>
        </div>

        {/* Bouton réinitialiser */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => onChange({
              search: "", metier: "Tous", ville: "Toutes",
              categorie: "Toutes", noteMin: 0, verifieOnly: false,
            })}
            style={{
              ...inputStyle,
              background: "var(--color-neutral-100)",
              cursor: "pointer",
              color: "var(--color-neutral-600)",
              textAlign: "center" as const,
            }}
          >
            🔄 Réinitialiser
          </button>
        </div>
      </div>

      {/* Artisans vérifiés */}
      <label style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        color: "var(--color-neutral-700)",
      }}>
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