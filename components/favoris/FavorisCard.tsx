"use client"
import Link from "next/link"
import { Artisan } from "@/components/artisans/ArtisanCard"
import { User, CheckCircle2, MapPin, Star, Heart } from "lucide-react"

interface FavorisCardProps {
  artisan: Artisan
  onRetirer: (id: string) => void
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

export default function FavorisCard({ artisan, onRetirer }: FavorisCardProps) {
  return (
    <div style={{
      background: "var(--color-neutral-0)",
      border: "1px solid var(--color-neutral-200)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-5)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
    }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "var(--radius-full)",
        background: "var(--color-primary-100)", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexShrink: 0, overflow: "hidden",
      }}>
        {artisan.photo ? (
          <img src={artisan.photo} alt={artisan.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <User size={26} style={{ color: "var(--color-primary-500)" }} strokeWidth={1.5} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <p style={{ display: "flex", alignItems: "center", gap: "4px", margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-500)" }}>
            <MapPin size={12} /> {artisan.ville}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <StarRating note={artisan.note} />
            <span style={{ color: "var(--color-neutral-500)", fontSize: "var(--text-xs)" }}>{artisan.note}/5</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flexShrink: 0 }}>
        <Link href={`/artisans/${artisan.id}`} style={{
          padding: "var(--space-2) var(--space-4)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-primary-300)",
          background: "var(--color-primary-50)",
          color: "var(--color-primary-700)",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--font-medium)",
          textDecoration: "none",
          textAlign: "center" as const,
        }}>
          Voir profil
        </Link>
        <button onClick={() => onRetirer(artisan.id)} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "var(--space-2) var(--space-4)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-error-300)",
          background: "var(--color-error-50)",
          color: "var(--color-error-700)",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--font-medium)",
          cursor: "pointer",
        }}>
          <Heart size={13} fill="var(--color-error-700)" /> Retirer
        </button>
      </div>
    </div>
  )
}