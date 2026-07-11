'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MapPin, Calendar, Zap, Building2, Lock, Phone, User, MessageCircle, Wallet } from 'lucide-react'
import Link from 'next/link'

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const TARIFS: Record<string, number> = {
  urgent: 300,
  grand_projet: 1500,
  sans_diplome: 500,
  contact_direct: 300,
}

export default function DetailDemandePage() {
  const params = useParams()
  const router = useRouter()
  const demandeId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [demande, setDemande] = useState<any>(null)
  const [prestataire, setPrestataire] = useState<any>(null)
  const [solde, setSolde] = useState(0)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }
      setUserId(user.id)

      const { data: d } = await supabase
        .from('demandes')
        .select('*')
        .eq('id', demandeId)
        .single()
      setDemande(d)

      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setPrestataire(presta)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .single()
      if (profile) setProfileId(profile.id)

      const { data: wallet } = await supabase
        .from('wallet')
        .select('solde')
        .eq('user_id', user.id)
        .single()
      setSolde(wallet?.solde || 0)

      const { data: existingDeblocage } = await supabase
        .from('deblocages_demandes')
        .select('id')
        .eq('demande_id', demandeId)
        .eq('artisan_id', user.id)
        .maybeSingle()

      setIsUnlocked(!!existingDeblocage)
      setIsLoading(false)
    }
    load()
  }, [demandeId])

  const tarif = demande ? (TARIFS[demande.type_intervention] || 300) : 300

  const handleDebloquer = async () => {
    if (!demande || !userId) return
    setErrorMsg(null)

    if (solde < tarif) {
      setErrorMsg('Solde insuffisant. Rechargez votre portefeuille pour débloquer cette demande.')
      return
    }

    setUnlocking(true)

    const { error: deblocError } = await supabase
      .from('deblocages_demandes')
      .insert({
        demande_id: demande.id,
        artisan_id: userId,
        client_id: demande.client_id,
        montant_paye: tarif,
      })

    if (deblocError) {
      console.error(deblocError)
      setErrorMsg("Erreur lors du déblocage. Réessayez.")
      setUnlocking(false)
      return
    }

    await supabase
      .from('wallet')
      .update({ solde: solde - tarif })
      .eq('user_id', userId)

    if (profileId) {
      await supabase.from('wallet_transactions').insert({
        profile_id: profileId,
        montant: -tarif,
        type: 'deblocage_demande',
        description: `Déblocage demande · ${demande.service_nom || demande.metier_type || 'Demande'}`,
      })
    }

    setSolde((s) => s - tarif)
    setIsUnlocked(true)
    setUnlocking(false)
  }

  const handleContacter = async () => {
    if (!demande || !userId) return

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', demande.client_id)
      .eq('artisan_id', userId)
      .maybeSingle()

    let conversationId = existing?.id

    if (!conversationId) {
      const { data: created, error } = await supabase
        .from('conversations')
        .insert({ client_id: demande.client_id, artisan_id: userId })
        .select('id')
        .single()

      if (error) { console.error(error); return }
      conversationId = created.id
    }

    router.push(`/artisan/messages?conversation=${conversationId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!demande) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-400">Demande introuvable.</p>
        <Link href="/artisan/demandes" className="text-orange-500 font-semibold text-sm mt-2 inline-block">
          ← Retour aux demandes
        </Link>
      </div>
    )
  }

  const isUrgent = demande.type_intervention === 'urgent'
  const distance = prestataire?.latitude && demande.latitude
    ? haversine(prestataire.latitude, prestataire.longitude, demande.latitude, demande.longitude)
    : null

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/artisan/demandes" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Retour aux demandes
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {isUrgent ? (
            <span className="flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              <Zap className="h-3 w-3" /> URGENT
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              <Building2 className="h-3 w-3" /> Grand projet
            </span>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {demande.status}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">
          {demande.service_nom || demande.metier_type}
        </h1>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {demande.ville}{demande.quartier ? ` · ${demande.quartier}` : ''}
            {distance !== null && (
              <span className="ml-1 font-medium text-orange-500">
                ({distance < 1 ? '<1' : Math.round(distance)} km)
              </span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(demande.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>

        <p className="text-sm text-gray-700 mb-6 leading-relaxed">{demande.description}</p>

        {!isUnlocked ? (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2 text-orange-600">
              <Lock className="h-4 w-4" />
              <p className="font-semibold text-sm">Coordonnées du client verrouillées</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Débloquez cette demande pour voir le nom et le numéro du client, et pouvoir lui écrire directement.
            </p>

            {errorMsg && (
              <p className="text-xs text-red-600 mb-3">{errorMsg}</p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Wallet className="h-3.5 w-3.5" /> Solde : {solde.toLocaleString('fr-FR')} crédits
              </span>
              <button
                onClick={handleDebloquer}
                disabled={unlocking}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition"
              >
                {unlocking ? 'Déblocage...' : `Débloquer pour ${tarif} FCFA`}
              </button>
            </div>

            {solde < tarif && (
              <Link href="/recharge" className="block text-center text-xs font-semibold text-orange-600 mt-3 hover:underline">
                Recharger mon portefeuille →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-green-700">
              <User className="h-4 w-4" />
              <p className="font-semibold text-sm">{demande.client_name}</p>
            </div>
            {demande.telephone && (
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                {demande.telephone}
              </div>
            )}
            <button
              onClick={handleContacter}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition"
            >
              <MessageCircle className="h-4 w-4" /> Contacter le client
            </button>
          </div>
        )}
      </div>
    </div>
  )
}