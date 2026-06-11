interface ArtisanGalleryProps {
    photos: string[]
    artisanName: string
  }
  
  export default function ArtisanGallery({ photos, artisanName }: ArtisanGalleryProps) {
    if (photos.length === 0) return null
  
    return (
      <div style={{
        background: "var(--color-neutral-0)",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
      }}>
        <h2 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
          Galerie photos
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "var(--space-3)",
        }}>
          {photos.map((photo, i) => (
            <div key={i} style={{
              aspectRatio: "1",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-neutral-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              overflow: "hidden",
            }}>
              {photo.startsWith("http") ? (
                <img src={photo} alt={`${artisanName} travaux ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>{photo}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }