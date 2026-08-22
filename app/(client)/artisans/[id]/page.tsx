import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ArrowLeft, Star, BadgeCheck, SearchX } from "lucide-react"
import ArtisanProfile from "@/components/artisans/ArtisanProfile"
import ArtisanGallery from "@/components/artisans/ArtisanGallery"
import ArtisanReviews from "@/components/artisans/ArtisanReviews"
import ArtisanActions from "@/components/artisans/ArtisanActions"

export default async function ArtisanDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()

  const { data: prestataire } = await supabase
    .from("prestataires")
    .select("id, nom, metier, ville, note, nb_avis, verifie, image, description, categorie_metier")
    .eq("id", params.id)
    .maybeSingle()

  if (!prestataire) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-16) 0" }}>
        <SearchX size={48} style={{ margin: "0 auto", color: "var(--color-neutral-400)" }} strokeWidth={1.5} />
        <h1 style={{ color: "var(--color-neutral-700)" }}>Artisan introuvable</h1>
      </div>
    )
  }

  const { data: avisData } = await supabase
    .from("avis")
    .select("id, note, commentaire, created_at, profiles:client_id ( nom, prenom )")
    .eq("prestataire_id", params.id)
    .order("created_at", { ascending: false })

  const reviews = (avisData ?? []).map((a: any) => ({
    id: a.id,
    auteur: [a.profiles?.prenom, a.profiles?.nom].filter(Boolean).join(" ") || "Client PrestaConnect",
    note: a.note,
    commentaire: a.commentaire,
    date: new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  }))

  const badges = [
    ...(prestataire.verifie ? [{ icon: BadgeCheck, label: "Vérifié" }] : []),
    ...((prestataire.note ?? 0) >= 4.5 ? [{ icon: Star, label: "Très bien noté" }] : []),
  ]

  const artisan = {
    id: prestataire.id,
    name: prestataire.nom,
    metier: prestataire.metier,
    ville: prestataire.ville,
    note: prestataire.note ?? 0,
    avis: prestataire.nb_avis ?? 0,
    verifie: prestataire.verifie ?? false,
    photo: prestataire.image || undefined,
    description: prestataire.description || "Aucune description renseignée.",
    categories: prestataire.categorie_metier ? [prestataire.categorie_metier] : [],
    badges,
  }

  const photos = prestataire.image ? [prestataire.image] : []

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/artisans" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--color-primary-500)", textDecoration: "none" }}>
          <ArrowLeft size={15} /> Retour aux artisans
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--space-6)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <ArtisanProfile artisan={artisan} />
          <ArtisanGallery photos={photos} artisanName={artisan.name} />
          <ArtisanReviews reviews={reviews} noteMoyenne={artisan.note} />
        </div>
        <ArtisanActions artisanId={artisan.id} artisanName={artisan.name} />
      </div>
    </div>
  )
}