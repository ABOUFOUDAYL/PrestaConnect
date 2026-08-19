import { NextResponse } from 'next/server';
import { envoyerNotificationGlobal } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { telephone, nom, type, dataSupplementaire } = await req.json();

    const result = await envoyerNotificationGlobal(
      telephone, 
      nom, 
      type || 'relance_dossier', 
      dataSupplementaire
    );

    if (!result.success) {
      return NextResponse.json({ error: "Échec de l'envoi sur tous les canaux" }, { status: 500 });
    }

    return NextResponse.json({ success: true, canal: result.canal });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}