"use client";  // ← ajoute cette ligne tout en haut
// ... reste du code identique
import { useImpersonation, ROLES } from "../contexts/ImpersonationContext";

const NAV = {
  [ROLES.ADMIN]: [
    { label: "Cockpit admin", path: "/admin" },
    { label: "Utilisateurs", path: "/admin/users" },
    { label: "Prestataires", path: "/admin/prestataires" },
    { label: "Statistiques", path: "/admin/stats" },
  ],
  [ROLES.CLIENT]: [
    { label: "Accueil", path: "/" },
    { label: "Trouver un prestataire", path: "/prestataires" },
    { label: "Mes demandes", path: "/demandes" },
    { label: "Mon profil", path: "/profil" },
  ],
  [ROLES.PRESTATAIRE]: [
    { label: "Tableau de bord", path: "/dashboard" },
    { label: "Mes missions", path: "/missions" },
    { label: "Mon profil pro", path: "/profil-pro" },
    { label: "Avis reçus", path: "/avis" },
  ],
  [ROLES.VISITEUR]: [
    { label: "Accueil", path: "/" },
    { label: "Trouver un prestataire", path: "/prestataires" },
    { label: "Devenir prestataire", path: "/devenir-prestataire" },
  ],
};

export function Sidebar({ currentPath = "/" }) {
  const { activeUser } = useImpersonation();
  const role = activeUser?.role ?? ROLES.VISITEUR;
  const items = NAV[role] ?? NAV[ROLES.VISITEUR];

  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: "#f8fafc",
      borderRight: "1px solid #e2e8f0", padding: "24px 0",
    }}>
      <div style={{
        padding: "0 16px 20px", fontSize: 11, fontWeight: 700,
        color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        Navigation
      </div>
      <nav>
        {items.map(item => (
          <a key={item.path} href={item.path} style={{
            display: "block", padding: "9px 16px",
            fontSize: 14, fontWeight: currentPath === item.path ? 600 : 400,
            color: currentPath === item.path ? "#0f172a" : "#475569",
            background: currentPath === item.path ? "#e2e8f0" : "none",
            textDecoration: "none", borderRadius: "0 8px 8px 0", marginRight: 8,
          }}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}