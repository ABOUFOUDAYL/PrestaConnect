'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function getTarif(type: string | null): { montant: number; label: string } {
  switch (type) {
    case 'urgent':
      return { montant: 300, label: 'prestation urgente' };
    case 'sans_diplome':
      return { montant: 500, label: 'prestataire sans diplôme' };
    case 'grand_projet':
      return { montant: 1500, label: 'grand chantier' };
    default:
      return { montant: 300, label: 'mise en relation' };
  }
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalAcceptes: 0,
    totalTermines: 0,
    enCours: 0,
    tauxSucces: 0,
    investissement: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('demandes')
        .select('status, type_intervention')
        .eq('artisan_id', user.id);

      if (error) throw error;

      if (data) {
        const acceptes = data.filter(d => d.status === 'Accepté').length;
        const termines = data.filter(d => d.status === 'Terminé').length;
        const enCours = data.filter(d => d.status === 'En cours').length;
        const taux = acceptes > 0 ? Math.round((termines / acceptes) * 100) : 0;

        // Calcul investissement réel selon type_intervention
        const investissement = data
          .filter(d => d.status === 'Accepté')
          .reduce((sum, d) => sum + getTarif(d.type_intervention).montant, 0);

        setStats({ totalAcceptes: acceptes, totalTermines: termines, enCours, tauxSucces: taux, investissement });
      }
    } catch (err) {
      console.error("Erreur analytiques:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400 animate-pulse font-medium">
        Analyse de vos performances…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytiques</h1>
        <p className="text-gray-500 mt-1 text-sm">Suivez l'évolution et la rentabilité de votre activité.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4">
            <TrendingUp size={18} />
          </div>
          <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide">Chantiers débloqués</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAcceptes}</h3>
          <p className="text-[11px] text-gray-400 mt-2">
            Investissement : <span className="font-semibold text-gray-600">{stats.investissement} FCFA</span>
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-4">
            <CheckCircle size={18} />
          </div>
          <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide">Chantiers terminés</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTermines}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">Interventions clôturées</p>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg w-fit mb-4">
            <Clock size={18} />
          </div>
          <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide">En cours d'exécution</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.enCours}</h3>
          <p className="text-[11px] text-gray-400 mt-2">Discussions WhatsApp actives</p>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg w-fit mb-4">
            <BarChart3 size={18} />
          </div>
          <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide">Taux de réussite</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.tauxSucces}%</h3>
          <p className="text-[11px] text-gray-400 mt-2">Chantiers menés à terme</p>
        </div>

      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
        <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-gray-600 text-sm space-y-1">
          <p>Tarif de déblocage des coordonnées selon le type de demande :</p>
          <ul className="mt-1 space-y-0.5">
            <li>• Prestation urgente : <span className="font-semibold text-gray-900">300 FCFA</span></li>
            <li>• Prestataire sans diplôme : <span className="font-semibold text-gray-900">500 FCFA</span></li>
            <li>• Grand chantier : <span className="font-semibold text-gray-900">1 500 FCFA</span></li>
          </ul>
        </div>
      </div>

    </div>
  );
}
