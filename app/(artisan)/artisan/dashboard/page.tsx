'use client'

import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentActivity from '@/components/dashboard/RecentActivity'

const stats = [
  { label: 'Demandes reçues', value: 8, icon: '📋', color: 'var(--color-primary-500)' },
  { label: 'Devis envoyés', value: 5, icon: '📄', color: 'var(--color-secondary-500)' },
  { label: 'Missions en cours', value: 3, icon: '🔧', color: 'var(--color-success-500)' },
  { label: 'Crédits disponibles', value: 24, icon: '💳', color: 'var(--color-info-500)' },
  { label: 'Note moyenne', value: 4.8, icon: '⭐', color: 'var(--color-warning-500)' },
]

const recentDemandes = [
  { id: '1', type: 'demande' as const, title: 'Plomberie urgente', description: 'Fuite sous évier - Cotonou', date: "Aujourd'hui", status: 'En attente' },
  { id: '2', type: 'demande' as const, title: 'Electricité', description: 'Installation tableau électrique', date: 'Hier', status: 'En cours' },
  { id: '3', type: 'demande' as const, title: 'Menuiserie', description: 'Fabrication armoire sur mesure', date: 'Il y a 2j', status: 'Terminé' },
]

const recentMessages = [
  { id: '1', type: 'message' as const, title: 'Kofi Mensah', description: 'Bonjour, êtes-vous disponible...', date: 'Il y a 1h' },
  { id: '2', type: 'message' as const, title: 'Aïcha Diallo', description: 'Merci pour votre devis...', date: 'Hier' },
]

export default function ArtisanDashboardPage() {
  return (
    <div>
      <WelcomeBanner userName="Artisan" />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}>
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-6)',
      }}>
        <RecentActivity title="Demandes récentes" items={recentDemandes} />
        <RecentActivity title="Messages récents" items={recentMessages} />
      </div>
    </div>
  )
}
