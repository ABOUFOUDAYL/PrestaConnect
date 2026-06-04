import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { montant, artisan_id, user_id } = await req.json()

    if (!montant || !artisan_id || !user_id) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // 1. Créer la transaction en BDD avec statut "en_attente"
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        type_user: 'prestataire',
        montant,
        type_transaction: 'recharge',
        statut: 'en_attente',
        description: `Recharge wallet - ${montant} FCFA`,
      })
      .select()
      .single()

    if (txError) throw txError

    // 2. Créer la transaction FedaPay
    const fedapayRes = await fetch('https://sandbox-api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        description: `Recharge PrestaConnect - ${montant} FCFA`,
        amount: montant,
        currency: { iso: 'XOF' },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/recharge/success`,
        metadata: { artisan_id, transaction_id: transaction.id },
        customer: { email: 'client@prestaconnect.bj' },
      }),
    })

    const fedapayData = await fedapayRes.json()

    if (!fedapayRes.ok) throw new Error(fedapayData.message || 'Erreur FedaPay')

    // 3. Mettre à jour la transaction avec l'ID FedaPay
    await supabase
      .from('transactions')
      .update({ fedapay_id: String(fedapayData.v1.transaction.id) })
      .eq('id', transaction.id)

    return NextResponse.json({
      transaction_id: transaction.id,
      fedapay_token: fedapayData.v1.transaction.token,
      payment_url: `https://sandbox.fedapay.com/checkout/${fedapayData.v1.transaction.token}`,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}