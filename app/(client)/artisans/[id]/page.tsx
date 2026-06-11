import ArtisanProfile from "@/components/artisans/ArtisanProfile"
import ArtisanGallery from "@/components/artisans/ArtisanGallery"
import ArtisanReviews from "@/components/artisans/ArtisanReviews"
import ArtisanActions from "@/components/artisans/ArtisanActions"

const ARTISANS_DATA: Record<string, any> = {
  "1": {
    id: "1", name: "Jean Kouassi", metier: "Plombier", ville: "Cotonou",
    note: 4.8, avis: 32, verifie: true,
    description: "Plombier expérimenté avec plus de 10 ans de pratique. Spécialisé dans les installations sanitaires, réparations urgentes et la plomberie industrielle.",
    categories: ["Plomberie", "Bâtiment"],
    competences: ["Plomberie sanitaire", "Chauffe-eau", "Canalisations", "Urgences", "Devis gratuit"],
    experience: "10 ans d'expérience — Ancien technicien SONEB, maintenant indépendant depuis 2015.",
    badges: ["🏆 Top artisan", "⚡ Réponse rapide", "✓ Vérifié"],
    photos: ["🚿", "🔧", "🪣", "💧"],
  },
  "2": {
    id: "2", name: "Marie Adjobi", metier: "Électricienne", ville: "Porto-Novo",
    note: 4.5, avis: 18, verifie: true,
    description: "Électricienne certifiée pour installations résidentielles, dépannages électriques et mise aux normes.",
    categories: ["Électricité"],
    competences: ["Tableau électrique", "Prises & interrupteurs", "Éclairage LED", "Câblage", "Diagnostic"],
    experience: "7 ans d'expérience — Diplômée de l'EPAC, spécialisée en électricité résidentielle.",
    badges: ["✓ Vérifié", "⭐ Très bien noté"],
    photos: ["💡", "🔌", "⚡", "🔦"],
  },
}

export default function ArtisanDetailPage({ params }: { params: { id: string } }) {
  const artisan = ARTISANS_DATA[params.id]

  if (!artisan) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-16) 0" }}>
        <p style={{ fontSize: "3rem" }}>🔍</p>
        <h1 style={{ color: "var(--color-neutral-700)" }}>Artisan introuvable</h1>
      </div>
    )
  }

  const reviews = [
    { id: "1", auteur: "Fatou K.", note: 5, commentaire: "Excellent travail, très professionnel et ponctuel. Je recommande vivement !", date: "Il y a 2 semaines" },
    { id: "2", auteur: "Abdou M.", note: 4, commentaire: "Bon travail dans l'ensemble, tarif raisonnable.", date: "Il y a 1 mois" },
    { id: "3", auteur: "Carine D.", note: 5, commentaire: "Intervention rapide et efficace. Très satisfaite du résultat.", date: "Il y a 2 mois" },
  ]

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <a href="/artisans" style={{ fontSize: "var(--text-sm)", color: "var(--color-primary-500)", textDecoration: "none" }}>
          ← Retour aux artisans
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--space-6)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <ArtisanProfile artisan={artisan} />
          <ArtisanGallery photos={artisan.photos} artisanName={artisan.name} />
          <ArtisanReviews reviews={reviews} noteMoyenne={artisan.note} />
        </div>
        <ArtisanActions artisanId={artisan.id} artisanName={artisan.name} />
      </div>
    </div>
  )
}