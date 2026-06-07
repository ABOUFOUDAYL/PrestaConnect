'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Phone, Briefcase, Clock, Check, User, MapPin, Star, CreditCard, ShieldCheck, Users, Layers, BarChart3 } from 'lucide-react'
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

      if (prof) {
        setProfile(prof)
        setRole(prof.role)
      }
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )

  if (role === 'admin') return <DashboardAdmin profile={profile} />
  if (role === 'prestataire' || role === 'artisan') return <DashboardPrestataire profile={profile} />
  if (role === 'client') return <DashboardClient profile={profile} />

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Rôle non défini. Contactez le support.</p>
    </div>
  )
}

// ─── DASHBOARD ADMIN ──────────────────────────────────────────────────────────
function DashboardAdmin({ profile }: { profile: any }) {
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, artisans: 0, ambassadors: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabase.from('profiles').select('*')
      const profilesList = data || []
      setMetrics({
        total: profilesList.length,
        pending: profilesList.filter(p => p.status === 'en_attente_validation').length,
        artisans: profilesList.filter(p => p.status === 'valide' && p.role === 'artisan').length,
        ambassadors: profilesList.filter(p => p.role === 'ambassadeur').length,
      })
      setLoading(false)
    }
    fetchMetrics()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-500 mt-1">Bonjour, {profile?.full_name} 👋 — Contrôle total de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3"><Users size={20} /></div>
          <p className="text-2xl font-black text-gray-900">{metrics.total}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Total inscrits</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-3"><Layers size={20} /></div>
          <p className="text-2xl font-black text-gray-900">{metrics.pending}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">En attente</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3"><Briefcase size={20} /></div>
          <p className="text-2xl font-black text-gray-900">{metrics.artisans}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Artisans validés</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-3"><Star size={20} /></div>
          <p className="text-2xl font-black text-gray-900">{metrics.ambassadors}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Ambassadeurs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin-ambassadeur" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-6 flex items-center gap-4 transition-all">
          <ShieldCheck size={28} />
          <div>
            <p className="font-bold text-lg">Cockpit Admin</p>
            <p className="text-xs opacity-80">Gérer les dossiers</p>
          </div>
        </Link>
        <Link href="/explore" className="bg-white border border-gray-100 hover:border-blue-300 rounded-2xl p-6 flex items-center gap-4 transition-all shadow-sm">
          <Users size={28} className="text-blue-600" />
          <div>
            <p className="font-bold text-lg text-gray-900">Explorer</p>
            <p className="text-xs text-gray-500">Voir les prestataires</p>
          </div>
        </Link>
        <Link href="/analytics" className="bg-white border border-gray-100 hover:border-blue-300 rounded-2xl p-6 flex items-center gap-4 transition-all shadow-sm">
          <BarChart3 size={28} className="text-blue-600" />
          <div>
            <p className="font-bold text-lg text-gray-900">Analytiques</p>
            <p className="text-xs text-gray-500">Statistiques plateforme</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

// ─── DASHBOARD PRESTATAIRE ───────────────────────────────────────────────────
function DashboardPrestataire({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<'disponibles' | 'en_cours'>('disponibles')
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [solde, setSolde] = useState(profile?.solde || 0)

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
    } finally {
      setLoading(false)
    }
  }

  const handleAccepterChantier = async (demandeId: string, telephoneClient: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('demandes').update({ status: 'En cours', artisan_id: user.id }).eq('id', demandeId)
      fetchDemandes()
      const msg = encodeURIComponent("Bonjour, je suis l'artisan PrestaConnect.")
      window.open(`https://wa.me/${telephoneClient.replace(/\+/g, '')}?text=${msg}`, '_blank')
    } catch { alert("Erreur lors de l'acceptation") }
  }

  const handleTerminerChantier = async (demandeId: string) => {
    try {
      await supabase.from('demandes').update({ status: 'Terminé' }).eq('id', demandeId)
      fetchDemandes()
      alert('Chantier terminé !')
    } catch { alert('Erreur lors de la mise à jour') }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bonjour, {profile?.full_name || profile?.prenom || profile?.nom} 👋</p>
        </div>
        <Link href="/recharge" className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl transition-all">
          <CreditCard size={20} />
          <div>
            <p className="text-xs opacity-80">Solde wallet</p>
            <p className="font-bold">{solde.toLocaleString()} FCFA</p>
          </div>
        </Link>
      </div>

      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit mb-6">
        <button onClick={() => setActiveTab('disponibles')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'disponibles' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          Disponibles
        </button>
        <button onClick={() => setActiveTab('en_cours')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'en_cours' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          Mes chantiers
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 animate-pulse">Chargement...</div>
        ) : demandes.length > 0 ? demandes.map((demande) => (
          <div key={demande.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl"><Briefcase size={22} /></div>
              <span className={`text-[11px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full ${activeTab === 'disponibles' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {activeTab === 'disponibles' ? 'Nouveau' : 'En cours'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{demande.service_nom}</h3>
            <div className="flex items-center text-gray-500 text-sm gap-1.5 mb-5">
              <Clock size={15} /><span>{demande.ville}, {demande.quartier}</span>
            </div>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-8 line-clamp-3 bg-gray-50 p-4 rounded-2xl">
              {demande.description || 'Aucune description.'}
            </p>
            {activeTab === 'disponibles' ? (
              <button onClick={() => handleAccepterChantier(demande.id, demande.telephone)}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                <Phone size={20} /> Prendre le chantier
              </button>
            ) : (
              <button onClick={() => handleTerminerChantier(demande.id)}
                className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95">
                <Check size={20} /> Marquer comme terminé
              </button>
            )}
          </div>
        )) : (
          <div className="col-span-full py-24 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">Aucun chantier pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DASHBOARD CLIENT ─────────────────────────────────────────────────────────
function DashboardClient({ profile }: { profile: any }) {
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMesDemandes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('demandes')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      setDemandes(data || [])
      setLoading(false)
    }
    fetchMesDemandes()
  }, [])

  const statusColor: Record<string, string> = {
    'En attente': 'bg-yellow-100 text-yellow-700',
    'En cours': 'bg-blue-100 text-blue-700',
    'Terminé': 'bg-green-100 text-green-700',
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes demandes</h1>
        <p className="text-gray-500 mt-1">Bonjour, {profile?.full_name || profile?.prenom || profile?.nom} 👋</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 animate-pulse">Chargement...</div>
        ) : demandes.length > 0 ? demandes.map((demande) => (
          <div key={demande.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl"><User size={22} /></div>
              <span className={`text-[11px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full ${statusColor[demande.status] || 'bg-gray-100 text-gray-600'}`}>
                {demande.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{demande.service_nom}</h3>
            <div className="flex items-center text-gray-500 text-sm gap-1.5 mb-4">
              <MapPin size={15} /><span>{demande.ville}, {demande.quartier}</span>
            </div>
            <p className="text-gray-600 text-[15px] leading-relaxed bg-gray-50 p-4 rounded-2xl line-clamp-3">
              {demande.description || 'Aucune description.'}
            </p>
          </div>
        )) : (
          <div className="col-span-full py-24 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">Aucune demande pour le moment.</p>
            <Link href="/demande" className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
              Faire une demande
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}