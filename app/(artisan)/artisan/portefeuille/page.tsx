'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Receipt } from 'lucide-react'

export default function ArtisanPortefeuillePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [solde, setSolde] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle()

      const { data: wallet } = await supabase
        .from('wallet')
        .select('solde')
        .eq('user_id', user.id)
        .maybeSingle()
      setSolde(wallet?.solde || 0)

      if (profile) {
        const { data: txs } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })

        setTransactions(txs || [])
      }

      setIsLoading(false)
    }

    load()
  }, [])

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

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Portefeuille</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Gérez vos crédits et consultez votre historique</p>
      </div>

      <div style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        padding: '28px',
        marginBottom: '24px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <p style={{ fontSize: '13px', opacity: 0.85, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={15} /> Solde disponible
          </p>
          <p style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>
            {solde.toLocaleString('fr-FR')} <span style={{ fontSize: '16px', fontWeight: 500, opacity: 0.85 }}>crédits</span>
          </p>
        </div>

        <button
          onClick={() => router.push('/recharge')}
          style={{
            background: 'white',
            color: '#f97316',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 22px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={16} /> Recharger
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={16} color="#94a3b8" /> Historique des transactions
        </h2>

        {transactions.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
            Aucune transaction pour le moment
          </p>
        ) : (
          <div>
            {transactions.map((t) => {
              const isCredit = t.type === 'depot'
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: '1px solid #f8fafc',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: isCredit ? '#f0fdf4' : '#fef2f2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isCredit
                        ? <ArrowUpCircle size={18} color="#16a34a" />
                        : <ArrowDownCircle size={18} color="#dc2626" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description || t.type || 'Transaction'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                        {new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '14px', fontWeight: 700, margin: 0, whiteSpace: 'nowrap',
                    color: isCredit ? '#16a34a' : '#dc2626',
                  }}>
                    {isCredit ? '+' : '-'}{t.montant.toLocaleString('fr-FR')}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}