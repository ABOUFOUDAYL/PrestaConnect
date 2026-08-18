import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedRole = searchParams.get('role')
  const redirectParam = searchParams.get('redirect')

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

        if (profileError) {
          console.error('Erreur récupération profil (auth callback):', profileError)
        }

        let role = profile?.role

        if (requestedRole === 'artisan' && role !== 'artisan') {
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'artisan' })
            .eq('user_id', user.id)

          if (updateError) {
            console.error('Erreur mise à jour rôle artisan (auth callback):', updateError)
          } else {
            role = 'artisan'
          }
        }

        // Si un redirect personnalisé était demandé (ex: page protégée avant login),
        // on le respecte en priorité pour les rôles client. Les rôles admin/ambassadeur/artisan
        // gardent leur redirection dédiée, plus sûre que de suivre un redirect arbitraire.
        if (role === 'admin' || role === 'super_admin') return NextResponse.redirect(`${baseHost}/admin/dashboard`)
        if (role === 'ambassadeur') return NextResponse.redirect(`${baseHost}/ambassadeur/dashboard`)

        if (role === 'artisan') {
          const { data: presta, error: prestaError } = await supabaseAdmin
            .from('prestataires')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (prestaError) {
            console.error('Erreur vérification prestataires (auth callback):', prestaError)
          }

          if (!presta) {
            return NextResponse.redirect(`${baseHost}/artisan/onboarding`)
          }

          return NextResponse.redirect(`${baseHost}/artisan/dashboard`)
        }

        if (redirectParam) {
          return NextResponse.redirect(`${baseHost}${redirectParam}`)
        }

        return NextResponse.redirect(`${baseHost}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${baseHost}/login`)
}