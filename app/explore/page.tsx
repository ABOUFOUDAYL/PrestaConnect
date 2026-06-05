'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const METIERS_AVEC_DIPLOME = [
  "Électricien", "Plombier", "Maçon / Technicien en bâtiment",
  "Menuisier / Ébéniste", "Mécanicien automobile", "Soudeur",
  "Carreleur", "Peintre en bâtiment", "Technicien en froid et climatisation",
  "Technicien en électronique", "Coiffeur / Barbier (diplômé)",
  "Esthéticien(ne)", "Photographe professionnel", "Cuisinier / Chef cuisinier",
  "Pâtissier / Boulanger", "Tailleur / Couturier (diplômé)",
  "Informaticien / Technicien PC", "Agent de sécurité",
  "Chauffeur professionnel (permis D/E)", "Technicien en énergies renouvelables",
  "Technicien en génie civil", "Architecte d'intérieur", "Géomètre",
];

const METIERS_SANS_DIPLOME = [
  "Coiffeur / Barbier", "Tailleur / Couturier", "Cordonnier",
  "Tisserand", "Potier / Céramiste", "Forgeron", "Vannier / Artisan en rotin",
  "Sculpteur sur bois", "Bijoutier artisanal", "Brodeur",
  "Peintre décorateur", "Jardinier / Paysagiste", "Laveur de véhicules",
  "Réparateur de motos", "Réparateur d'appareils électroménagers",
  "Maçon traditionnel", "Puisatier", "Charbonnier",
  "Fabricant de savon artisanal", "Fabricant de pagnes / tissus",
  "Réparateur de chaussures", "Tresseur / Tresseuse de cheveux",
  "Décorateur d'événements", "Cuisinier traditionnel / Traiteur",
  "Pécheur artisanal", "Agriculteur / Maraîcher", "Éleveur",
  "Apiculteur", "Ferrailleur / Récupérateur",
];

type Prestataire = {
  id: string;
  nom: string;
  metier: string;
  ville: string;
  quartier: string;
  note: number;
  image: string;
  verifie: boolean;
};

export default function ExplorePage() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [metierFiltre, setMetierFiltre] = useState('Tous');
  const [categorieFiltre, setCategorieFiltre] = useState<'tous' | 'avec_diplome' | 'sans_diplome'>('tous');

  useEffect(() => { fetchPrestataires(); }, []);

  async function fetchPrestataires() {
    setLoading(true);
    const { data, error } = await supabase
      .from('prestataires')
      .select('*')
      .eq('statut', 'approuve');
    if (error) console.error('Erreur:', error);
    else setPrestataires(data || []);
    setLoading(false);
  }

  const metiersFiltres = categorieFiltre === 'avec_diplome'
    ? ['Tous', ...METIERS_AVEC_DIPLOME]
    : categorieFiltre === 'sans_diplome'
    ? ['Tous', ...METIERS_SANS_DIPLOME]
    : ['Tous', ...METIERS_AVEC_DIPLOME, ...METIERS_SANS_DIPLOME];

  const prestatairesAffiches = prestataires.filter((p) => {
    const matchRecherche =
      p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      p.metier.toLowerCase().includes(recherche.toLowerCase()) ||
      p.ville.toLowerCase().includes(recherche.toLowerCase());
    const matchMetier = metierFiltre === 'Tous' || p.metier === metierFiltre;
    const matchCategorie =
      categorieFiltre === 'tous' ||
      (categorieFiltre === 'avec_diplome' && METIERS_AVEC_DIPLOME.includes(p.metier)) ||
      (categorieFiltre === 'sans_diplome' && METIERS_SANS_DIPLOME.includes(p.metier));
    return matchRecherche && matchMetier && matchCategorie;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trouver un prestataire</h1>
          <p className="text-gray-500 mt-1">Découvrez des professionnels qualifiés et vérifiés près de chez vous au Bénin.</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Ex: Électricien, Cotonou, Kossi..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          {(['tous', 'avec_diplome', 'sans_diplome'] as const).map((cat) => (
            <button key={cat}
              onClick={() => { setCategorieFiltre(cat); setMetierFiltre('Tous'); }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${categorieFiltre === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {cat === 'tous' ? '🔍 Tous les métiers' : cat === 'avec_diplome' ? '🎓 Avec diplôme' : '🛠️ Sans diplôme'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {metiersFiltres.slice(0, 15).map((metier) => (
            <button key={metier} onClick={() => setMetierFiltre(metier)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${metierFiltre === metier ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {metier}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Chargement...
          </div>
        ) : prestatairesAffiches.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Aucun prestataire disponible pour l'instant</p>
            <p className="text-sm mt-1">Revenez bientôt ou modifiez votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prestatairesAffiches.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image || '/avatar-default.png'} alt={p.nom} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900">{p.nom}</span>
                        {p.verifie && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                      </div>
                      <span className="text-sm text-blue-600 font-medium">{p.metier}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 font-semibold text-sm">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    {p.note?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{p.quartier}, {p.ville}</span>
                </div>
                <button className="w-full py-2.5 text-sm font-medium text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition">
                  Réserver ce prestataire
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}