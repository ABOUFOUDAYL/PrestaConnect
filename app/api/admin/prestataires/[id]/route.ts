import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { statut } = await req.json();

  if (!["approuve", "refuse", "en_attente"].includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  if (statut === "approuve") {
    const { data: presta, error: fetchError } = await supabase
      .from("prestataires")
      .select(
        "image, piece_identite_url, selfie_identite_url, qualification_type, diplome_url, attestation_experience_url, carte_artisan_url, autre_justificatif_url, casier_judiciaire_url"
      )
      .eq("id", params.id)
      .single();

    if (fetchError || !presta) {
      return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });
    }

    const manquants: string[] = [];

    if (!presta.image) manquants.push("Photo de profil");
    if (!presta.piece_identite_url) manquants.push("Pièce d'identité");
    if (!presta.selfie_identite_url) manquants.push("Selfie avec pièce d'identité");

    if (!presta.qualification_type) {
      manquants.push("Type de qualification non renseigné (diplômé / non diplômé)");
    } else if (presta.qualification_type === "diplome") {
      if (!presta.diplome_url) manquants.push("Diplôme ou certificat");
    } else if (presta.qualification_type === "non_diplome") {
      const aUnJustificatif =
        presta.attestation_experience_url ||
        presta.carte_artisan_url ||
        presta.autre_justificatif_url;
      if (!aUnJustificatif) {
        manquants.push("Attestation d'expérience, carte d'artisan ou autre justificatif");
      }
      if (!presta.casier_judiciaire_url) {
        manquants.push("Casier judiciaire (obligatoire pour les artisans non diplômés)");
      }
    }

    if (manquants.length > 0) {
      return NextResponse.json(
        { error: "Dossier incomplet", manquants },
        { status: 422 }
      );
    }
  }

  const { error } = await supabase
    .from("prestataires")
    .update({
      statut,
      verifie: statut === "approuve",
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}