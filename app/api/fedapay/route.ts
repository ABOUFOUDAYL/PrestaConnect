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
    if (!fedapayRes.ok) throw new Error(fedapayData.message || 'Erreur FedaPay')

    const tx = fedapayData['v1/transaction']
    if (!tx) throw new Error('Structure FedaPay inattendue')

    // 3. Générer le token
    const tokenRes = await fetch(`https://api.fedapay.com/v1/transactions/${tx.id}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      },
    })

    const tokenData = await tokenRes.json()
    console.log('[fedapay] tokenRes status:', tokenRes.status)
    console.log('[fedapay] tokenData complet:', JSON.stringify(tokenData))

    // Le token peut être à différents endroits selon FedaPay live
    const token = tokenData.token
      ?? tokenData['v1/transaction']?.token
      ?? tokenData.data?.token

    console.log('[fedapay] token extrait:', token)

    if (!token) throw new Error('Token FedaPay introuvable: ' + JSON.stringify(tokenData))

    // 4. Mettre à jour avec l'ID FedaPay
    await supabaseAdmin
      .from('transactions')
      .update({ fedapay_id: String(tx.id) })
      .eq('id', transaction.id)

    return NextResponse.json({
      transaction_id: transaction.id,
      fedapay_token: token,
      payment_url: `https://live.fedapay.com/checkout/${token}`,
    })

  } catch (error: any) {
    console.log('[fedapay] Erreur finale:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}