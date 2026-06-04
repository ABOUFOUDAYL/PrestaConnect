import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialisation d'un client Supabase avec la clé de service (Bypass les RLS pour les mises à jour système)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Extraction et analyse de l'événement envoyé par FedaPay
    const eventType = body.event;
    const transactionData = body.entity;

    if (!transactionData) {
      return NextResponse.json({ error: "Contenu de transaction invalide" }, { status: 400 });
    }

    // 2. Traitement uniquement si la transaction est approuvée avec succès
    if (eventType === 'transaction.approved' || transactionData.status === 'approved') {
      
      // Extraction des métadonnées personnalisées injectées lors du Checkout initial
      const profileId = transactionData.custom_metadata?.profile_id;
      const transactionAmount = transactionData.amount;

      if (!profileId) {
        console.error("Webhook reçu mais aucun profile_id n'est présent dans les métadonnées.");
        return NextResponse.json({ error: "Métadonnées manquantes" }, { status: 400 });
      }

      // 3. Opération atomique en Base de données : Passage au statut 'en_attente_validation'
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
        console.error(`Erreur Supabase lors du traitement du profil ${profileId}:`, dbError.message);
        return NextResponse.json({ error: "Erreur de base de données interne" }, { status: 500 });
      }

      console.log(`[FedaPay Webhook Success] Profil ${profileId} activé suite à un paiement de ${transactionAmount} XOF.`);
      return NextResponse.json({ message: "Statut mis à jour avec succès", profileId }, { status: 200 });
    }

    // Retour standard pour les autres événements (ex: transaction.pending, transaction.canceled)
    return NextResponse.json({ message: "Événement reçu et ignoré (non stratégique)" }, { status: 200 });

  } catch (error: any) {
    console.error("Erreur critique sur le traitement du Webhook FedaPay :", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}