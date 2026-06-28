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
};

export default function AdminArtisans() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);

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

  const filtres = prestataires.filter(
    (p) =>
      p.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.metier?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.ville?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div>
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <p className="text-orange-100 text-sm mb-1">Administration</p>
        <h1 className="text-3xl font-bold">Gestion des artisans</h1>
        <p className="text-orange-100 mt-1">{prestataires.length} artisan(s) enregistré(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <input
          type="text"
          placeholder="Rechercher par nom, métier ou ville..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

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
                <th className="pb-3">Statut</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-800">{p.nom}</td>
                  <td className="py-3 text-gray-600">{p.metier}</td>
                  <td className="py-3 text-gray-600">{p.ville}</td>
                  <td className="py-3 text-gray-600">{p.telephone}</td>
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
                  <td className="py-3">
                    <button
                      onClick={() => supprimerPrestataire(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}