'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ShieldCheck, Filter, X } from 'lucide-react';
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
];

const METIERS_SANS_DIPLOME = [
  "Coiffeur / Barbier", "Tailleur / Couturier", "Cordonnier",
  "Tisserand", "Potier / Céramiste", "Forgeron",
  "Jardinier / Paysagiste", "Laveur de véhicules",
  "Réparateur de motos", "Réparateur d'appareils électroménagers",
  "Cuisinier traditionnel / Traiteur", "Décorateur d'événements",
  "Tresseur / Tresseuse de cheveux", "Fabricant de savon artisanal",
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
  const [showFiltres, setShowFiltres] = useState(false);

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
      p.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.metier?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.ville?.toLowerCase().includes(recherche.toLowerCase());
    const matchMetier = metierFiltre === 'Tous' || p.metier === metierFiltre;
    const matchCategorie =
      categorieFiltre === 'tous' ||
      (categorieFiltre === 'avec_diplome' && METIERS_AVEC_DIPLOME.includes(p.metier)) ||
      (categorieFiltre === 'sans_diplome' && METIERS_SANS_DIPLOME.includes(p.metier));
    return matchRecherche && matchMetier && matchCategorie;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-10 pb-16">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Trouver un prestataire
          </h1>
          <p className="text-blue-200 text-sm sm:text-base">
            Professionnels vérifiés et certifiés partout au Bénin
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Électricien, Cotonou, nom..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            />
            {recherche && (
              <button onClick={() => setRecherche('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">

        {/* Filtres catégorie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'tous', label: '🔍 Tous', count: prestataires.length },
              { key: 'avec_diplome', label: '🎓 Diplômés', count: prestataires.filter(p => METIERS_AVEC_DIPLOME.includes(p.metier)).length },
              { key: 'sans_diplome', label: '🛠️ Sans diplôme', count: prestataires.filter(p => METIERS_SANS_DIPLOME.includes(p.metier)).length },
            ] as const).map((cat) => (
              <button key={cat.key}
                onClick={() => { setCategorieFiltre(cat.key); setMetierFiltre('Tous'); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  categorieFiltre === cat.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {cat.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  categorieFiltre === cat.key ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                }`}>{cat.count}</span>
              </button>
            ))}

            <button
              onClick={() => setShowFiltres(!showFiltres)}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                showFiltres ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}>
              <Filter size={15} /> Métier {metierFiltre !== 'Tous' && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
            </button>
          </div>

          {/* Filtre métiers (dépliable) */}
          {showFiltres && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
                {metiersFiltres.map((metier) => (
                  <button key={metier} onClick={() => setMetierFiltre(metier)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      metierFiltre === metier
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    {metier}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            {loading ? 'Chargement...' : `${prestatairesAffiches.length} prestataire${prestatairesAffiches.length > 1 ? 's' : ''} trouvé${prestatairesAffiches.length > 1 ? 's' : ''}`}
          </p>
          {metierFiltre !== 'Tous' && (
            <button onClick={() => setMetierFiltre('Tous')}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
              <X size={12} /> Effacer le filtre
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Recherche des meilleurs profils...</p>
          </div>
        ) : prestatairesAffiches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mb-8">
            <ShieldCheck className="w-14 h-14 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-bold text-gray-700">Aucun prestataire disponible</p>
            <p className="text-sm text-gray-400 mt-1">Revenez bientôt ou modifiez votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {prestatairesAffiches.map((p) => (
              <div key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">

                {/* En-tête carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg flex-shrink-0">
                      {p.nom?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm truncate">{p.nom}</span>
                        {p.verifie && (
                          <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-blue-600 font-semibold">{p.metier}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-700">{p.note?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>

                {/* Localisation */}
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{p.quartier ? `${p.quartier}, ` : ''}{p.ville}</span>
                </div>

                {/* Badge catégorie */}
                <div className="mb-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    METIERS_AVEC_DIPLOME.includes(p.metier)
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {METIERS_AVEC_DIPLOME.includes(p.metier) ? '🎓 Diplômé' : '🛠️ Expérimenté'}
                  </span>
                </div>

                <button className="w-full py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all active:scale-95">
                  Contacter ce prestataire
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}