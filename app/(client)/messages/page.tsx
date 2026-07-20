'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useConversations, getOrCreateConversation } from '@/hooks/useMessages'
import ConversationList from '@/components/messages/ConversationList'
import ChatWindow from '@/components/messages/ChatWindow'
import { Lock } from 'lucide-react'

const METIERS_SANS_DIPLOME = [
  "Coiffeur / Barbier", "Coiffeur / Coiffeuse", "Tailleur / Couturier", "Cordonnier",
  "Tisserand", "Potier / Céramiste", "Forgeron",
  "Jardinier / Paysagiste", "Laveur de véhicules",
  "Réparateur de motos", "Réparateur d'appareils électroménagers",
  "Cuisinier traditionnel / Traiteur", "Décorateur d'événements",
  "Tresseur / Tresseuse de cheveux", "Fabricant de savon artisanal",
]

const TARIF_SANS_DIPLOME = 1000

function MessagesContent() {
  const { conversations, loading, refetch } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const artisanId = searchParams.get('with')

  const [checkingAccess, setCheckingAccess] = useState(!!artisanId)
  const [paywall, setPaywall] = useState<{ prestataireId: string; prestataireUserId: string; nom: string } | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    if (!artisanId) return

    const checkAndOpen = async () => {
      setCheckingAccess(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setCheckingAccess(false); return }

      const { data: presta } = await supabase
        .from('prestataires')
        .select('id, metier, nom, prenom')
        .eq('user_id', artisanId)
        .single()

      const isSansDiplome = presta && METIERS_SANS_DIPLOME.includes(presta.metier)

      if (presta && isSansDiplome) {
        const { data: unlock } = await supabase
          .from('deblocages_prestataires')
          .select('id')
          .eq('client_id', user.id)
          .eq('prestataire_id', presta.id)
          .maybeSingle()

        if (!unlock) {
          setPaywall({
            prestataireId: presta.id,
            prestataireUserId: artisanId,
            nom: `${presta.prenom || ''} ${presta.nom || ''}`.trim() || 'Cet artisan',
          })
          setCheckingAccess(false)
          return
        }
      }

      const conversationId = await getOrCreateConversation(artisanId)
      if (conversationId) {
        await refetch()
        setSelectedId(conversationId)
      }
      setCheckingAccess(false)
    }

    checkAndOpen()
  }, [artisanId])

  const handlePayer = async () => {
    if (!paywall) return
    setPayError(null)
    setPaying(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPaying(false); return }

    try {
      const res = await fetch('/api/fedapay/deblocage-prestataire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: user.id,
          prestataire_id: paywall.prestataireId,
          prestataire_user_id: paywall.prestataireUserId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      window.location.href = data.payment_url
    } catch (err: any) {
      setPayError(err.message || 'Erreur lors du paiement')
      setPaying(false)
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedId) || null

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (paywall) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="max-w-sm w-full text-center bg-red-50 border border-red-100 rounded-2xl p-8">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <p className="font-bold text-gray-900 mb-2">Débloquer {paywall.nom}</p>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Cet artisan fait partie de nos profils expérimentés. Débloquez son contact pour lui écrire — une seule fois, accès permanent.
          </p>

          {payError && <p className="text-xs text-red-600 mb-3">{payError}</p>}

          <button
            onClick={handlePayer}
            disabled={paying}
            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}
          >
            {paying ? 'Redirection...' : `Débloquer pour ${TARIF_SANS_DIPLOME} FCFA`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white rounded-xl border border-gray-200">
      <ConversationList
        conversations={conversations}
        loading={loading}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
      />
      <ChatWindow
        conversation={selectedConversation}
        onMessageSent={refetch}
      />
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  )
}