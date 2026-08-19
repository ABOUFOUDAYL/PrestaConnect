import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, nom } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'PrestaConnect <onboarding@resend.dev>',
        to: [email],
        subject: 'Complétez votre profil sur PrestaConnect',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #f97316;">Bonjour ${nom || 'Artisan'},</h2>
            <p>Pour que vous apparaissiez au niveau des artisans reconnus sur PrestaConnect, vous devez compléter votre profil en fournissant vos pièces justificatives.</p>
            <p>Veuillez cliquer sur le bouton ci-dessous pour finaliser votre inscription :</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://presta-connect.vercel.app'}/artisan/complete-documents" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Compléter mon profil</a>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">Cordialement,<br/>L'équipe PrestaConnect</p>
          </div>
        `
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}