"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Prestataire = {
  id: string;
  nom: string;
  metier: string;
  ville: string;
  telephone: string;
  statut: string;
  verifie: boolean;
  created_at: string;
  image: string | null;
  qualification_type: string | null;
  piece_identite_url: string | null;
  selfie_identite_url: string | null;
  diplome_url: string | null;
  attestation_experience_url: string | null;
  carte_artisan_url: string | null;
  autre_justificatif_url: string | null;
  casier_judiciaire_url: string | null;
};

type UserProfile = {
  role: string;
  assigned_zone: string | null;
};

function DocLink({ label, path }: { label: string; path: string | null }) {
  const [loading, setLoading] = useState(false);

  if (!path) {
    return (
      <span className="text-xs text-red-500 flex items-center gap-1">
        Manquant : {label}
      </span>
    );
  }

  async function openDocument() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/document-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openDocument}
      disabled={loading}
      className="text-xs text-green-600 underline flex items-center gap-1 disabled:opacity-50"
    >
      {loading ? "Ouverture..." : `Fourni : ${label}`}
    </button>
  );
}

export default function AdminVerifications() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [onglet, setOnglet] = useState("en_attente");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [erreurDossier, setErreurDossier] = useState<{ id: string; manquants: string[] } | null>(null);

  useEffect(() => {
    chargerDonneesEtPrestataires();
  }, [onglet]);

  async function chargerDonneesEtPrestataires() {
    setLoading(true);

    // 1. Récupérer l'utilisateur connecté pour connaitre son rôle et sa zone
    const { data: authData } = await supabase.auth.getUser();
    let zoneAmbassadeur: string | null = null;
    let roleUtilisateur: string | null = null;

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, assigned_zone")
        .eq("user_id", authData.user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        roleUtilisateur = profile.role;
        zoneAmbassadeur = profile.assigned_zone;
      }
    }

    // 2. Construire la requête des prestataires
    let query = supabase
      .from("prestataires")
      .select("*")
      .eq("statut", onglet)
      .order("created_at", { ascending: false });

    // Si c'est un ambassadeur et qu'il a une zone assignée, on filtre strictement
    if (roleUtilisateur === "ambassadeur" && zoneAmbassadeur) {
      query = query.eq("ville", zoneAmbassadeur);
    }

    const { data } = await query;
    setPrestataires(data || []);
    setLoading(false);
  }

  async function updateStatut(id: string, statut: string) {
    setErreurDossier(null);
    const res = await fetch(`/api/admin/prestataires/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });

    if (!res.ok) {
      const data = await res.json();
      if (data.manquants) {
        setErreurDossier({ id, manquants: data.manquants });
      }
      return;
    }

    chargerDonneesEtPrestataires();
  }

  return (
    <div>
      {/* En-tête dynamique selon le rôle */}
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-orange-100 text-sm mb-1">Modération Terrain</p>
          <h1 className="text-3xl font-bold">Vérification des dossiers</h1>
          <p className="text-orange-100 mt-1">
            {userProfile?.role === "ambassadeur"
              ? `Zone assignée : ${userProfile.assigned_zone || "Aucune zone définie"}`
              : "Supervision globale de tous les artisans du Bénin"}
          </p>
        </div>
        {userProfile?.role === "ambassadeur" && (
          <div className="bg-orange-600 px-4 py-2 rounded-xl text-sm font-semibold border border-orange-400">
            📍 Ambassadeur : {userProfile.assigned_zone}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-3 mb-6">
          {[
            { key: "en_attente", label: "En attente" },
            { key: "approuve", label: "Approuvés" },
            { key: "refuse", label: "Refusés" },
          ].map((o) => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                onglet === o.key
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Chargement...</p>
        ) : prestataires.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Aucun dossier dans cette vue</p>
        ) : (
          <div className="space-y-4">
            {prestataires.map((p) => (
              <div key={p.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{p.nom}</p>
                    <p className="text-sm text-gray-500">
                      {p.metier} · <span className="font-medium text-orange-600">{p.ville}</span> · {p.telephone}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                      {" · "}
                      {p.qualification_type === "diplome"
                        ? "Diplômé"
                        : p.qualification_type === "non_diplome"
                        ? "Non diplômé"
                        : "Qualification non renseignée"}
                    </p>
                  </div>

                  {onglet === "en_attente" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatut(p.id, "approuve")}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => updateStatut(p.id, "refuse")}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 pt-3 border-t">
                  <DocLink label="Photo de profil" path={p.image} />
                  <DocLink label="Piece d'identite" path={p.piece_identite_url} />
                  <DocLink label="Selfie avec piece d'identite" path={p.selfie_identite_url} />
                  {p.qualification_type === "diplome" && (
                    <DocLink label="Diplome / certificat" path={p.diplome_url} />
                  )}
                  {p.qualification_type === "non_diplome" && (
                    <>
                      <DocLink label="Attestation d'experience" path={p.attestation_experience_url} />
                      <DocLink label="Carte d'artisan" path={p.carte_artisan_url} />
                      <DocLink label="Autre justificatif" path={p.autre_justificatif_url} />
                    </>
                  )}
                  <DocLink
                    label={
                      p.qualification_type === "non_diplome"
                        ? "Casier judiciaire (obligatoire)"
                        : "Casier judiciaire"
                    }
                    path={p.casier_judiciaire_url}
                  />
                </div>

                {erreurDossier?.id === p.id && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-700 mb-1">
                      Impossible d'approuver, dossier incomplet :
                    </p>
                    <ul className="text-xs text-red-600 list-disc list-inside">
                      {erreurDossier.manquants.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}