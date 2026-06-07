'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BENIN_CRAFTS } from '@/constants/jobs';
import { Smartphone, CheckCircle2, ShieldCheck, RefreshCw, Star, Zap, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentsPage() {
  const [solde, setSolde] = useState<number>(0);
  const [metier, setMetier] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('solde_credits, metier')
        .eq('id', user.id)
        .single();
      if (data) {
        setSolde(data.solde_credits || 0);
        setMetier(data.metier || '');
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  }

  const myCraft = BENIN_CRAFTS.find(c => c.id === metier);
  const estMetierGratuitPourArtisan = myCraft?.payer === 'client';

  if (loading) {
    return <div className="py-20 text-center text-gray-400 animate-pulse text-sm">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">

      <div className="mb-8 pb-6 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {estMetierGratuitPourArtisan ? "Espace tarif client" : "Frais de mise en relation"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Suivez les règles de tarification de votre activité sur PrestaConnect.</p>
        </div>
        <button onClick={fetchUserData} className="p-2.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all">
          <RefreshCw size={18} />
        </button>
      </div>

      {estMetierGratuitPourArtisan ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg flex-shrink-0">
              <Star size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-900 mb-1">Application 100% gratuite pour vous</h2>
              <p className="text-emerald-700 text-sm leading-relaxed">
                En tant que <span className="font-semibold">{myCraft?.label}</span>, vous ne payez rien.
                Le client verse <span className="font-semibold">500 FCFA</span> pour débloquer votre numéro WhatsApp.
              </p>
            </div>
          </div>
          <div className="bg-white border border-emerald-200 px-5 py-3 rounded-xl text-center flex-shrink-0 w-full sm:w-auto">
            <span className="block text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Votre tarif</span>
            <span className="text-2xl font-bold text-emerald-700">0 FCFA</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-base font-bold text-blue-900 mb-1">Votre solde disponible</h2>
              <p className="text-blue-700 text-sm leading-relaxed max-w-md">
                300 FCFA par déblocage urgent, 500 FCFA pour un prestataire sans diplôme, 1 500 FCFA pour un grand chantier.
              </p>
            </div>
            <div className="bg-white border border-blue-200 px-5 py-3 rounded-xl text-center flex-shrink-0 w-full sm:w-auto">
              <span className="block text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Solde actuel</span>
              <span className="text-2xl font-bold text-blue-700">{solde.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg w-fit mb-4">
                <Zap size={18} />
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Cas urgent</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">300 <span className="text-sm font-medium text-gray-400">FCFA</span></p>
              <p className="text-gray-500 text-sm">Intervention rapide, besoin immédiat. Débloquez le contact client en un clic.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg w-fit mb-4">
                <Star size={18} />
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Sans diplôme</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">500 <span className="text-sm font-medium text-gray-400">FCFA</span></p>
              <p className="text-gray-500 text-sm">Prestataire sans diplôme. Débloquez les coordonnées du client facilement.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4">
                <Building2 size={18} />
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Grand chantier</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">1 500 <span className="text-sm font-medium text-gray-400">FCFA</span></p>
              <p className="text-gray-500 text-sm">Travaux importants à forte valeur. Un seul chantier rentabilise des dizaines de recharges.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Smartphone size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recharger mon solde</h3>
                <p className="text-gray-400 text-xs mt-0.5">Via Celtiis Cash, MTN MoMo ou Moov Flooz.</p>
              </div>
            </div>
            <Link href="/recharge" className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold text-sm text-center transition-all">
              Recharger maintenant
            </Link>
          </div>

        </div>
      )}

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-600 text-xs leading-relaxed">
            <span className="font-semibold text-gray-900">Paiement direct :</span> Le salaire est discuté de gré à gré et versé directement par le client en espèces ou Mobile Money.
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <ShieldCheck size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-600 text-xs leading-relaxed">
            <span className="font-semibold text-gray-900">Transparence béninoise :</span> PrestaConnect équilibre les frais pour que chacun y trouve son compte selon son métier.
          </p>
        </div>
      </div>

    </div>
  );
}
