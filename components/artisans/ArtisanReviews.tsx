import { Star } from "lucide-react"

interface Review {
  id: string
  auteur: string
  note: number
  commentaire: string
  date: string
}

interface ArtisanReviewsProps {
  reviews: Review[]
  noteMoyenne: number
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

export default function ArtisanReviews({ reviews, noteMoyenne }: ArtisanReviewsProps) {
  return (
    <div style={{
      background: "var(--color-neutral-0)",
      border: "1px solid var(--color-neutral-200)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-6)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
          Avis clients
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <StarRating note={noteMoyenne} size={16} />
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-800)" }}>
            {noteMoyenne}/5
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>
            ({reviews.length} avis)
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-500)", textAlign: "center", padding: "var(--space-4) 0" }}>
          Aucun avis pour le moment.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {reviews.map((review) => (
            <div key={review.id} style={{
              borderBottom: "1px solid var(--color-neutral-100)",
              paddingBottom: "var(--space-4)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "var(--radius-full)",
                    background: "var(--color-primary-100)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-xs)", fontWeight: "var(--font-bold)", color: "var(--color-primary-700)",
                  }}>
                    {review.auteur.charAt(0)}
                  </div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", color: "var(--color-neutral-800)" }}>
                    {review.auteur}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StarRating note={review.note} size={11} />
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>{review.date}</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-600)", lineHeight: "var(--leading-relaxed)" }}>
                {review.commentaire}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}