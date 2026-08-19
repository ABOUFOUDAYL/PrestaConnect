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

  const estIncomplet = (p: Prestataire) => {
    const hasIdentity = p.piece_identite_url || p.carte_artisan_url;
    const hasQualificationDoc = p.qualification_type === 'non_diplome' 
      ? p.casier_judiciaire_url 
      : p.diplome_url;
    return !hasIdentity || !hasQualificationDoc;
  };

  async function relancerArtisan(p: Prestataire) {
    if (!p.email || p.email.trim() === "") {
      alert("Cet artisan n'a pas d'adresse e-mail enregistrée dans la base de données.");
      return;
    }

    if (!confirm(`Envoyer l'e-mail de relance à ${p.nom} (${p.email}) ?`)) return;

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
      alert("Erreur réseau lors de l'appel API.");
    } finally {
      setSendingId(null);
    }
  }

  const filtres = prestataires.filter((p) => {
    const matchTexte =
      p.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.metier?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.email?.toLowerCase().includes(recherche.toLowerCase());
    
    if (filtreIncomplet) {
      return matchTexte && estIncomplet(p);
    }
    return matchTexte;
  });

  return (
    <div className="p-6">
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold">Gestion des artisans</h1>
        <p className="text-orange-100 mt-1">{prestataires.length} artisan(s) au total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <input
          type="text"
          placeholder="Rechercher par nom, métier ou email..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-4"
        />

        {loading ? <p className="text-center">Chargement...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Nom</th>
                <th className="pb-3">E-mail</th>
                <th className="pb-3">Dossier</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-3">{p.nom || 'Sans nom'}</td>
                  <td className="py-3 text-gray-600">
                    {p.email || <span className="text-red-500 font-bold">MISSING</span>}
                  </td>
                  <td className="py-3">
                    {estIncomplet(p) ? (
                      <span className="text-amber-600 font-medium">Incomplet</span>
                    ) : (
                      <span className="text-green-600">Complet</span>
                    )}
                  </td>
                  <td className="py-3">
                    {estIncomplet(p) && (
                      <button
                        onClick={() => relancerArtisan(p)}
                        disabled={sendingId === p.id}
                        className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                      >
                        {sendingId === p.id ? "Envoi..." : "Relancer"}
                      </button>
                    )}
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