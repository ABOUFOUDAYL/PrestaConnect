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
      console.error("Erreur de récupération des données:", err);
    } finally {
      setLoading(false);
    }
  }

  const myCraft = BENIN_CRAFTS.find(c => c.id === metier);
  const estMetierGratuitPourArtisan = myCraft?.payer === 'client';

  if (loading) {
    return <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Chargement de vos informations...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {estMetierGratuitPourArtisan ? "Espace Tarif Client" : "Frais de mise en relation"}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Suivez les règles de tarification de votre activité sur PrestaConnect.</p>
        </div>
        <button onClick={fetchUserData} className="p-3 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-xl transition-all">
          <RefreshCw size={20} />
        </button>
      </div>

      {estMetierGratuitPourArtisan ? (
        // --- MÉTIERS DE SERVICE (CLIENT PAIE 500 FCFA) ---
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl md:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="max-w-xl">
              <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4">
                <Star size={24} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application 100% Gratuite pour vous !</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                En tant que <span className="font-bold underline">{myCraft?.label}</span>, vous ne payez absolument rien. C'est le client qui verse <span className="font-bold">500 FCFA</span> pour débloquer votre numéro WhatsApp et vous contacter.
              </p>
            </div>
            <div className="bg-white/20 px-6 py-4 rounded-2xl text-center flex-shrink-0 w-full sm:w-auto">
              <span className="block text-xs uppercase tracking-wider font-bold text-emerald-200">Votre Tarif</span>
              <span className="text-3xl font-black">0 FCFA</span>
            </div>
          </div>
        </div>
      ) : (
        // --- MÉTIERS TECHNIQUES (ARTISAN PAIE 300 OU 1500 FCFA) ---
        <div className="space-y-6">
          {/* Solde */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Votre Solde Disponible</h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                Déduisez 300 FCFA par déblocage urgent ou 1500 FCFA pour un grand chantier. Rechargez pour ne rater aucune opportunité.
              </p>
            </div>
            <div className="bg-white/20 px-6 py-4 rounded-2xl text-center flex-shrink-0 w-full sm:w-auto">
              <span className="block text-xs uppercase tracking-wider font-bold text-blue-200 mb-1">Solde actuel</span>
              <span className="text-4xl font-black">{solde.toLocaleString()}</span>
              <span className="text-blue-200 text-sm font-medium ml-1">FCFA</span>
            </div>
          </div>

          {/* Grille tarifs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
                <Zap size={22} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cas Urgent</p>
              <p className="text-3xl font-black text-gray-900 mb-1">300 <span className="text-lg font-bold text-gray-400">FCFA</span></p>
              <p className="text-gray-500 text-sm">Intervention rapide, besoin immédiat. Débloquez le contact client en un clic.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
                <Building2 size={22} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Grand Chantier</p>
              <p className="text-3xl font-black text-gray-900 mb-1">1 500 <span className="text-lg font-bold text-gray-400">FCFA</span></p>
              <p className="text-gray-500 text-sm">Travaux importants à forte valeur. Un seul chantier rentabilise des dizaines de recharges.</p>
            </div>
          </div>

          {/* Rechargement */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recharger mon solde</h3>
                <p className="text-gray-500 text-xs">Via Celtiis Cash, MTN MoMo ou Moov Flooz.</p>
              </div>
            </div>
            <Link href="/recharge" className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm text-center transition-all">
              Recharger maintenant
            </Link>
          </div>
        </div>
      )}

      {/* Règles communes */}
      <div className="mt-6 bg-gray-50 rounded-[2rem] p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-600 text-xs leading-relaxed">
            <span className="font-bold text-gray-900">Paiement direct :</span> Le salaire est discuté de gré à gré et versé directement par le client en espèces ou Mobile Money.
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <ShieldCheck size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-600 text-xs leading-relaxed">
            <span className="font-bold text-gray-900">Transparence béninoise :</span> PrestaConnect équilibre les frais pour que chacun y trouve son compte selon son métier.
          </p>
        </div>
      </div>
    </div>
  );
}