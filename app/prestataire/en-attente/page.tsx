'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function EnAttentePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setChecking(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }

        const { data: profile } = await supabase
          .from('profiles')
          .select('status, role')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile) return;

        if (profile.status === 'valide' || profile.role === 'artisan') {
          router.replace('/dashboard');
        } else if (profile.status === 'rejete') {
          router.replace('/inscription?erreur=rejete');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };

    // Vérifie immédiatement au chargement
    checkStatus();

    // Puis toutes les 10 secondes
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [router]);

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
      {checking && (
        <p className="text-xs text-gray-400">Vérification du statut en cours...</p>
      )}
      <p className="text-xs text-gray-400">
        Cette page se met à jour automatiquement.
      </p>
      <a href="/" className="mt-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
        Retour au site
      </a>
    </div>
  );
}