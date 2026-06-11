import Link from "next/link"

export interface Artisan {
  id: string
  name: string
  metier: string
  ville: string
  note: number
  avis: number
  verifie: boolean
  photo?: string
  description: string
  categories: string[]
}

interface ArtisanCardProps {
  artisan: Artisan
  view?: "grid" | "list"
}

export default function ArtisanCard({ artisan, view = "grid" }: ArtisanCardProps) {
  const stars = "★".repeat(Math.round(artisan.note)) + "☆".repeat(5 - Math.round(artisan.note))

  if (view === "list") {
    return (
      <Link href={`/artisans/${artisan.id}`} style={{ textDecoration: "none" }}>
        <div style={{
          background: "var(--color-neutral-0)",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-5)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-5)",
          transition: "var(--transition-fast)",
          cursor: "pointer",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "var(--radius-full)",
            background: "var(--color-primary-100)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", flexShrink: 0,
          }}>
            {artisan.photo || "👷"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
                {artisan.name}
              </h3>
              {artisan.verifie && (
                <span style={{ fontSize: "var(--text-xs)", background: "var(--color-success-50)", color: "var(--color-success-700)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
                  ✓ Vérifié
                </span>
              )}
            </div>
            <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-sm)", color: "var(--color-primary-600)", fontWeight: "var(--font-medium)" }}>
              {artisan.metier}
            </p>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-500)" }}>
              📍 {artisan.ville}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ color: "var(--color-secondary-500)", fontSize: "var(--text-sm)" }}>{stars}</div>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>
              {artisan.note}/5 ({artisan.avis} avis)
            </p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/artisans/${artisan.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--color-neutral-0)",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        display: "flex", flexDirection: "column", gap: "var(--space-3)",
        transition: "var(--transition-fast)", cursor: "pointer", height: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "var(--radius-full)",
            background: "var(--color-primary-100)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
          }}>
            {artisan.photo || "👷"}
          </div>
          {artisan.verifie && (
            <span style={{ fontSize: "var(--text-xs)", background: "var(--color-success-50)", color: "var(--color-success-700)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
              ✓ Vérifié
            </span>
          )}
        </div>
        <div>
          <h3 style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
            {artisan.name}
          </h3>
          <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-sm)", color: "var(--color-primary-600)", fontWeight: "var(--font-medium)" }}>
            {artisan.metier}
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-500)" }}>📍 {artisan.ville}</p>
        </div>
        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-600)", lineHeight: "var(--leading-relaxed)", flex: 1 }}>
          {artisan.description.slice(0, 80)}...
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
          {artisan.categories.slice(0, 2).map((cat) => (
            <span key={cat} style={{ fontSize: "var(--text-xs)", background: "var(--color-primary-50)", color: "var(--color-primary-700)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
              {cat}
            </span>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--color-neutral-100)", paddingTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--color-secondary-500)", fontSize: "var(--text-sm)" }}>{stars}</div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>{artisan.note}/5 ({artisan.avis} avis)</span>
        </div>
      </div>
    </Link>
  )
}