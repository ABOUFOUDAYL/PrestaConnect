'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalAcceptes: 0,
    totalTermines: 0,
    enCours: 0,
    tauxSucces: 0
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

      // Récupérer toutes les demandes associées à cet artisan
      const { data, error } = await supabase
        .from('demandes')
        .select('status')
        .eq('artisan_id', user.id);

      if (error) throw error;

      if (data) {
        const acceptes = data.length;
        const termines = data.filter(d => d.status === 'Terminé').length;
        const enCours = data.filter(d => d.status === 'En cours').length;
        const taux = acceptes > 0 ? Math.round((termines / acceptes) * 100) : 0;

        setStats({
          totalAcceptes: acceptes,
          totalTermines: termines,
          enCours: enCours,
          tauxSucces: taux
        });
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des analytiques:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Analyse de vos performances au Bénin...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytiques</h1>
        <p className="text-gray-500 mt-2 font-medium">Suivez l'évolution et la rentabilité de votre activité.</p>
      </div>

      {/* Cartes de statistiques clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Chantiers Débloqués</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalAcceptes}</h3>
          <p className="text-[11px] text-gray-400 mt-2">Investissement : {stats.totalAcceptes * 200} FCFA</p>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
            <CheckCircle size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Chantiers Terminés</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalTermines}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">Interventions clôturées</p>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4">
            <Clock size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">En cours d'exécution</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.enCours}</h3>
          <p className="text-[11px] text-gray-400 mt-2">Discussions WhatsApp actives</p>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4">
            <BarChart3 size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Taux de Réussite</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.tauxSucces}%</h3>
          <p className="text-[11px] text-gray-400 mt-2">Chantiers menés à terme</p>
        </div>

      </div>

      {/* Message d'évaluation de rentabilité */}
      <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 items-center">
          <AlertCircle size={22} className="text-blue-600 flex-shrink-0" />
          <p className="text-gray-600 text-sm font-medium">
            Chaque mise en relation coûte <span className="font-bold text-gray-900">200 FCFA</span>. Optimisez vos gains en concluant rapidement vos échanges sur WhatsApp !
          </p>
        </div>
      </div>
    </div>
  );
}