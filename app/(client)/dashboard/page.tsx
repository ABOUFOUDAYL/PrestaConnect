"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, MessageSquare, Heart, Clock, User } from "lucide-react";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    demandes: 0,
    devis: 0,
    conversations: 0,
    favoris: 0,
  });
  const [recentDemandes, setRecentDemandes] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      // Attendre que la session soit disponible
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        // Écouter le changement d'état auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            subscription.unsubscribe();
            await loadData(session.user);
          }
        });
        return;
      }

      await loadData(currentUser);
    };

    const loadData = async (currentUser: any) => {
      setUser(currentUser);
      const userId = currentUser.id;

      // Charger le profil
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .single();
      setProfile(prof);

      // Charger les stats en parallèle
      const [demandesRes, devisRes, conversationsRes, favorisRes] = await Promise.all([
        supabase.from("demandes").select("*", { count: "exact" }).eq("client_id", userId).order("created_at", { ascending: false }).limit(5),
        supabase.from("devis").select("*", { count: "exact", head: true }).eq("client_id", userId),
        supabase.from("conversations").select("*", { count: "exact", head: true }).eq("client_id", userId),
        supabase.from("favoris").select("*", { count: "exact", head: true }).eq("user_id", userId),
      ]);

      setRecentDemandes(demandesRes.data || []);
      setStats({
        demandes: demandesRes.count || 0,
        devis: devisRes.count || 0,
        conversations: conversationsRes.count || 0,
        favoris: favorisRes.count || 0,
      });

      setIsLoading(false);
    };

    init();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const firstName = profile?.prenom || profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Chargement de votre espace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">

      {/* En-tête de bienvenue */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600 to-red-400 p-6 text-white">
        <p className="text-red-100 text-sm font-medium">{getGreeting()} 👋</p>
        <h1 className="text-2xl font-bold mt-1">{firstName}</h1>
        <p className="text-red-100 text-sm mt-1">Que recherchez-vous aujourd'hui ?</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Mes demandes</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.demandes}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Devis reçus</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.devis}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Messages</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.conversations}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Favoris</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.favoris}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" /> Activité récente
        </h2>

        {recentDemandes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-500 font-medium">Aucune activité pour le moment</p>
            <p className="text-gray-400 text-xs mt-1">Vos dernières demandes apparaîtront ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-3">Demande</th>
                  <th className="px-4 py-3">Ville</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                        <User className="w-4 h-4" />
                      </div>
                      {demande.titre || demande.description?.slice(0, 40) || "Demande sans titre"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {demande.ville || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-xs">
                      {new Date(demande.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}