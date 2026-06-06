'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ImpersonatedUser = {
  id: string;
  name: string;
  role: 'client' | 'artisan' | 'prestataire' | 'admin';
};

type ImpersonationContextType = {
  impersonated: ImpersonatedUser | null;
  isImpersonating: boolean;
  startImpersonation: (user: ImpersonatedUser) => void;
  stopImpersonation: () => void;
};

const ImpersonationContext = createContext<ImpersonationContextType>({
  impersonated: null,
  isImpersonating: false,
  startImpersonation: () => {},
  stopImpersonation: () => {},
});

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonated, setImpersonated] = useState<ImpersonatedUser | null>(null);

  const startImpersonation = useCallback((user: ImpersonatedUser) => {
    setImpersonated(user);
  }, []);

  const stopImpersonation = useCallback(() => {
    setImpersonated(null);
  }, []);

  return (
    <ImpersonationContext.Provider value={{
      impersonated,
      isImpersonating: impersonated !== null,
      startImpersonation,
      stopImpersonation,
    }}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  return useContext(ImpersonationContext);
}