"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import WelcomeBanner from "@/components/client/WelcomeBanner";
import StatsCard from "@/components/client/StatsCard";
import RecentActivity from "@/components/client/RecentActivity";

export default function DashboardPage() {
  const { authUser } = useAuth();
  const [stats, setStats] = useState([
    { label: "Demandes", value: 0, icon: "📋", color: "var(--color-primary-500)" },
    { label: "Devis reçus", value: 0, icon: "📄", color: "var(--color-secondary-500)" },
    { label: "Favoris", value: 0, icon: "❤️", color: "var(--color-error-500)" },
    { label: "Contacts débloqués", value: 0, icon: "🔓", color: "var(--color-success-500)" },
    { label: "Conversations", value: 0, icon: "💬", color: "var(--color-info-500)" },
  ]);
  const [recentDemandes, setRecentDemandes] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (!authUser) return;
    const supabase = createClient();

    async function loadData() {
      const userId = authUser.id;

      const [{ count: demandesCount }, { count: devisCount }, { count: favorisCount }, { count: contactsCount }, { count: convsCount }] = await Promise.all([
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

      const { data: demandes } = await supabase.from("demandes").select("*").eq("client_id", userId).order("created_at", { ascending: false }).limit(5);
      const { data: messages } = await supabase.from("messages").select("*").eq("receiver_id", userId).order("created_at", { ascending: false }).limit(5);

      setRecentDemandes(demandes || []);
      setRecentMessages(messages || []);
    }

    loadData();
  }, [authUser]);

  return (
    <div>
      <WelcomeBanner userName={authUser?.full_name || "..."} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--space-4)",
        marginBottom: "var(--space-8)",
      }}>
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-6)",
      }}>
        <RecentActivity title="Demandes récentes" items={recentDemandes} />
        <RecentActivity title="Messages récents" items={recentMessages} />
      </div>
    </div>
  );
}
