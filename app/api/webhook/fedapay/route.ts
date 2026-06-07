import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const eventType = body.event;
    const transactionData = body.entity;

    if (!transactionData) {
      return NextResponse.json({ error: "Contenu de transaction invalide" }, { status: 400 });
    }

    if (eventType === 'transaction.approved' || transactionData.status === 'approved') {

      const metadata = transactionData.custom_metadata || transactionData.metadata || {};
      const profileId = metadata.profile_id;
      const transactionId = metadata.transaction_id; // ← recharge wallet
      const transactionAmount = transactionData.amount;

      // ✅ CAS 1 : Recharge wallet
      if (transactionId) {
        console.log(`[Webhook] Recharge wallet - transaction_id: ${transactionId}, montant: ${transactionAmount}`)

        // Récupérer la transaction pour avoir le user_id
        const { data: tx, error: txFetchError } = await supabaseAdmin
          .from('transactions')
          .select('user_id, montant')
          .eq('id', transactionId)
          .single()

        if (txFetchError || !tx) {
          console.error('[Webhook] Transaction introuvable:', transactionId)
          return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
        }

        // Mettre à jour le statut de la transaction
        await supabaseAdmin
          .from('transactions')
          .update({
            statut: 'approuve',
            fedapay_id: String(transactionData.id || transactionData.reference || ''),
          })
          .eq('id', transactionId)

        // Incrémenter le solde du wallet
        const { data: wallet, error: walletError } = await supabaseAdmin
          .from('wallet')
          .select('solde')
          .eq('artisan_id', tx.user_id)
          .single()

        if (walletError || !wallet) {
          // Créer le wallet s'il n'existe pas
          await supabaseAdmin
            .from('wallet')
            .insert({ artisan_id: tx.user_id, solde: tx.montant })
        } else {
          await supabaseAdmin
            .from('wallet')
            .update({ solde: wallet.solde + tx.montant })
            .eq('artisan_id', tx.user_id)
        }

        console.log(`[Webhook] Wallet rechargé : +${tx.montant} FCFA pour user ${tx.user_id}`)
        return NextResponse.json({ message: 'Wallet rechargé avec succès' }, { status: 200 })
      }

      // ✅ CAS 2 : Paiement d'inscription (logique existante)
      if (profileId) {
        const { error: dbError } = await supabaseAdmin
          .from('profiles')
          .update({
            status: 'en_attente_validation',
            payment_verified: true,
            payment_date: new Date().toISOString(),
            payment_reference: transactionData.reference || 'FEDAPAY_REF'
          })
          .eq('id', profileId);

        if (dbError) {
          console.error(`Erreur Supabase profil ${profileId}:`, dbError.message);
          return NextResponse.json({ error: "Erreur de base de données interne" }, { status: 500 });
        }

        console.log(`[Webhook] Profil ${profileId} activé - ${transactionAmount} XOF`);
        return NextResponse.json({ message: "Statut mis à jour avec succès", profileId }, { status: 200 });
      }

      console.error('[Webhook] Ni transaction_id ni profile_id dans les métadonnées')
      return NextResponse.json({ error: "Métadonnées manquantes" }, { status: 400 });
    }

    return NextResponse.json({ message: "Événement reçu et ignoré" }, { status: 200 });

  } catch (error: any) {
    console.error("Erreur critique webhook FedaPay:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}