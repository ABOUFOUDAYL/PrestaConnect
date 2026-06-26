"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const { authUser, loading: authLoading } = useAuth();
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
    // On attend que l'authentification soit terminée
    if (authLoading || !authUser?.id) return;

    async function loadData() {
      setDataLoading(true);
      const userId = authUser.id;

      try {
        // Chargement parallèle des compteurs
        const [
          { count: demandesCount }, { count: devisCount }, 
          { count: favorisCount }, { count: contactsCount }, { count: convsCount }
        ] = await Promise.all([
          supabase.from("demandes").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("devis").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("favoris").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("contacts_debloques").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("conversations").select("*", { count: "exact", head: true }).eq("client_id", userId),
        ]);

        setStats([
          { label: "Demandes", value: demandesCount || 0, icon: "📋", color: "var(--color-primary-500)" },
          { label: "Devis reçus", value: devisCount || 0, icon: "📄", color: "var(--color-secondary-500)" },
          { label: "Favoris", value: favorisCount || 0, icon: "❤️", color: "var(--color-error-500)" },
          { label: "Contacts débloqués", value: contactsCount || 0, icon: "🔓", color: "var(--color-success-500)" },
          { label: "Conversations", value: convsCount || 0, icon: "💬", color: "var(--color-info-500)" },
        ]);

        // Chargement des listes récentes
        const { data: demandes } = await supabase.from("demandes").select("*").eq("client_id", userId).order("created_at", { ascending: false }).limit(5);
        const { data: messages } = await supabase.from("messages").select("*").eq("receiver_id", userId).order("created_at", { ascending: false }).limit(5);

        setRecentDemandes(demandes || []);
        setRecentMessages(messages || []);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [authUser?.id, authLoading]);

  // État de chargement initial
  if (authLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Authentification en cours...</div>;

  return (
    <div>
      <WelcomeBanner userName={authUser?.full_name?.trim() || "Client"} />

      {dataLoading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>Chargement de vos données...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
            {stats.map((stat) => <StatsCard key={stat.label} {...stat} />)}
          </div>

          {(recentDemandes.length > 0 || recentMessages.length > 0) ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
              <RecentActivity title="Demandes récentes" items={recentDemandes} />
              <RecentActivity title="Messages récents" items={recentMessages} />
            </div>
          ) : (
            <div style={{ padding: "3rem", textAlign: "center", border: "2px dashed #e5e7eb", borderRadius: "12px", color: "#6b7280" }}>
              <p>Aucune activité pour le moment. Votre tableau de bord est prêt !</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}