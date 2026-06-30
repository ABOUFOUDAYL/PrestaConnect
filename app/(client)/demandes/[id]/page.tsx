'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowLeft, MapPin, Calendar, Briefcase, Lock, CheckCircle } from 'lucide-react'
import DemandeStatusBadge from '@/components/demandes/DemandeStatusBadge'

interface Demande {
  id: string
  description: string
  service_nom: string
  metier_type: string
  ville: string
  quartier: string
  status: string
  created_at: string
  client_id: string
  type_intervention: string
}

interface Prestataire {
  id: string
  user_id: string
  nom: string
  metier: string
  ville: string
  telephone: string
  note: number
  nb_avis: number
  debloque: boolean
}

const COUT_DEBLOCAGE = 300

export default function DemandeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [demande, setDemande] = useState<Demande | null>(null)
  const [prestataires, setPrestataires] = useState<Prestataire[]>([])
  const [loading, setLoading] = useState(true)
  const [solde, setSolde] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [deblocageLoading, setDeblocageLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    // Charger la demande
    const { data: demandeData } = await supabase
      .from('demandes')
      .select('*')
      .eq('id', id)
      .single()

    if (!demandeData) { setLoading(false); return }
    setDemande(demandeData)

    // Charger le solde wallet ✅
    const { data: wallet } = await supabase
      .from('wallet')
      .select('solde')
      .or(`user_id.eq.${user.id},artisan_id.eq.${user.id}`)
      .single()
    setSolde(wallet?.solde || 0)

    // Charger les prestataires qui correspondent à la ville
    const { data: presta } = await supabase
      .from('prestataires')
      .select('*')
      .eq('ville', demandeData.ville)

    // Charger les déblocages déjà effectués
    const { data: deblocages } = await supabase
      .from('deblocages_demandes')
      .select('artisan_id')
      .eq('demande_id', id)
      .eq('client_id', user.id)

    const debloquesIds = new Set(deblocages?.map((d: any) => d.artisan_id) || [])

    const formatted = (presta || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      nom: p.nom,
      metier: p.metier,
      ville: p.ville,
      telephone: p.telephone || '',
      note: p.note || 0,
      nb_avis: p.nb_avis || 0,
      debloque: debloquesIds.has(p.user_id),
    }))

    setPrestataires(formatted)
    setLoading(false)
  }

  async function handleDebloquer(prestataire: Prestataire) {
    if (solde < COUT_DEBLOCAGE) {
      setError('Solde insuffisant. Rechargez votre wallet.')
      return
    }

    setDeblocageLoading(prestataire.user_id)
    setError(null)

    // 1. Déduire du wallet ✅
    const { error: walletError } = await supabase
      .from('wallet')
      .update({ solde: solde - COUT_DEBLOCAGE })
      .or(`user_id.eq.${userId},artisan_id.eq.${userId}`)

    if (walletError) {
      setError('Erreur lors du déblocage.')
      setDeblocageLoading(null)
      return
    }

    // 2. Enregistrer le déblocage
    const { error: deblocageError } = await supabase
      .from('deblocages_demandes')
      .insert({
        demande_id: id,
        artisan_id: prestataire.user_id,
        client_id: userId,
        montant_paye: COUT_DEBLOCAGE,
      })

    if (deblocageError) {
      setError('Erreur lors de l\'enregistrement du déblocage.')
      setDeblocageLoading(null)
      return
    }

    // 3. Mettre à jour l'état local
    setSolde(prev => prev - COUT_DEBLOCAGE)
    setPrestataires(prev =>
      prev.map(p => p.user_id === prestataire.user_id ? { ...p, debloque: true } : p)
    )
    setDeblocageLoading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (!demande) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">📋</p>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Demande introuvable</h1>
        <Link href="/demandes" className="text-red-500 text-sm">← Retour aux demandes</Link>
      </div>
    )
  }

  const statut = demande.status || 'Ouvert'

  return (
    <div className="max-w-2xl mx-auto">

      {/* Retour */}
      <Link href="/demandes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour aux demandes
      </Link>

      {/* Détail demande */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-xl font-bold text-gray-900">
            {demande.service_nom || demande.metier_type || 'Demande'}
          </h1>
          <DemandeStatusBadge statut={statut as any} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {demande.ville} {demande.quartier && `· ${demande.quartier}`}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" /> {demande.metier_type}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {new Date(demande.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{demande.description}</p>
      </div>

      {/* Solde wallet */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 flex justify-between items-center">
        <span className="text-sm text-orange-700 font-medium">💰 Votre solde wallet</span>
        <span className="font-bold text-orange-600">{solde.toLocaleString()} FCFA</span>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Prestataires */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Artisans disponibles ({prestataires.length})
      </h2>

      {prestataires.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Aucun artisan disponible dans cette ville pour le moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {prestataires.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.debloque ? p.nom : '🔒 Artisan masqué'}</h3>
                  <p className="text-sm text-gray-500">{p.metier} · {p.ville}</p>
                  {p.nb_avis > 0 && (
                    <p className="text-xs text-yellow-600 mt-0.5">
                      {'★'.repeat(Math.round(p.note))} {p.note}/5 · {p.nb_avis} avis
                    </p>
                  )}
                </div>
                {p.debloque && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" /> Débloqué
                  </span>
                )}
              </div>

              {p.debloque ? (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="font-medium text-gray-700">📞 {p.telephone || 'Téléphone non renseigné'}</p>
                  <Link href="/messages" className="mt-2 inline-block text-red-500 text-xs hover:underline">
                    💬 Envoyer un message
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => handleDebloquer(p)}
                  disabled={deblocageLoading === p.user_id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60"
                >
                  {deblocageLoading === p.user_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Débloquer · {COUT_DEBLOCAGE} FCFA
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}