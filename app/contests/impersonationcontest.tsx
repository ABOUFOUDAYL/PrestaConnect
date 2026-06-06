"use client";  // ← ajoute cette ligne tout en haut

import { createContext, useContext, useState, useCallback } from "react";
// ... reste du code identique
import { createContext, useContext, useState, useCallback } from "react";

const ImpersonationContext = createContext(null);

export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  PRESTATAIRE: "prestataire",
  VISITEUR: "visiteur",
};

export function ImpersonationProvider({ children, currentUser }) {
  const [observedUser, setObservedUser] = useState(null);

  const activeUser = observedUser ?? currentUser;

  const startImpersonation = useCallback((user) => {
    if (currentUser?.role !== ROLES.ADMIN) return;
    setObservedUser(user);
  }, [currentUser]);

  const stopImpersonation = useCallback(() => setObservedUser(null), []);

  return (
    <ImpersonationContext.Provider value={{
      currentUser,
      observedUser,
      activeUser,
      isImpersonating: observedUser !== null,
      startImpersonation,
      stopImpersonation,
    }}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) throw new Error("useImpersonation doit être dans ImpersonationProvider");
  return ctx;
}