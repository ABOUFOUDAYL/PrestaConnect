import { Artisan } from "./ArtisanCard"

interface ArtisanProfileProps {
  artisan: Artisan & {
    competences: string[]
    experience: string
    badges: string[]
  }
}

export default function ArtisanProfile({ artisan }: ArtisanProfileProps) {
  return (
    <div style={{
      background: "var(--color-neutral-0)",
      border: "1px solid var(--color-neutral-200)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-6)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "var(--radius-full)",
          background: "var(--color-primary-100)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "2.5rem", flexShrink: 0,
        }}>
          {artisan.photo || "👷"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-1)" }}>
            <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", fontFamily: "var(--font-display)", color: "var(--color-neutral-900)" }}>
              {artisan.name}
            </h1>
            {artisan.verifie && (
              <span style={{ fontSize: "var(--text-xs)", background: "var(--color-success-50)", color: "var(--color-success-700)", padding: "3px 10px", borderRadius: "var(--radius-full)", fontWeight: "var(--font-semibold)" }}>
                ✓ Vérifié
              </span>
            )}
          </div>
          <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-base)", color: "var(--color-primary-600)", fontWeight: "var(--font-medium)" }}>
            {artisan.metier}
          </p>
          <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", color: "var(--color-neutral-500)" }}>
            📍 {artisan.ville}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ color: "var(--color-secondary-500)" }}>{"★".repeat(Math.round(artisan.note))}{"☆".repeat(5 - Math.round(artisan.note))}</span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-neutral-600)" }}>{artisan.note}/5 ({artisan.avis} avis)</span>
          </div>
        </div>
      </div>

      {artisan.badges.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-5)" }}>
          {artisan.badges.map((badge) => (
            <span key={badge} style={{ fontSize: "var(--text-xs)", background: "var(--color-secondary-50)", color: "var(--color-secondary-800)", padding: "4px 12px", borderRadius: "var(--radius-full)", fontWeight: "var(--font-medium)" }}>
              {badge}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-700)", margin: "0 0 var(--space-2)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>
          Description
        </h2>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-600)", lineHeight: "var(--leading-relaxed)" }}>
          {artisan.description}
        </p>
      </div>

      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-700)", margin: "0 0 var(--space-3)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>
          Expérience
        </h2>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-600)" }}>{artisan.experience}</p>
      </div>

      <div>
        <h2 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-700)", margin: "0 0 var(--space-3)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>
          Compétences
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {artisan.competences.map((comp) => (
            <span key={comp} style={{ fontSize: "var(--text-xs)", background: "var(--color-primary-50)", color: "var(--color-primary-700)", padding: "4px 12px", borderRadius: "var(--radius-full)" }}>
              {comp}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}