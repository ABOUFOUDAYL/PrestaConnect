"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminParametres() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtisans: 0,
    totalClients: 0,
    totalAmbassadeurs: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: totalUsers },
        { count: totalArtisans },
        { count: totalClients },
        { count: totalAmbassadeurs },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "artisan"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "ambassadeur"),
      ]);
      setStats({
        totalUsers: totalUsers || 0,
        totalArtisans: totalArtisans || 0,
        totalClients: totalClients || 0,
        totalAmbassadeurs: totalAmbassadeurs || 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <p className="text-orange-100 text-sm mb-1">Administration</p>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-orange-100 mt-1">Configuration de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Statistiques utilisateurs</h2>
          <div className="space-y-3">
            {[
              { label: "Total utilisateurs", value: stats.totalUsers },
              { label: "Artisans", value: stats.totalArtisans },
              { label: "Clients", value: stats.totalClients },
              { label: "Ambassadeurs", value: stats.totalAmbassadeurs },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className="font-bold text-gray-800">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Informations plateforme</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du site</label>
              <input
                type="text"
                defaultValue="PrestaConnect"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
              <input
                type="email"
                placeholder="admin@prestaconnect.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}