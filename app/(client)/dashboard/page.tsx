import WelcomeBanner from "@/components/dashboard/WelcomeBanner"
import StatsCard from "@/components/dashboard/StatsCard"
import RecentActivity from "@/components/dashboard/RecentActivity"

const stats = [
  { label: "Demandes", value: 3, icon: "📋", color: "var(--color-primary-500)" },
  { label: "Devis reçus", value: 7, icon: "📄", color: "var(--color-secondary-500)" },
  { label: "Favoris", value: 12, icon: "❤️", color: "var(--color-error-500)" },
  { label: "Contacts débloqués", value: 2, icon: "🔓", color: "var(--color-success-500)" },
  { label: "Conversations", value: 5, icon: "💬", color: "var(--color-info-500)" },
]

const recentDemandes = [
  { id: "1", type: "demande" as const, title: "Plombier urgence", description: "Fuite sous évier cuisine", date: "Aujourd'hui", status: "En attente" },
  { id: "2", type: "demande" as const, title: "Electricien", description: "Installation prise extérieure", date: "Hier", status: "En cours" },
]

const recentMessages = [
  { id: "1", type: "message" as const, title: "Jean Kouassi", description: "Bonjour, je suis disponible demain matin...", date: "Il y a 2h" },
  { id: "2", type: "message" as const, title: "Marie Adjobi", description: "Voici mon devis pour les travaux...", date: "Hier" },
]

export default function DashboardPage() {
  return (
    <div>
      <WelcomeBanner userName="SAYO ISSA" />

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
  )
}