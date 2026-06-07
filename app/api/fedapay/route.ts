import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { montant, artisan_id, user_id } = await req.json()

    if (!montant || !artisan_id || !user_id) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // 1. Créer la transaction en BDD
    const { data: transaction, error: txError } = await supabaseAdmin
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

    // 2. Créer la transaction FedaPay LIVE
    const fedapayRes = await fetch('https://api.fedapay.com/v1/transactions', {
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
    console.log('[fedapay] Full response:', JSON.stringify(fedapayData, null, 2))

    if (!fedapayRes.ok) throw new Error(fedapayData.message || 'Erreur FedaPay')

    // 3. Extraire transaction (structure live peut différer du sandbox)
    const tx = fedapayData.v1?.transaction ?? fedapayData.transaction ?? fedapayData
    console.log('[fedapay] tx object:', JSON.stringify(tx))

    // 4. Mettre à jour avec l'ID FedaPay
    await supabaseAdmin
      .from('transactions')
      .update({ fedapay_id: String(tx.id) })
      .eq('id', transaction.id)

    return NextResponse.json({
      transaction_id: transaction.id,
      fedapay_token: tx.token,
      payment_url: `https://app.fedapay.com/checkout/${tx.token}`,
    })

  } catch (error: any) {
    console.log('[fedapay] Erreur finale:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}