'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ✅ Composant interne qui utilise useSearchParams
function RechargeSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [solde, setSolde] = useState(0)
  const [statut, setStatut] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    const verifier = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: transaction } = await supabase
        .from('transactions')
        .select('statut, montant')
        .eq('user_id', user.id)
        .eq('type_transaction', 'recharge')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (transaction?.statut === 'reussi') {
        setStatut('success')
      } else {
        setStatut('failed')
      }

      const { data: wallet } = await supabase
        .from('wallet')
        .select('solde')
        .eq('artisan_id', user.id)
        .maybeSingle()
      if (wallet) setSolde(wallet.solde)
    }

    verifier()
  }, [])

  if (statut === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Vérification du paiement...</p>
        </div>
      </div>
    )
  }

  if (statut === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Paiement échoué</h1>
          <p className="text-gray-500 mb-6">Le paiement n'a pas pu être traité. Veuillez réessayer.</p>
          <Link href="/recharge" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-all">
            Réessayer
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Recharge réussie !</h1>
        <p className="text-gray-500 mb-6">Votre wallet a été crédité avec succès.</p>
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-600 font-medium">Nouveau solde</p>
          <p className="text-3xl font-bold text-green-700">{solde.toLocaleString()} FCFA</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/annonces" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-all">
            Voir les annonces
          </Link>
          <Link href="/dashboard" className="block w-full border-2 border-gray-200 hover:border-blue-400 text-gray-700 font-bold py-4 rounded-xl text-lg transition-all">
            Mon dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

// ✅ Page principale avec Suspense boundary
export default function RechargeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <RechargeSuccessContent />
    </Suspense>
  )
}