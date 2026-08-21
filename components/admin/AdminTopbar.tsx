"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminTopbar() {
  const [nomAdmin, setNomAdmin] = useState("Administrateur");

  useEffect(() => {
    async function fetchAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, nom, prenom")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setNomAdmin(profile.full_name);
      } else if (profile?.prenom || profile?.nom) {
        setNomAdmin(`${profile.prenom || ""} ${profile.nom || ""}`.trim());
      }
    }
    fetchAdmin();
  }, []);

  const initiale = nomAdmin.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div className="flex items-center gap-4 ml-6">
        <span className="text-sm text-gray-500">{nomAdmin}</span>
        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
          {initiale}
        </div>
      </div>
    </header>
  );
}