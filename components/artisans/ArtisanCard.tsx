import Link from "next/link"
import { User, CheckCircle2, MapPin, Star } from "lucide-react"

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

function StarRating({ note, size = 13 }: { note: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(note) ? "var(--color-secondary-500)" : "none"}
          color="var(--color-secondary-500)"
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function Avatar({ photo, size }: { photo?: string; size: number }) {
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: "var(--radius-full)",
      background: "var(--color-primary-100)", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden",
    }}>
      {photo ? (
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <User size={size * 0.45} style={{ color: "var(--color-primary-500)" }} strokeWidth={1.5} />
      )}
    </div>
  )
}

export default function ArtisanCard({ artisan, view = "grid" }: ArtisanCardProps) {
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
          <Avatar photo={artisan.photo} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
                {artisan.name}
              </h3>
              {artisan.verifie && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "var(--text-xs)", background: "var(--color-success-50)", color: "var(--color-success-700)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
                  <CheckCircle2 size={11} /> Vérifié
                </span>
              )}
            </div>
            <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-sm)", color: "var(--color-primary-600)", fontWeight: "var(--font-medium)" }}>
              {artisan.metier}
            </p>
            <p style={{ display: "flex", alignItems: "center", gap: "4px", margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-500)" }}>
              <MapPin size={12} /> {artisan.ville}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <StarRating note={artisan.note} />
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
          <Avatar photo={artisan.photo} size={56} />
          {artisan.verifie && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "var(--text-xs)", background: "var(--color-success-50)", color: "var(--color-success-700)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
              <CheckCircle2 size={11} /> Vérifié
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
          <p style={{ display: "flex", alignItems: "center", gap: "4px", margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-500)" }}>
            <MapPin size={12} /> {artisan.ville}
          </p>
        </div>
        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-600)", lineHeight: "var(--leading-relaxed)", flex: 1 }}>
          {artisan.description
            ? artisan.description.length > 80
              ? `${artisan.description.slice(0, 80)}...`
              : artisan.description
            : "Aucune description disponible."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
          {artisan.categories.slice(0, 2).map((cat) => (
            <span key={cat} style={{ fontSize: "var(--text-xs)", background: "var(--color-primary-50)", color: "var(--color-primary-700)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
              {cat}
            </span>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--color-neutral-100)", paddingTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <StarRating note={artisan.note} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>{artisan.note}/5 ({artisan.avis} avis)</span>
        </div>
      </div>
    </Link>
  )
}