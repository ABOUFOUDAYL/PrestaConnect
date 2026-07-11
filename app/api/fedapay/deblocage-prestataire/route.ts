import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TARIF_SANS_DIPLOME = 1000

export async function POST(req: Request) {
  try {
    const { client_id, prestataire_id, prestataire_user_id } = await req.json()

    if (!client_id || !prestataire_id || !prestataire_user_id) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('deblocages_prestataires')
      .select('id')
      .eq('client_id', client_id)
      .eq('prestataire_id', prestataire_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Déjà débloqué' }, { status: 400 })
    }

    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: client_id,
        type_user: 'client',
        montant: TARIF_SANS_DIPLOME,
        type_transaction: 'deblocage',
        statut: 'en_attente',
        description: `Déblocage contact prestataire (sans diplôme)`,
      })
      .select()
      .single()

    if (txError) throw txError

    const fedapayRes = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        description: `PrestaConnect - Déblocage contact - ${TARIF_SANS_DIPLOME} FCFA`,
        amount: TARIF_SANS_DIPLOME,
        currency: { iso: 'XOF' },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/deblocage-success?prestataire_user_id=${prestataire_user_id}&prestataire_id=${prestataire_id}`,
        metadata: {
          transaction_id: transaction.id,
          type: 'deblocage_prestataire',
          client_id,
          prestataire_id,
        },
        customer: { email: 'client@prestaconnect.bj' },
      }),
    })

    const fedapayData = await fedapayRes.json()
    if (!fedapayRes.ok) throw new Error(fedapayData.message || 'Erreur FedaPay')

    const tx = fedapayData['v1/transaction']
    if (!tx) throw new Error('Structure FedaPay inattendue')

    const tokenRes = await fetch(`https://api.fedapay.com/v1/transactions/${tx.id}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      },
    })

    const tokenData = await tokenRes.json()
    const payment_url = tokenData.url

    if (!payment_url) throw new Error('URL FedaPay introuvable')

    await supabaseAdmin
      .from('transactions')
      .update({ fedapay_id: String(tx.id) })
      .eq('id', transaction.id)

    return NextResponse.json({ transaction_id: transaction.id, payment_url })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}