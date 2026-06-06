"use client";  // ← ajoute cette ligne tout en haut

import { useImpersonation } from "../../contexts/ImpersonationContext";
// ... reste du code identique
import { useImpersonation } from "../contexts/ImpersonationContext";

export function ImpersonationBanner() {
  const { isImpersonating, observedUser, stopImpersonation } = useImpersonation();
  if (!isImpersonating) return null;

  return (
    <div style={{
      background: "#ea580c", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 20px", fontSize: 13, fontWeight: 500,
      position: "sticky", top: 0, zIndex: 1000,
    }}>
      <span>
        👁 Vous observez en tant que <strong>{observedUser.name}</strong>
        &nbsp;·&nbsp;
        <span style={{
          background: "rgba(255,255,255,0.2)", padding: "1px 8px",
          borderRadius: 99, fontSize: 11, textTransform: "uppercase",
        }}>
          {observedUser.role}
        </span>
      </span>
      <button onClick={stopImpersonation} style={{
        background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
        color: "#fff", borderRadius: 6, padding: "3px 12px",
        fontSize: 12, cursor: "pointer", fontWeight: 600,
      }}>
        ✕ Quitter l'observation
      </button>
    </div>
  );
}