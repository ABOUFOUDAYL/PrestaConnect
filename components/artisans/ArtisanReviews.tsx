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
            <span style={{ color: "var(--color-secondary-500)", fontSize: "var(--text-lg)" }}>
              {"★".repeat(Math.round(noteMoyenne))}{"☆".repeat(5 - Math.round(noteMoyenne))}
            </span>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-800)" }}>
              {noteMoyenne}/5
            </span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>
              ({reviews.length} avis)
            </span>
          </div>
        </div>
  
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
                  <div style={{ color: "var(--color-secondary-500)", fontSize: "var(--text-xs)" }}>
                    {"★".repeat(review.note)}{"☆".repeat(5 - review.note)}
                  </div>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-neutral-400)" }}>{review.date}</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-600)", lineHeight: "var(--leading-relaxed)" }}>
                {review.commentaire}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }