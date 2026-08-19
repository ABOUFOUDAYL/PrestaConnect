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
  email: string;
  statut: string;
  qualification_type: string;
  piece_identite_url: string;
  carte_artisan_url: string;
  diplome_url: string;
  casier_judiciaire_url: string;
  created_at: string;
};

export default function AdminArtisans() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [recherche, setRecherche] = useState("");
  const [filtreIncomplet, setFiltreIncomplet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrestataires();
  }, []);

  async function fetchPrestataires() {
    setLoading(true);
    const { data } = await supabase
      .from("prestataires")
      .select("*")
      .order("created_at", { ascending: false });
    setPrestataires(data || []);
    setLoading(false);
  }

  async function supprimerPrestataire(id: string) {
    if (!confirm("Confirmer la suppression ?")) return;
    await supabase.from("prestataires").delete().eq("id", id);
    fetchPrestataires();
  }

  const estIncomplet = (p: Prestataire) => {
    const hasIdentity = p.piece_identite_url || p.carte_artisan_url;
    const hasQualificationDoc = p.qualification_type === 'non_diplome' 
      ? p.casier_judiciaire_url 
      : p.diplome_url;
    return !hasIdentity || !hasQualificationDoc;
  };

  async function relancerArtisan(p: Prestataire) {
    if (!p.email) {
      alert("Cet artisan n'a pas d'adresse e-mail enregistrée.");
      return;
    }

    if (!confirm(`Envoyer l'e-mail de relance à ${p.nom || 'cet artisan'} ?`)) return;

    setSendingId(p.id);
    try {
      const response = await fetch('/api/relance-artisan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email, nom: p.nom })
      });

      if (response.ok) {
        alert("E-mail de relance envoyé avec succès !");
      } else {
        alert("Erreur lors de l'envoi de l'e-mail.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    } finally {
      setSendingId(null);
    }
  }

  const filtres = prestataires.filter((p) => {
    const matchTexte =
      p.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.metier?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.ville?.toLowerCase().includes(recherche.toLowerCase());
    
    if (filtreIncomplet) {
      return matchTexte && estIncomplet(p);
    }
    return matchTexte;
  });

  return (
    <div>
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <p className="text-orange-100 text-sm mb-1">Administration</p>
        <h1 className="text-3xl font-bold">Gestion des artisans</h1>
        <p className="text-orange-100 mt-1">{prestataires.length} artisan(s) enregistré(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <input
            type="text"
            placeholder="Rechercher par nom, métier ou ville..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full sm:flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={() => setFiltreIncomplet(!filtreIncomplet)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filtreIncomplet 
                ? "bg-orange-600 text-white" 
                : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
            }`}
          >
            {filtreIncomplet ? "Afficher tous" : "⚠️ Inscriptions incomplètes"}
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Chargement...</p>
        ) : filtres.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Aucun artisan trouvé</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Nom</th>
                <th className="pb-3">Métier</th>
                <th className="pb-3">Ville</th>
                <th className="pb-3">Téléphone</th>
                <th className="pb-3">Dossier</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((p) => {
                const incomplet = estIncomplet(p);
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-800">{p.nom || 'Sans nom'}</td>
                    <td className="py-3 text-gray-600">{p.metier || 'N/A'}</td>
                    <td className="py-3 text-gray-600">{p.ville || 'N/A'}</td>
                    <td className="py-3 text-gray-600">{p.telephone || 'N/A'}</td>
                    <td className="py-3">
                      {incomplet ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                          Incomplet
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          Complet
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.statut === "approuve"
                          ? "bg-green-100 text-green-700"
                          : p.statut === "refuse"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {p.statut === "approuve" ? "Approuvé" : p.statut === "refuse" ? "Refusé" : "En attente"}
                      </span>
                    </td>
                    <td className="py-3 flex items-center gap-2">
                      {incomplet && (
                        <button
                          onClick={() => relancerArtisan(p)}
                          disabled={sendingId === p.id}
                          className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition disabled:bg-amber-300"
                        >
                          {sendingId === p.id ? "Envoi..." : "Relancer par e-mail"}
                        </button>
                      )}
                      <button
                        onClick={() => supprimerPrestataire(p.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}