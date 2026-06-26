'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type AuthUser = {
  id: string;
  role: 'client' | 'prestataire' | 'admin' | 'artisan' | 'ambassadeur' | null;
  full_name: string;
  profile: any;
};

type AuthContextType = {
  authUser: AuthUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ authUser: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Empêche les mises à jour d'état si le composant est démonté

    const loadUser = async (user: any) => {
      try {
        if (!user) {
          if (isMounted) setAuthUser(null);
          return;
        }

        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('DEBUG profil:', { userId: user.id, prof, profError });

        if (profError) {
          console.error('Erreur Supabase lors de la récupération du profil:', profError);
        }

        if (isMounted) {
          if (prof) {
            setAuthUser({
              id: user.id,
              role: prof.role,
              full_name:
                prof.full_name?.trim() ||
                `${prof.prenom || ''} ${prof.nom || ''}`.trim() ||
                '',
              profile: prof,
            });
          } else {
            setAuthUser({
              id: user.id,
              role: null,
              full_name: '',
              profile: null,
            });
          }
        }
      } catch (error) {
        console.error('Erreur inattendue dans loadUser:', error);
        if (isMounted) setAuthUser(null);
      } finally {
        // TRÈS IMPORTANT : S'exécute TOUJOURS, succès ou échec.
        if (isMounted) setLoading(false);
      }
    };

    // 1. On initialise la session avec getSession() (plus rapide et stable côté client)
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        await loadUser(session?.user ?? null);
      } catch (error) {
        console.error('Erreur initSession:', error);
        if (isMounted) {
          setAuthUser(null);
          setLoading(false);
        }
      }
    };

    initSession();

    // 2. On écoute les changements futurs (connexion, déconnexion)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AUTH STATE CHANGE:', { event: _event, session });
      // On ne recharge le profil que s'il y a un vrai changement
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'SIGNED_OUT') {
        await loadUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}