"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Hammer, Users, ClipboardList, Package } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    artisans: 0,
    clients: 0,
    enAttente: 0,
    commandes: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [{ count: artisans }, { count: clients }, { count: enAttente }, { count: commandes }] =
        await Promise.all([
          supabase.from("prestataires").select("*", { count: "exact", head: true }),
          supabase.from("clients").select("*", { count: "exact", head: true }),
          supabase.from("prestataires").select("*", { count: "exact", head: true }).eq("statut", "en_attente"),
          supabase.from("bookings").select("*", { count: "exact", head: true }),
        ]);

      setStats({
        artisans: artisans || 0,
        clients: clients || 0,
        enAttente: enAttente || 0,
        commandes: commandes || 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
        <p className="text-orange-100 text-sm mb-1">Bonjour</p>
        <h1 className="text-3xl font-bold">Panel Admin</h1>
        <p className="text-orange-100 mt-1">Gestion de la plateforme PrestaConnect</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Artisans", value: stats.artisans, icon: Hammer },
          { label: "Clients", value: stats.clients, icon: Users },
          { label: "En attente", value: stats.enAttente, icon: ClipboardList },
          { label: "Commandes", value: stats.commandes, icon: Package },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <Icon className="w-6 h-6 text-orange-500" strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}