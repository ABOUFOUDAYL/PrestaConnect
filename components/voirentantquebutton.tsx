"use client";  // ← ajoute cette ligne tout en haut
// ... reste du code identique
import { useState } from "react";
import { useImpersonation, ROLES } from "../contexts/ImpersonationContext";

const ROLE_COLORS = {
  client:      { bg: "#dbeafe", text: "#1e40af" },
  prestataire: { bg: "#dcfce7", text: "#166534" },
  visiteur:    { bg: "#fef9c3", text: "#854d0e" },
  admin:       { bg: "#f1f5f9", text: "#475569" },
};

export function VoirEnTantQueButton({ users = [] }) {
  const { currentUser, isImpersonating, startImpersonation, stopImpersonation } = useImpersonation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (currentUser?.role !== ROLES.ADMIN) return null;

  if (isImpersonating) return (
    <button onClick={stopImpersonation} style={btn("#ea580c", "#fff")}>
      ✕ Arrêter l'observation
    </button>
  );

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(v => !v)} style={btn("#1e293b", "#fff")}>
        👁 Voir en tant que…
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 300, background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.1)", zIndex: 999,
        }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <input
              autoFocus
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", border: "1px solid #e2e8f0", borderRadius: 6,
                padding: "6px 10px", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: "6px 0", maxHeight: 260, overflowY: "auto" }}>
            {filtered.map(u => {
              const c = ROLE_COLORS[u.role] ?? ROLE_COLORS.admin;
              return (
                <li key={u.id}>
                  <button
                    onClick={() => { startImpersonation(u); setOpen(false); setSearch(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "8px 14px",
                      background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: c.bg, color: c.text,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 7px", borderRadius: 99,
                      background: c.bg, color: c.text,
                      textTransform: "uppercase", fontWeight: 700,
                    }}>
                      {u.role}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function btn(bg, color) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: bg, color, border: "none", borderRadius: 7,
    padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  };
}