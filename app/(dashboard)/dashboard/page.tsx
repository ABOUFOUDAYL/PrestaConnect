'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Phone, Briefcase, Clock, Check, User, MapPin, Star, CreditCard, ShieldCheck, Users, Layers, BarChart3, Zap, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<'client' | 'prestataire' | 'artisan' | 'admin' | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .single()
      if (prof) { setProfile(prof); setRole(prof.role) }
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-400 font-medium">Chargement...</p>
      </div>
    </div>
  )

  if (role === 'admin') return <DashboardAdmin profile={profile} />
  if (role === 'prestataire' || role === 'artisan') return <DashboardPrestataire profile={profile} />
  if (role === 'client') return <DashboardClient profile={profile} />

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Role non defini. Contactez le support.</p>
    </div>
  )
}

// ─── DASHBOARD ADMIN ──────────────────────────────────────────────────────────
function DashboardAdmin({ profile }: { profile: any }) {
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, artisans: 0, ambassadors: 0 })

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabase.from('profiles').select('*')
      const p = data || []
      setMetrics({
        total: p.length,
        pending: p.filter(x => x.status === 'en_attente_validation').length,
        artisans: p.filter(x => x.status === 'valide' && x.role === 'artisan').length,
        ambassadors: p.filter(x => x.role === 'ambassadeur').length,
      })
    }
    fetchMetrics()
  }, [])

  const cards = [
    { icon: Users, label: 'Total inscrits', value: metrics.total, color: 'blue' },
    { icon: Layers, label: 'En attente', value: metrics.pending, color: 'amber' },
    { icon: Briefcase, label: 'Artisans valides', value: metrics.artisans, color: 'emerald' },
    { icon: Star, label: 'Ambassadeurs', value: metrics.ambassadors, color: 'purple' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Administration</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Vue d'ensemble</h1>
          <p className="text-gray-400 mt-1">Bonjour, {profile?.full_name} — Controle total de la plateforme</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
                <Icon size={18} />
              </div>
              <p className="text-3xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin-ambassadeur" className="group bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-6 flex items-center justify-between transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl"><ShieldCheck size={22} /></div>
              <div>
                <p className="font-bold">Cockpit Admin</p>
                <p className="text-xs opacity-70">Gerer les dossiers</p>
              </div>
            </div>
            <ChevronRight size={18} className="opacity-60 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/explore" className="group bg-white border border-gray-100 hover:border-blue-200 rounded-2xl p-6 flex items-center justify-between transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Users size={22} /></div>
              <div>
                <p className="font-bold text-gray-900">Explorer</p>
                <p className="text-xs text-gray-400">Voir les prestataires</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/analytics" className="group bg-white border border-gray-100 hover:border-blue-200 rounded-2xl p-6 flex items-center justify-between transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><BarChart3 size={22} /></div>
              <div>
                <p className="font-bold text-gray-900">Analytiques</p>
                <p className="text-xs text-gray-400">Statistiques plateforme</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD PRESTATAIRE ───────────────────────────────────────────────────
function DashboardPrestataire({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<'disponibles' | 'en_cours'>('disponibles')
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const solde = profile?.solde || 0
  const firstName = profile?.full_name?.split(' ')[0] || profile?.prenom || 'vous'

  useEffect(() => { fetchDemandes() }, [activeTab])

  async function fetchDemandes() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let query = supabase.from('demandes').select('*')
      if (activeTab === 'disponibles') {
        query = query.eq('status', 'En attente')
      } else {
        query = query.eq('status', 'En cours').eq('artisan_id', user.id)
      }
      const { data } = await query.order('created_at', { ascending: false })
      setDemandes(data || [])
    } finally { setLoading(false) }
  }

  async function handleAccepter(demandeId: string, tel: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('demandes').update({ status: 'En cours', artisan_id: user.id }).eq('id', demandeId)
    fetchDemandes()
    const msg = encodeURIComponent("Bonjour, je suis l'artisan PrestaConnect.")
    window.open(`https://wa.me/${tel.replace(/\+/g, '')}?text=${msg}`, '_blank')
  }

  async function handleTerminer(demandeId: string) {
    await supabase.from('demandes').update({ status: 'Termine' }).eq('id', demandeId)
    fetchDemandes()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 md:p-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Espace artisan</p>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bonjour, {firstName} 👋</h1>
            <p className="text-gray-400 mt-1">Voici vos opportunites du jour</p>
          </div>
          <Link href="/recharge" className="group flex items-center gap-4 bg-white border border-gray-100 hover:border-blue-200 rounded-2xl px-5 py-4 shadow-sm transition-all w-fit">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Solde wallet</p>
              <p className="text-xl font-black text-gray-900">{solde.toLocaleString()} FCFA</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform ml-2" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-100 p-1.5 rounded-2xl w-fit mb-8 shadow-sm">
          {[
            { key: 'disponibles', label: 'Disponibles', icon: Zap },
            { key: 'en_cours', label: 'Mes chantiers', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-300 font-medium animate-pulse">Chargement...</div>
          ) : demandes.length > 0 ? demandes.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Briefcase size={18} />
                  </div>
                  <span className={`text-xs uppercase tracking-wider font-black px-3 py-1 rounded-full ${
                    activeTab === 'disponibles' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {activeTab === 'disponibles' ? 'Nouveau' : 'En cours'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-2">{d.service_nom}</h3>
              <div className="flex items-center text-gray-400 text-sm gap-1.5 mb-4">
                <MapPin size={13} /><span>{d.ville}{d.quartier ? `, ${d.quartier}` : ''}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 bg-gray-50 rounded-xl p-3 line-clamp-3">
                {d.description || 'Aucune description.'}
              </p>

              {activeTab === 'disponibles' ? (
                <button
                  onClick={() => handleAccepter(d.id, d.telephone)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Phone size={17} /> Prendre le chantier
                </button>
              ) : (
                <button
                  onClick={() => handleTerminer(d.id)}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Check size={17} /> Marquer comme termine
                </button>
              )}
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold">Aucun chantier pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD CLIENT ─────────────────────────────────────────────────────────
function DashboardClient({ profile }: { profile: any }) {
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const firstName = profile?.full_name?.split(' ')[0] || profile?.prenom || 'vous'

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('demandes').select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      setDemandes(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const statusStyle: Record<string, string> = {
    'En attente': 'bg-amber-100 text-amber-700',
    'En cours': 'bg-blue-100 text-blue-700',
    'Termine': 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 md:p-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Espace client</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bonjour, {firstName} 👋</h1>
          <p className="text-gray-400 mt-1">Suivez vos demandes en temps reel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-300 animate-pulse font-medium">Chargement...</div>
          ) : demandes.length > 0 ? demandes.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <User size={18} />
                </div>
                <span className={`text-xs uppercase tracking-wider font-black px-3 py-1 rounded-full ${statusStyle[d.status] || 'bg-gray-100 text-gray-500'}`}>
                  {d.status}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">{d.service_nom}</h3>
              <div className="flex items-center text-gray-400 text-sm gap-1.5 mb-4">
                <MapPin size={13} /><span>{d.ville}{d.quartier ? `, ${d.quartier}` : ''}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed bg-gray-50 rounded-xl p-3 line-clamp-3">
                {d.description || 'Aucune description.'}
              </p>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold mb-4">Aucune demande pour le moment.</p>
              <Link href="/demande" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
                Faire une demande <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}