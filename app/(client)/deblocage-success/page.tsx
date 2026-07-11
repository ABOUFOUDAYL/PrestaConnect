'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function DeblocageSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prestataireUserId = searchParams.get('prestataire_user_id')
  const prestataireId = searchParams.get('prestataire_id')

  const [status, setStatus] = useState<'checking' | 'confirmed' | 'timeout'>('checking')

  useEffect(() => {
    if (!prestataireId || !prestataireUserId) { setStatus('timeout'); return }

    let attempts = 0
    const maxAttempts = 10

    const poll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setStatus('timeout'); return }

      const { data } = await supabase
        .from('deblocages_prestataires')
        .select('id')
        .eq('client_id', user.id)
        .eq('prestataire_id', prestataireId)
        .maybeSingle()

      if (data) {
        setStatus('confirmed')
        setTimeout(() => {
          router.push(`/messages?with=${prestataireUserId}`)
        }, 1200)
        return
      }

      attempts++
      if (attempts >= maxAttempts) {
        setStatus('timeout')
        return
      }
      setTimeout(poll, 1500)
    }

    poll()
  }, [prestataireId, prestataireUserId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {status === 'checking' && (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-red-500" />
            <p className="font-bold text-gray-900 mb-1">Confirmation du paiement...</p>
            <p className="text-sm text-gray-400">Un instant, on débloque votre contact.</p>
          </>
        )}
        {status === 'confirmed' && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-green-500" />
            <p className="font-bold text-gray-900 mb-1">Contact débloqué !</p>
            <p className="text-sm text-gray-400">Redirection vers la conversation...</p>
          </>
        )}
        {status === 'timeout' && (
          <>
            <p className="font-bold text-gray-900 mb-2">Paiement en cours de traitement</p>
            <p className="text-sm text-gray-400 mb-4">
              Ça prend parfois quelques instants de plus. Réessayez dans une minute.
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Retour à l'exploration
            </button>
          </>
        )}
      </div>
    </div>
  )
}