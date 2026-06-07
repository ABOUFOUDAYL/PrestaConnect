'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function EnAttentePage() {
  const router = useRouter();
  const [statut, setStatut] = useState<'chargement' | 'attente' | 'valide' | 'rejete'>('chargement');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Pas encore de session — on attend sans rediriger
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('statut_verification, role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile) return;

        if (profile.statut_verification === 'valide' || profile.role === 'artisan') {
          setStatut('valide');
          clearInterval(interval);
          router.replace('/dashboard');
        } else if (profile.statut_verification === 'rejete') {
          setStatut('rejete');
          clearInterval(interval);
          router.replace('/inscription?erreur=rejete');
        } else {
          setStatut('attente');
        }
      } catch (err) {
        console.error(err);
        setStatut('attente');
      }
    };

    // Attend 1 seconde avant le premier check (session pas encore chargée)
    const timeout = setTimeout(() => {
      checkStatus();
      interval = setInterval(checkStatus, 10000);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [router]);

  if (statut === 'chargement') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
      </div>
      <h1 className="text-3xl font-bold text-yellow-600">Compte en attente de validation</h1>
      <p className="text-gray-600 max-w-md">
        Votre inscription a bien été reçue. Un administrateur va examiner
        votre profil et vous contacter sous peu.
      </p>
      <p className="text-xs text-gray-400">
        Cette page se met à jour automatiquement toutes les 10 secondes.
      </p>
      <a href="/" className="mt-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
        Retour au site
      </a>
    </div>
  );
}