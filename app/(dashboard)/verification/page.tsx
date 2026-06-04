'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Clock, XCircle, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function VerificationGuardPage() {
  const [status, setStatus] = useState<'en_attente_validation' | 'rejete' | 'valide' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (!userId) {
          router.push('/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (profile?.status === 'valide') {
          // Si l'artisan est validé entre-temps, on le libère
          router.push('/dashboard');
        } else {
          setStatus(profile?.status || 'en_attente_validation');
        }
      } catch (err) {
        console.error('Erreur vérification statut:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
        <p className="text-sm text-slate-500 mt-3 font-medium">Vérification de vos accès...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        
        {status === 'rejete' ? (
          /* CAS 1 : DOSSIER REJETÉ */
          <>
            <div className="h-14 w-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
              <XCircle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dossier non validé</h1>
            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              Après examen de vos pièces justificatives, nos ambassadeurs n'ont pas pu approuver votre profil (document illisible ou non conforme).
            </p>
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Que faire ?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Veuillez contacter notre support ou soumettre à nouveau des photos bien nettes de votre CIP et de vos diplômes d'artisan.
              </p>
            </div>
            <button
              onClick={() => router.push('/register/provider')}
              className="w-full h-11 bg-[#3b82f6] text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition-all mt-6 shadow-sm"
            >
              Soumettre à nouveau mes pièces
            </button>
          </>
        ) : (
          /* CAS 2 : DOSSIER EN ATTENTE */
          <>
            <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-100 animate-pulse">
              <Clock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vérification en cours...</h1>
            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              Votre dossier d'artisan a bien été reçu ! Un ambassadeur local procède actuellement à la vérification de vos pièces d'identité au Bénin.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Cette opération prend généralement moins de 24 heures.
            </p>
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
              <a 
                href="https://wa.me/22901000000" // Remplacer par ton vrai numéro WhatsApp support
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> Contacter un ambassadeur sur WhatsApp
              </a>
            </div>
          </>
        )}

        <button
          onClick={() => {
            supabase.auth.signOut();
            router.push('/');
          }}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mx-auto mt-6 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Se déconnecter
        </button>

      </div>
    </div>
  );
}