"use client"
import { useState, useMemo } from "react"
import ArtisanCard, { Artisan } from "@/components/artisans/ArtisanCard"
import ArtisanFilters, { Filters } from "@/components/artisans/ArtisanFilters"

const ARTISANS: Artisan[] = [
  { id: "1", name: "Jean Kouassi", metier: "Plombier", ville: "Cotonou", note: 4.8, avis: 32, verifie: true, description: "Plombier expérimenté spécialisé dans les installations sanitaires et réparations urgentes.", categories: ["Plomberie", "Bâtiment"] },
  { id: "2", name: "Marie Adjobi", metier: "Électricienne", ville: "Porto-Novo", note: 4.5, avis: 18, verifie: true, description: "Électricienne certifiée pour installations résidentielles et dépannages électriques.", categories: ["Électricité"] },
  { id: "3", name: "Kofi Mensah", metier: "Maçon", ville: "Abomey-Calavi", note: 4.2, avis: 45, verifie: false, description: "Maçon qualifié pour constructions, rénovations et travaux de gros œuvre.", categories: ["Bâtiment", "Maçonnerie"] },
  { id: "4", name: "Afi Togbe", metier: "Peintre", ville: "Cotonou", note: 4.9, avis: 27, verifie: true, description: "Peintre professionnelle spécialisée en décoration intérieure et extérieure.", categories: ["Peinture", "Bâtiment"] },
  { id: "5", name: "Brice Hounton", metier: "Menuisier", ville: "Parakou", note: 4.0, avis: 12, verifie: false, description: "Menuisier artisan pour fabrication de meubles sur mesure et aménagements bois.", categories: ["Menuiserie", "Bâtiment"] },
  { id: "6", name: "Sèna Kpodo", metier: "Climatiseur", ville: "Cotonou", note: 4.7, avis: 21, verifie: true, description: "Technicien climatisation pour installation, entretien et dépannage de systèmes HVAC.", categories: ["Climatisation"] },
]

const ITEMS_PAR_PAGE = 4

export default function ArtisansPage() {
  const [filters, setFilters] = useState<Filters>({
    search: "", metier: "Tous", ville: "Toutes",
    categorie: "Toutes", noteMin: 0, verifieOnly: false,
  })
  const [view, setView] = useState<"grid" | "list">("grid")
  const [tri, setTri] = useState("note")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return ARTISANS
      .filter((a) => {
        if (filters.search && !a.name.toLowerCase().includes(filters.search.toLowerCase()) && !a.metier.toLowerCase().includes(filters.search.toLowerCase())) return false
        if (filters.metier !== "Tous" && a.metier !== filters.metier) return false
        if (filters.ville !== "Toutes" && a.ville !== filters.ville) return false
        if (filters.categorie !== "Toutes" && !a.categories.includes(filters.categorie)) return false
        if (a.note < filters.noteMin) return false
        if (filters.verifieOnly && !a.verifie) return false
        return true
      })
      .sort((a, b) => {
        if (tri === "note") return b.note - a.note
        if (tri === "avis") return b.avis - a.avis
        return a.name.localeCompare(b.name)
      })
  }, [filters, tri])

  const totalPages = Math.ceil(filtered.length / ITEMS_PAR_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PAR_PAGE, page * ITEMS_PAR_PAGE)

  const btnStyle = (active: boolean) => ({
    padding: "var(--space-2) var(--space-4)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--color-neutral-300)",
    background: active ? "var(--color-primary-500)" : "var(--color-neutral-0)",
    color: active ? "white" : "var(--color-neutral-700)",
    cursor: "pointer",
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-body)",
  })

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", fontFamily: "var(--font-display)", color: "var(--color-neutral-900)", margin: "0 0 var(--space-1)" }}>
          Rechercher un artisan
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "var(--text-sm)", margin: 0 }}>
          {filtered.length} artisan{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      <ArtisanFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1) }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "var(--space-6) 0 var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button onClick={() => setView("grid")} style={btnStyle(view === "grid")}>⊞ Grille</button>
          <button onClick={() => setView("list")} style={btnStyle(view === "list")}>☰ Liste</button>
        </div>
        <select value={tri} onChange={(e) => setTri(e.target.value)} style={{
          padding: "var(--space-2) var(--space-3)",
          border: "1px solid var(--color-neutral-300)",
          borderRadius: "var(--radius-lg)",
          fontSize: "var(--text-sm)",
          fontFamily: "var(--font-body)",
          background: "var(--color-neutral-0)",
        }}>
          <option value="note">Trier par note</option>
          <option value="avis">Trier par avis</option>
          <option value="nom">Trier par nom</option>
        </select>
      </div>

      {paginated.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-16) 0", color: "var(--color-neutral-400)" }}>
          <p style={{ fontSize: "2rem" }}>🔍</p>
          <p>Aucun artisan trouvé avec ces critères</p>
        </div>
      ) : (
        <div style={{
          display: view === "grid" ? "grid" : "flex",
          gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(260px, 1fr))" : undefined,
          flexDirection: view === "list" ? "column" : undefined,
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}>
          {paginated.map((a) => <ArtisanCard key={a.id} artisan={a} view={view} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-2)" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={btnStyle(false)}>← Précédent</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i+1} onClick={() => setPage(i+1)} style={btnStyle(page === i+1)}>{i+1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={btnStyle(false)}>Suivant →</button>
        </div>
      )}
    </div>
  )
}