import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifierArtisanGlobal } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetId = body.prestataire_id || body.id;

    if (!targetId) {
      return NextResponse.json(
        { error: 'ID du prestataire manquant' },
        { status: 400 }
      );
    }

    // Récupération des coordonnées de l'artisan
    const { data: prestataire, error: fetchError } = await supabase
      .from('prestataires')
      .select('id, nom, prenom, telephone, email')
      .eq('id', targetId)
      .single();

    if (fetchError || !prestataire) {
      return NextResponse.json(
        { error: 'Prestataire introuvable' },
        { status: 404 }
      );
    }

    const nomComplet = `${prestataire.prenom || ''} ${prestataire.nom || ''}`.trim() || 'Artisan';
    const messageTexte = body.message || `Bonjour ${nomComplet}, votre dossier PrestaConnect est actuellement incomplet. Merci de vous connecter à votre espace pour fournir les pièces justificatives manquantes.`;

    const resultats = await notifierArtisanGlobal({
      prestataireId: prestataire.id,
      email: prestataire.email,
      telephone: prestataire.telephone,
      nom: nomComplet,
      typeEvenement: 'relance_dossier_incomplet',
      sujetEmail: 'PrestaConnect - Rappel dossier incomplet',
      messageTexte: messageTexte,
      htmlEmail: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2>Bonjour ${nomComplet},</h2>
          <p>${messageTexte}</p>
          <p style="margin-top: 20px;">À très bientôt,<br><strong>L'équipe PrestaConnect</strong></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      resultats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur lors de la notification' },
      { status: 500 }
    );
  }
}