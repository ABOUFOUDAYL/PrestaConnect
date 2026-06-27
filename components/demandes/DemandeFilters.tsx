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

const METIERS_BENIN = [
  "Plombier", "Électricien", "Maçon", "Menuisier", "Charpentier", "Peintre",
  "Carreleur", "Climatiseur", "Soudeur", "Mécanicien", "Serrurier", "Vitrier",
  "Couvreur", "Jardinier", "Électroménagiste", "Ferrailleur", "Poseur de faux plafond",
  "Technicien en informatique", "Plâtrier", "Démolisseur", "Excavateur",
  "Électricien automobile", "Carrossier", "Vulcanisateur", "Tapissier",
  "Cuisiniste", "Installateur de panneaux solaires", "Fontainier", "Paysagiste",
  "Décorateur d'intérieur", "Réparateur d'électroménager", "Photographe",
  "Vidéaste", "Imprimeur", "Tailleur", "Coiffeur", "Esthéticienne",
  "Tôlier", "Poseur de parquet", "Installateur de portes et fenêtres",
  "Technicien en alarme et sécurité", "Réparateur de téléphones",
]

export default function DemandeFilters({ filters, onChange }: DemandeFiltersProps) {
  const selectStyle = {
    padding: "var(--space-2) var(--space-3)",
    border: "1px solid var(--color-neutral-300)",
    borderRadius: "var(--radius-lg)",
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-body)",
    background: "var(--color-neutral-0)",
    color: "var(--color-neutral-800)",
    outline: "none",
  }

  const inputStyle = {
    ...selectStyle,
    minWidth: "180px",
  }

  return (
    <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>

      {/* Filtre statut */}
      <select
        value={filters.statut}
        onChange={(e) => onChange({ ...filters, statut: e.target.value })}
        style={selectStyle}
      >
        {statuts.map((s) => <option key={s}>{s}</option>)}
      </select>

      {/* Filtre catégorie — saisie libre avec suggestions */}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          list="categories-list"
          placeholder="Tous les métiers..."
          value={filters.categorie === "Toutes" ? "" : filters.categorie}
          onChange={(e) => onChange({ ...filters, categorie: e.target.value || "Toutes" })}
          style={inputStyle}
        />
        <datalist id="categories-list">
          {METIERS_BENIN.map((m) => <option key={m} value={m} />)}
        </datalist>
      </div>

      {/* Bouton réinitialiser */}
      {(filters.statut !== "Tous" || filters.categorie !== "Toutes") && (
        <button
          onClick={() => onChange({ statut: "Tous", categorie: "Toutes" })}
          style={{
            ...selectStyle,
            cursor: "pointer",
            color: "var(--color-primary-500)",
            border: "1px solid var(--color-primary-200)",
            background: "var(--color-primary-50)",
          }}
        >
          🔄 Réinitialiser
        </button>
      )}
    </div>
  )
}