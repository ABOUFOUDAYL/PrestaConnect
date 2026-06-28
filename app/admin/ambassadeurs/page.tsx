"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Ambassadeur = {
  id: string;
  user_id: string;
  nom: string;
  prenom: string;
  role: string;
};

export default function AdminAmbassadeurs() {
  const [ambassadeurs, setAmbassadeurs] = useState<Ambassadeur[]>([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmbassadeurs();
  }, []);

  async function fetchAmbassadeurs() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "ambassadeur")
      .order("nom", { ascending: true });
    setAmbassadeurs(data || []);
    setLoading(false);
  }

  async function retirerAmbassadeur(id: string) {
    if (!confirm("Retirer le rôle ambassadeur à cet utilisateur ?")) return;
    await supabase.from("profiles").update({ role: "client" }).eq("id", id);
    fetchAmbassadeurs();
  }

  const filtres = ambassadeurs.filter(
    (a) =>
      a.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      a.prenom?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div>
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <p className="text-orange-100 text-sm mb-1">Administration</p>
        <h1 className="text-3xl font-bold">Gestion des ambassadeurs</h1>
        <p className="text-orange-100 mt-1">{ambassadeurs.length} ambassadeur(s) enregistré(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou prénom..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {loading ? (
          <p className="text-center text-gray-400 py-10">Chargement...</p>
        ) : filtres.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Aucun ambassadeur trouvé</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Nom</th>
                <th className="pb-3">Prénom</th>
                <th className="pb-3">Rôle</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-800">{a.nom}</td>
                  <td className="py-3 text-gray-600">{a.prenom}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      Ambassadeur
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => retirerAmbassadeur(a.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
                    >
                      Retirer rôle
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