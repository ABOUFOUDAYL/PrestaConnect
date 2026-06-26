"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const { authUser, loading } = useAuth();
  const [stats, setStats] = useState([
    { label: "Demandes", value: 0, icon: "📋", color: "var(--color-primary-500)" },
    { label: "Devis reçus", value: 0, icon: "📄", color: "var(--color-secondary-500)" },
    { label: "Favoris", value: 0, icon: "❤️", color: "var(--color-error-500)" },
    { label: "Contacts débloqués", value: 0, icon: "🔓", color: "var(--color-success-500)" },
    { label: "Conversations", value: 0, icon: "💬", color: "var(--color-info-500)" },
  ]);
  const [recentDemandes, setRecentDemandes] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // Attendre que l'authentification soit complètement résolue
    if (loading || !authUser?.id) return;

    async function loadData() {
      setDataLoading(true);
      const userId = authUser.id;

      try {
        const [
          { count: demandesCount, error: err1 }, 
          { count: devisCount, error: err2 }, 
          { count: favorisCount, error: err3 }, 
          { count: contactsCount, error: err4 }, 
          { count: convsCount, error: err5 }
        ] = await Promise.all([
          supabase.from("demandes").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("devis").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("favoris").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("contacts_debloques").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("conversations").select("*", { count: "exact", head: true }).eq("client_id", userId),
        ]);

        // Tracer les erreurs si l'une des requêtes de comptage échoue
        if (err1 || err2 || err3 || err4 || err5) {
          console.error("Erreur lors de la récupération des statistiques:", { err1, err2, err3, err4, err5 });
        }

        setStats([
          { label: "Demandes", value: demandesCount || 0, icon: "📋", color: "var(--color-primary-500)" },
          { label: "Devis reçus", value: devisCount || 0, icon: "📄", color: "var(--color-secondary-500)" },
          { label: "Favoris", value: favorisCount || 0, icon: "❤️", color: "var(--color-error-500)" },
          { label: "Contacts débloqués", value: contactsCount || 0, icon: "🔓", color: "var(--color-success-500)" },
          { label: "Conversations", value: convsCount || 0, icon: "💬", color: "var(--color-info-500)" },
        ]);

        const { data: demandes, error: demandesError } = await supabase.from("demandes").select("*").eq("client_id", userId).order("created_at", { ascending: false }).limit(5);
        const { data: messages, error: messagesError } = await supabase.from("messages").select("*").eq("receiver_id", userId).order("created_at", { ascending: false }).limit(5);

        if (demandesError) console.error("Erreur lors de la récupération des demandes récentes:", demandesError);
        if (messagesError) console.error("Erreur lors de la récupération des messages récents:", messagesError);

        setRecentDemandes(demandes || []);
        setRecentMessages(messages || []);
      } catch (error) {
        console.error("Erreur inattendue lors du chargement des données du tableau de bord:", error);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [authUser?.id, loading]);

  // Afficher un état de chargement pendant la résolution de l'authentification
  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Chargement...</div>;
  }

  return (
    <div>
      <WelcomeBanner userName={authUser?.full_name?.trim() || "Client"} />

      {/* 🔍 BLOC DEBUG TEMPORAIRE — à retirer une fois le bug résolu */}
      <pre style={{
        fontSize: 10,
        background: "#eee",
        padding: 8,
        marginBottom: "var(--space-4)",
        wordBreak: "break-all",
        whiteSpace: "pre-wrap",
        border: "1px solid #ccc",
        borderRadius: 8,
      }}>
        {"loading: " + String(loading) + "\n\n"}
        {"dataLoading: " + String(dataLoading) + "\n\n"}
        {"authUser: " + JSON.stringify(authUser, null, 2)}
      </pre>
      {/* 🔍 FIN BLOC DEBUG */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--space-4)",
        marginBottom: "var(--space-8)",
        opacity: dataLoading ? 0.6 : 1, // Optionnel : assombrir pendant l'actualisation des données
        transition: "opacity 0.2s ease"
      }}>
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-6)",
        opacity: dataLoading ? 0.6 : 1,
        transition: "opacity 0.2s ease"
      }}>
        <RecentActivity title="Demandes récentes" items={recentDemandes} />
        <RecentActivity title="Messages récents" items={recentMessages} />
      </div>
    </div>
  );
}