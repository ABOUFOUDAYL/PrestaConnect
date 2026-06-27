'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Send, Wrench, CreditCard, Star, Clock } from 'lucide-react'

export default function ArtisanDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [prestataire, setPrestataire] = useState<any>(null)
  const [stats, setStats] = useState({
    demandes: 0,
    devis: 0,
    missions: 0,
    credits: 0,
    note: 0,
  })
  const [recentDemandes, setRecentDemandes] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      // Charger profil
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .single()
      setProfile(prof)

      // Charger prestataire
      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setPrestataire(presta)

      if (presta) {
        // Charger stats en parallèle
        const [demandesRes, devisRes, missionsRes, messagesRes] = await Promise.all([
          supabase.from('demandes').select('*', { count: 'exact', head: true }).eq('prestataire_id', presta.id),
          supabase.from('devis').select('*', { count: 'exact', head: true }).eq('prestataire_id', presta.id),
          supabase.from('demandes').select('*', { count: 'exact', head: true }).eq('prestataire_id', presta.id).eq('statut', 'En cours'),
          supabase.from('messages').select('*').eq('receiver_id', user.id).order('created_at', { ascending: false }).limit(3),
        ])

        // Crédits depuis wallet
        const { data: wallet } = await supabase
          .from('wallet')
          .select('credits')
          .eq('user_id', user.id)
          .single()

        // Demandes récentes
        const { data: demandes } = await supabase
          .from('demandes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        setStats({
          demandes: demandesRes.count || 0,
          devis: devisRes.count || 0,
          missions: missionsRes.count || 0,
          credits: wallet?.credits || 0,
          note: presta.note_moyenne || 0,
        })

        setRecentDemandes(demandes || [])
        setRecentMessages(messagesRes.data || [])
      }

      setIsLoading(false)
    }

    load()
  }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const firstName = profile?.prenom || prestataire?.prenom || 'Artisan'

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Demandes reçues', value: stats.demandes, icon: <FileText size={22} />, color: '#e63946', bg: '#fff1f2' },
    { label: 'Devis envoyés', value: stats.devis, icon: <Send size={22} />, color: '#f97316', bg: '#fff7ed' },
    { label: 'Missions en cours', value: stats.missions, icon: <Wrench size={22} />, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Crédits disponibles', value: stats.credits, icon: <CreditCard size={22} />, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Note moyenne', value: stats.note > 0 ? stats.note.toFixed(1) : 'N/A', icon: <Star size={22} />, color: '#ca8a04', bg: '#fefce8' },
  ]

  return (
    <div style={{ padding: '0' }}>

      {/* Bandeau de bienvenue */}
      <div style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f97316, #ea580c)', padding: '24px', marginBottom: '24px', color: 'white' }}>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 4px' }}>{getGreeting()} 👋</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>{firstName}</h1>
        <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
          {prestataire?.metier || 'Artisan'} · {profile?.ville || 'Bénin'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{s.value}</p>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Activité récente */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Demandes récentes */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#94a3b8" /> Demandes récentes
          </h2>
          {recentDemandes.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Aucune demande pour le moment</p>
          ) : (
            recentDemandes.map((d) => (
              <div key={d.id} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>
                  {d.titre || d.description?.slice(0, 40) || 'Demande'}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  {d.ville} · {new Date(d.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Messages récents */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#94a3b8" /> Messages récents
          </h2>
          {recentMessages.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Aucun message pour le moment</p>
          ) : (
            recentMessages.map((m) => (
              <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>
                  {m.texte?.slice(0, 50) || 'Message'}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  {new Date(m.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}