import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { montant, artisan_id, user_id } = await req.json()

    console.log('[fedapay] Params reçus:', { montant, artisan_id, user_id })
    console.log('[fedapay] FEDAPAY_SECRET_KEY définie:', !!process.env.FEDAPAY_SECRET_KEY)
    console.log('[fedapay] SUPABASE_SERVICE_ROLE_KEY définie:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('[fedapay] APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

    if (!montant || !artisan_id || !user_id) {
      console.log('[fedapay] Paramètres manquants')
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // 1. Créer la transaction en BDD
    console.log('[fedapay] Insertion transaction Supabase...')
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

    if (txError) {
      console.log('[fedapay] Erreur Supabase:', txError.message)
      throw txError
    }
    console.log('[fedapay] Transaction créée:', transaction.id)

    // 2. Créer la transaction FedaPay
    console.log('[fedapay] Appel FedaPay sandbox...')
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
    console.log('[fedapay] FedaPay status:', fedapayRes.status)
    console.log('[fedapay] FedaPay response:', JSON.stringify(fedapayData))

    if (!fedapayRes.ok) throw new Error(fedapayData.message || 'Erreur FedaPay')

    // 3. Mettre à jour avec l'ID FedaPay
    await supabaseAdmin
      .from('transactions')
      .update({ fedapay_id: String(fedapayData.v1.transaction.id) })
      .eq('id', transaction.id)

    return NextResponse.json({
      transaction_id: transaction.id,
      fedapay_token: fedapayData.v1.transaction.token,
      payment_url: `https://sandbox.fedapay.com/checkout/${fedapayData.v1.transaction.token}`,
    })

  } catch (error: any) {
    console.log('[fedapay] Erreur finale:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}