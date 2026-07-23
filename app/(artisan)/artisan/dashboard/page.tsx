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

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle()
      setProfile(prof)

      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      setPrestataire(presta)

      if (presta) {
        const { data: demandesOuvertes, count: demandesCount } = await supabase
          .from('demandes')
          .select('*', { count: 'exact' })
          .eq('status', 'Ouvert')
          .eq('metier_type', presta.metier)
          .order('created_at', { ascending: false })

        const { data: deblocages } = await supabase
          .from('deblocages_demandes')
          .select('demande_id')
          .eq('artisan_id', user.id)

        const demandeIdsDebloquees = (deblocages || []).map((d) => d.demande_id)

        let missionsCount = 0
        if (demandeIdsDebloquees.length > 0) {
          const { count } = await supabase
            .from('demandes')
            .select('*', { count: 'exact', head: true })
            .in('id', demandeIdsDebloquees)
            .eq('status', 'En cours')
          missionsCount = count || 0
        }

        const { data: wallet } = await supabase
          .from('wallet')
          .select('solde')
          .eq('user_id', user.id)
          .maybeSingle()

        const { data: convs } = await supabase
          .from('conversations')
          .select('id')
          .eq('artisan_id', user.id)

        const convIds = (convs || []).map((c) => c.id)

        let messages: any[] = []
        if (convIds.length > 0) {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .in('conversation_id', convIds)
            .neq('sender_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3)
          messages = msgs || []
        }

        setStats({
          demandes: demandesCount || 0,
          devis: 0,
          missions: missionsCount,
          credits: wallet?.solde || 0,
          note: presta.note || 0,
        })

        setRecentDemandes((demandesOuvertes || []).slice(0, 3))
        setRecentMessages(messages)
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

  const firstName = profile?.prenom || prestataire?.nom || 'Artisan'

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
    { label: 'Devis envoyés', value: stats.devis, icon: <Send size={22} />, color: '#f97316', bg: '#fff7ed', note: 'Bientôt disponible' },
    { label: 'Missions en cours', value: stats.missions, icon: <Wrench size={22} />, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Crédits disponibles', value: stats.credits, icon: <CreditCard size={22} />, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Note moyenne', value: stats.note > 0 ? stats.note.toFixed(1) : 'N/A', icon: <Star size={22} />, color: '#ca8a04', bg: '#fefce8' },
  ]

  return (
    <div style={{ padding: '0' }}>

      <div style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f97316, #ea580c)', padding: '24px', marginBottom: '24px', color: 'white' }}>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 4px' }}>{getGreeting()} 👋</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>{firstName}</h1>
        <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
          {prestataire?.metier || 'Artisan'} · {profile?.ville || 'Bénin'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s: any) => (
          <div key={s.label} style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{s.value}</p>
              {s.note && <p style={{ fontSize: '10px', color: '#cbd5e1', margin: '2px 0 0' }}>{s.note}</p>}
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

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
                  {d.service_nom || d.description?.slice(0, 40) || 'Demande'}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  {d.ville} · {new Date(d.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))
          )}
        </div>

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
                  {(m.texte || m.content)?.slice(0, 50) || 'Message'}
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