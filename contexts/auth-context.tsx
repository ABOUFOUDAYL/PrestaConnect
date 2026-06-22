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
    const loadUser = async (user: any) => {
      // Si pas d'user (déconnexion), on remet à null
      if (!user) {
        setAuthUser(null);
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .single();

      if (prof) {
        setAuthUser({
          id: user.id,
          role: prof.role,
          full_name: `${prof.prenom || ''} ${prof.nom || ''}`.trim() || prof.full_name || '',
          profile: prof,
        });
      } else {
        // Profil pas encore créé mais user connecté
        setAuthUser({
          id: user.id,
          role: null,
          full_name: '',
          profile: null,
        });
      }
      setLoading(false);
    };

    // Charger l'utilisateur au démarrage
    supabase.auth.getUser().then(({ data: { user } }) => loadUser(user));

    // Écouter connexion ET déconnexion
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
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