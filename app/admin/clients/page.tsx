"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Client = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville: string;
  created_at: string;
};

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  async function supprimerClient(id: string) {
    if (!confirm("Confirmer la suppression ?")) return;
    await supabase.from("clients").delete().eq("id", id);
    fetchClients();
  }

  const filtres = clients.filter(
    (c) =>
      c.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      c.prenom?.toLowerCase().includes(recherche.toLowerCase()) ||
      c.email?.toLowerCase().includes(recherche.toLowerCase()) ||
      c.ville?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div>
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <p className="text-orange-100 text-sm mb-1">Administration</p>
        <h1 className="text-3xl font-bold">Gestion des clients</h1>
        <p className="text-orange-100 mt-1">{clients.length} client(s) enregistré(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, email ou ville..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {loading ? (
          <p className="text-center text-gray-400 py-10">Chargement...</p>
        ) : filtres.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Aucun client trouvé</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Nom</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Téléphone</th>
                <th className="pb-3">Ville</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-800">{c.prenom} {c.nom}</td>
                  <td className="py-3 text-gray-600">{c.email}</td>
                  <td className="py-3 text-gray-600">{c.telephone}</td>
                  <td className="py-3 text-gray-600">{c.ville}</td>
                  <td className="py-3 text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => supprimerClient(c.id)}
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