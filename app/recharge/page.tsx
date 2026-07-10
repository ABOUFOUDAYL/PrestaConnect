'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MONTANTS = [1000, 2000, 5000, 10000, 20000]

export default function RechargePage() {
  const router = useRouter()
  const [montant, setMontant] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [solde, setSolde] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: wallet } = await supabase
        .from('wallet')
        .select('solde')
        .eq('artisan_id', user.id)
        .single()
      if (wallet) setSolde(wallet.solde)
    }
    getUser()
  }, [])

  const handleRecharge = async () => {
    if (!montant || montant < 500) {
      setError('Montant minimum : 500 FCFA')
      return
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/fedapay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant,
          artisan_id: currentUser.id,
          user_id: currentUser.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      window.location.href = data.payment_url

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recharge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-blue-600 font-medium">Solde actuel</p>
          <p className="text-3xl font-bold text-blue-700">{solde.toLocaleString()} FCFA</p>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Recharger mon wallet</h1>

        <p className="text-sm text-gray-500 mb-3">Choisir un montant</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {MONTANTS.map((m) => (
            <button
              key={m}
              onClick={() => setMontant(m)}
              className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                montant === m
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-blue-400'
              }`}
            >
              {m.toLocaleString()} F
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-2">Ou saisir un montant</p>
        <input
          type="number"
          placeholder="Ex: 7500"
          value={montant}
          onChange={(e) => setMontant(Number(e.target.value))}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500 mb-4"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleRecharge}
          disabled={loading || !montant}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg transition-all"
        >
          {loading ? 'Redirection...' : `Payer ${montant ? Number(montant).toLocaleString() : 0} FCFA`}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Paiement sécurisé via FedaPay 🔒
        </p>
      </div>
    </div>
  )
}