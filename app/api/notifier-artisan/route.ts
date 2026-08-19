import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifierArtisanGlobal } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // On s'aligne avec le frontend qui envoie désormais 'prestataireId' et 'id'
    const targetId = body.prestataireId || body.id;

    if (!targetId) {
      return NextResponse.json(
        { error: 'ID du prestataire manquant dans la requête' },
        { status: 400 }
      );
    }

    // Récupération des coordonnées de l'artisan
    // Utilisation de select('*') pour éviter les erreurs si une colonne manque
    const { data: prestataire, error: fetchError } = await supabase
      .from('prestataires')
      .select('*')
      .eq('id', targetId)
      .single();

    // Si Supabase remonte une erreur (ex: problème de RLS ou de variable d'environnement), on l'affiche !
    if (fetchError) {
      return NextResponse.json(
        { error: `Erreur Supabase : ${fetchError.message}` },
        { status: 404 }
      );
    }

    if (!prestataire) {
      return NextResponse.json(
        { error: 'Aucun prestataire ne correspond à cet ID dans la base.' },
        { status: 404 }
      );
    }

    const nomComplet = `${prestataire.prenom || ''} ${prestataire.nom || ''}`.trim() || 'Artisan';
    const messageTexte = body.message || `Bonjour ${nomComplet}, votre dossier PrestaConnect est actuellement incomplet. Merci de vous connecter à votre espace pour fournir les pièces justificatives manquantes.`;

    // On s'assure de ne pas planter s'il n'y a pas d'email
    const emailArtisan = prestataire.email || '';

    const resultats = await notifierArtisanGlobal({
      prestataireId: prestataire.id,
      email: emailArtisan,
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