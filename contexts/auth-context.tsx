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
      if (!user) {
        setAuthUser(null);
        setLoading(false);
        return;
      }

      // ✅ Requête simplifiée et fiable
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('DEBUG profil:', { userId: user.id, prof, profError });

      if (prof) {
        setAuthUser({
          id: user.id,
          role: prof.role,
          // ✅ On utilise full_name en priorité, prenom/nom en secours seulement
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
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => loadUser(user));

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