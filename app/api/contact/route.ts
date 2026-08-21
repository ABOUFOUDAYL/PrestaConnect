import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { nom, contact, sujet, message } = await req.json()

    if (!nom || !contact || !sujet || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const isEmail = /\S+@\S+\.\S+/.test(contact)

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PrestaConnect <onboarding@resend.dev>',
        to: ['sabirousayo@gmail.com'],
        ...(isEmail ? { reply_to: contact } : {}),
        subject: `[Contact] ${sujet} - ${nom}`,
        text: `Nom: ${nom}\nContact: ${contact}\nSujet: ${sujet}\n\nMessage:\n${message}`,
      }),
    })

    if (!resendRes.ok) {
      const errData = await resendRes.json().catch(() => ({}))
      console.error('Erreur Resend:', errData)
      return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 })
    }

    return NextResponse.json({ message: 'Message envoyé avec succès' }, { status: 200 })
  } catch (error: any) {
    console.error('Erreur route contact:', error)
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 })
  }
}