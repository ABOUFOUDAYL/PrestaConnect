'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Loader2, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    FedaPay: any;
  }
}

export default function FedaPayCheckoutPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Montant forfaitaire d'activation (Exemple : 5 000 FCFA pour la certification nationale)
  const ACTIVATION_FEE = 5000; 

  useEffect(() => {
    // Récupération des informations de l'utilisateur connecté pour pré-remplir FedaPay
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        setUserProfile(data);
      }
    };
    getUserProfile();
  }, []);

  // Initialisation et déclenchement du Widget FedaPay
  const handlePaymentInit = () => {
    if (!scriptLoaded || !userProfile) {
      alert("Le système de paiement charge les informations nécessaires. Veuillez patienter.");
      return;
    }

    setLoading(true);

    try {
      // Configuration du composant embarqué FedaPay
      window.FedaPay.init({
        public_key: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY || 'pk_sandbox_votre_cle_publique_ici',
        transaction: {
          amount: ACTIVATION_FEE,
          description: `Activation de profil Professionnel - PrestaConnect`,
          custom_metadata: {
            profile_id: userProfile.id,
            full_name: userProfile.full_name || 'Artisan Indépendant'
          }
        },
        customer: {
          firstname: userProfile.full_name?.split(' ')[0] || 'Utilisateur',
          lastname: userProfile.full_name?.split(' ')[1] || 'PrestaConnect',
          email: userProfile.email || 'contact@prestaconnect.bj',
          phone_number: {
            number: userProfile.phone ? userProfile.phone.replace(/\s+/g, '') : '',
            country: 'BJ' // Code pays Bénin fixe pour restreindre aux passerelles locales
          }
        },
        onStateChange: (state: string) => {
          if (state === 'approved') {
            setPaymentStatus('success');
            setLoading(false);
          } else if (state === 'declined' || state === 'canceled') {
            setPaymentStatus('error');
            setLoading(false);
          }
        }
      });

      // Ouverture de la passerelle de paiement
      window.FedaPay.open();
    } catch (error) {
      console.error("Erreur d'initialisation de FedaPay :", error);
      setPaymentStatus('error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pt-32 pb-16 px-4 flex items-center justify-center">
      {/* Chargement sécurisé du CDN officiel FedaPay */}
      <Script 
        src="https://cdn.fedapay.com/online/v1/fedapay.js" 
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header du formulaire */}
        <div className="p-6 bg-slate-900 border-b border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Finalisation Nationale</h2>
            <p className="text-xs text-slate-400">Paiement sécurisé par MTN MoMo, Moov Money, Celtiis</p>
          </div>
        </div>

        {/* Corps principal selon le statut de paiement */}
        <div className="p-8">
          {paymentStatus === 'idle' && (
            <>
              <div className="mb-6 text-center">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-2">Frais d'activation de compte</span>
                <span className="text-5xl font-black text-white tracking-tight">
                  {ACTIVATION_FEE.toLocaleString()} <span className="text-lg font-bold text-slate-400">FCFA</span>
                </span>
              </div>

              <div className="bg-slate-950/40 border border-slate-700/50 p-4 rounded-xl text-xs space-y-3 mb-8">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bénéficiaire :</span>
                  <span className="text-slate-200 font-semibold">PrestaConnect Bénin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Titulaire du profil :</span>
                  <span className="text-slate-200 font-semibold">{userProfile?.full_name || 'Chargement...'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Réseaux inclus :</span>
                  <span className="text-teal-400 font-bold">MTN / Moov / Celtiis / Cartes</span>
                </div>
              </div>

              <button
                disabled={loading || !scriptLoaded || !userProfile}
                onClick={handlePaymentInit}
                className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Lancer le paiement Mobile Money
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Vos transactions sont cryptées et gérées par FedaPay SAS.
              </div>
            </>
          )}

          {/* Interface de Succès instantané */}
          {paymentStatus === 'success' && (
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Transaction complétée !</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                Votre paiement a été reçu. Notre cellule d'ambassadeurs régionaux procède à la vérification finale de votre dossier.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="mt-6 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Aller sur mon tableau de bord
              </button>
            </div>
          )}

          {/* Interface d'Échec */}
          {paymentStatus === 'error' && (
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Paiement non finalisé</h3>
              <p className="text-xs text-slate-400 mt-2">
                L'opération a été annulée ou le solde de votre compte Mobile Money est insuffisant.
              </p>
              <button 
                onClick={() => setPaymentStatus('idle')}
                className="mt-6 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Réessayer le paiement
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}