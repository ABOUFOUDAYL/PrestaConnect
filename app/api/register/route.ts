import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// 1. LA FONCTION POST (Inscription classique sécurisée avec gestion de la qualification)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // On récupère bien le qualification_type envoyé par le frontend
    const { email, password, role, first_name, last_name, telephone, ville, metier, qualification_type } = body

    // 🔒 SÉCURITÉ : On bloque toute tentative de devenir admin depuis l'API
    const allowedRoles = ['artisan', 'client']
    const safeRole = allowedRoles.includes(role) ? role : 'client'

    const supabase = await createSupabaseServerClient()

    // Création de l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role: safeRole,
        }
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur." }, { status: 500 })
    }

    // Préparation de la ligne 'prestataires' si c'est un artisan
    if (safeRole === 'artisan') {
      const { error: insertError } = await supabase
        .from('prestataires')
        .upsert({
          user_id: userId,
          metier: metier || null,
          ville: ville || null,
          telephone: telephone || null,
          qualification_type: qualification_type || 'diplome' // Enregistrement du type de qualification
        }, { onConflict: 'user_id' })

      if (insertError) {
        console.error("Erreur préparation prestataire:", insertError)
      }
    }

    return NextResponse.json({ userId, success: true }, { status: 200 })

  } catch (error) {
    console.error("Erreur critique API Register:", error)
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 })
  }
}


// 2. LA FONCTION GET (Callback Google existante)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isDevelopment = process.env.NODE_ENV === 'development'
  const baseHost = isDevelopment ? origin : forwardedHost ? `https://${forwardedHost}` : origin

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) console.error('Erreur profil (auth callback):', profileError)

        const role = profile?.role

        if (role === 'admin' || role === 'super_admin') return NextResponse.redirect(`${baseHost}/admin/dashboard`)
        if (role === 'ambassadeur') return NextResponse.redirect(`${baseHost}/ambassadeur/dashboard`)

        if (role === 'artisan') {
          const { data: prestataire } = await supabase
            .from('prestataires')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (!prestataire) return NextResponse.redirect(`${baseHost}/artisan/onboarding`)
          return NextResponse.redirect(`${baseHost}/artisan/dashboard`)
        }

        return NextResponse.redirect(`${baseHost}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${baseHost}/login`)
}