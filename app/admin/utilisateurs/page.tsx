"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialisation simple du client Supabase pour le front
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  user_id: string;
  email: string | null;
  nom: string | null;
  prenom: string | null;
  role: string;
  assigned_zone: string | null;
};

export default function AdminUtilisateursPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, email, nom, prenom, role, assigned_zone");
    
    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: string, currentZone: string | null) {
    const res = await fetch("/api/admin/update-role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole, assigned_zone: currentZone }),
    });

    if (res.ok) {
      alert("Rôle mis à jour avec succès !");
      fetchProfiles();
    } else {
      alert("Erreur lors de la mise à jour.");
    }
  }

  async function handleZoneChange(userId: string, currentRole: string, newZone: string) {
    const res = await fetch("/api/admin/update-role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: currentRole, assigned_zone: newZone }),
    });

    if (res.ok) {
      fetchProfiles();
    }
  }

  if (loading) return <div className="p-6">Chargement des utilisateurs...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des Rôles & Ambassadeurs</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Rôle actuel</th>
              <th className="p-4">Zone assignée</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.user_id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{p.nom || ""} {p.prenom || ""}</div>
                  <div className="text-sm text-gray-500">{p.email}</div>
                </td>
                <td className="p-4">
                  <select
                    value={p.role || "client"}
                    onChange={(e) => handleRoleCheckAndChange(p.user_id, e.target.value, p.assigned_zone)}
                    className="border rounded p-1 text-sm bg-white"
                  >
                    <option value="client">Client</option>
                    <option value="artisan">Artisan</option>
                    <option value="ambassadeur">Ambassadeur</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    defaultValue={p.assigned_zone || ""}
                    placeholder="Ex: Parakou"
                    className="border rounded p-1 text-sm w-full max-w-xs"
                    onBlur={(e) => handleZoneChange(p.user_id, p.role, e.target.value)}
                  />
                  <span className="text-xs text-gray-400 block mt-1">Cliquer en dehors pour enregistrer</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  function handleRoleCheckAndChange(userId: string, newRole: string, currentZone: string | null) {
    handleRoleChange(userId, newRole, currentZone);
  }
}