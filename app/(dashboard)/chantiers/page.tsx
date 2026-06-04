'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChantiersPage() {
  const [demandes, setDemandes] = useState<any[]>([]);

  useEffect(() => {
    fetchDemandes();
  }, []);

  async function fetchDemandes() {
    const { data } = await supabase
      .from('demandes')
      .select('*')
      .eq('status', 'disponible');
    setDemandes(data || []);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Chantiers & Demandes</h1>
        <p className="text-gray-500 mt-2">Gérez vos interventions et consultez les nouvelles demandes.</p>
      </div>

      {/* Liste des chantiers */}
      {demandes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">Aucun chantier disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demandes.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">
                  {d.metier_type || 'Service'}
                </span>
                <span className="text-sm font-semibold text-gray-400">📍 {d.ville}</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{d.service_nom}</h3>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">{d.description}</p>
              
              <button className="w-full py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                Voir les détails
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}