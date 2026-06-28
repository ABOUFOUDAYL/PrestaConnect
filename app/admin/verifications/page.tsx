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

export default function AdminVerifications() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [onglet, setOnglet] = useState("en_attente");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrestataires();
  }, [onglet]);

  async function fetchPrestataires() {
    setLoading(true);
    const { data } = await supabase
      .from("prestataires")
      .select("*")
      .eq("statut", onglet)
      .order("created_at", { ascending: false });
    setPrestataires(data || []);
    setLoading(false);
  }

  async function updateStatut(id: string, statut: string) {
    await fetch(`/api/admin/prestataires/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    fetchPrestataires();
  }

  return (
    <div>
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <p className="text-orange-100 text-sm mb-1">Modération</p>
        <h1 className="text-3xl font-bold">Vérification des dossiers</h1>
        <p className="text-orange-100 mt-1">Validez ou refusez les dossiers des artisans</p>
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
          <p className="text-center text-gray-400 py-10">Aucun dossier</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Nom</th>
                <th className="pb-3">Métier</th>
                <th className="pb-3">Ville</th>
                <th className="pb-3">Téléphone</th>
                <th className="pb-3">Date</th>
                {onglet === "en_attente" && <th className="pb-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {prestataires.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-800">{p.nom}</td>
                  <td className="py-3 text-gray-600">{p.metier}</td>
                  <td className="py-3 text-gray-600">{p.ville}</td>
                  <td className="py-3 text-gray-600">{p.telephone}</td>
                  <td className="py-3 text-gray-400">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  {onglet === "en_attente" && (
                    <td className="py-3 flex gap-2">
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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}