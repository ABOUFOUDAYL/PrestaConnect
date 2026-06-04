'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Briefcase, Clock, ChevronRight, Search } from 'lucide-react';

const BADGE_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  ponctuel: 'bg-blue-100 text-blue-700',
  recurrent: 'bg-green-100 text-green-700',
};

export default function AnnoncesPage() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [metierFilter, setMetierFilter] = useState('');

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .eq('statut', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) setAnnonces(data);
    setLoading(false);
  };

  const filtered = annonces.filter(a => {
    const matchSearch = a.titre.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchMetier = metierFilter ? a.metier_requis === metierFilter : true;
    return matchSearch && matchMetier;
  });

  const metiers = [...new Set(annonces.map(a => a.metier_requis))];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Annonces disponibles</h1>
          <p className="text-slate-500 mt-1">Trouvez des missions près de chez vous</p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            />
          </div>
          <select
            value={metierFilter}
            onChange={e => setMetierFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
          >
            <option value="">Tous les métiers</option>
            {metiers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            Aucune annonce disponible pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(annonce => (
              <div
                key={annonce.id}
                onClick={() => router.push(`/annonces/${annonce.id}`)}
                className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 cursor-pointer hover:shadow-md hover:border-slate-200 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLORS[annonce.type_annonce] || 'bg-slate-100 text-slate-600'}`}>
                        {annonce.type_annonce}
                      </span>
                      {annonce.budget_estime && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {annonce.budget_estime.toLocaleString()} FCFA
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-semibold text-slate-900 truncate">{annonce.titre}</h2>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{annonce.description}</p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Briefcase className="w-3.5 h-3.5" />
                        {annonce.metier_requis}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {annonce.ville}{annonce.quartier ? `, ${annonce.quartier}` : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(annonce.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Coût déblocage : <span className="font-medium text-slate-600">{annonce.cout_deblocage?.toLocaleString() || '1 500'} FCFA</span>
                  </span>
                  <span className="text-xs font-medium text-slate-900 group-hover:underline">
                    Voir l'annonce →
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}