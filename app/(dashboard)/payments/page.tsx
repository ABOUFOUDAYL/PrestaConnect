'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BENIN_CRAFTS } from '@/constants/jobs';
import { Smartphone, Lock, CheckCircle2, ShieldCheck, RefreshCw, Star } from 'lucide-react';

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

      const { data, error } = await supabase
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
        /* --- AFFICHAGE POUR NOUNOU / MENAGERE / GARDIEN (GRATUIT POUR L'ARTISAN) --- */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-xl md:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="max-w-xl">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl w-fit mb-4">
                <Star size={24} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application 100% Gratuite pour vous !</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                En tant que <span className="font-bold underline">{myCraft?.label}</span>, vous ne payez absolument rien pour être mis en relation. C'est le client qui verse les frais de recherche pour débloquer votre numéro WhatsApp et vous contacter.
              </p>
            </div>
            <div className="bg-white/20 px-6 py-4 rounded-2xl text-center flex-shrink-0 w-full sm:w-auto">
              <span className="block text-xs uppercase tracking-wider font-bold text-emerald-200">Votre Tarif</span>
              <span className="text-3xl font-black">0 FCFA</span>
            </div>
          </div>
        </div>
      ) : (
        /* --- AFFICHAGE POUR LES INGENIEURS / ARTISANS TECHNIQUES (200 FCFA LE DEBLOCAGE) --- */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-between md:col-span-2">
            <div>
              <h2 className="text-2xl font-bold mb-2">Votre Solde Disponible</h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                Chaque déblocage de numéro client vous coûte exactement **200 FCFA**. Rechargez votre compte pour ne rater aucun chantier.
              </p>
            </div>
            <div className="mt-10 border-t border-white/10 pt-6 flex items-baseline gap-2">
              <span className="text-4xl font-black">{solde} FCFA</span>
              <span className="text-blue-200 text-xs font-medium">sur votre compte</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
                <Smartphone size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rechargement</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Alimentez votre solde via **Celtiis Cash**, **MTN MoMo** ou **Moov Flooz**.
              </p>
            </div>
            <button className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm mt-6">
              Recharger mon solde
            </button>
          </div>
        </div>
      )}

      {/* Règles communes */}
      <div className="mt-6 bg-gray-50 rounded-[2rem] p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-3 items-start">
          <div className="mt-0.5"><CheckCircle2 size={18} className="text-emerald-500" /></div>
          <p className="text-gray-600 text-xs leading-relaxed">
            <span className="font-bold text-gray-900">Paiement direct :</span> Le salaire ou prix de la prestation est discuté de gré à gré et versé directement par le client en espèces ou Mobile Money.
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="mt-0.5"><ShieldCheck size={18} className="text-blue-600" /></div>
          <p className="text-gray-600 text-xs leading-relaxed">
            <span className="font-bold text-gray-900">Transparence béninoise :</span> PrestaConnect équilibre les frais pour que chacun y trouve son compte équitablement selon son métier.
          </p>
        </div>
      </div>
    </div>
  );
}