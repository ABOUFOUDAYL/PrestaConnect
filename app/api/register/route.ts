import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Gestion robuste de l'hôte pour la production (Vercel / Domaines personnalisés)
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

        const role = profile?.role

        if (role === 'admin' || role === 'super_admin') return NextResponse.redirect(`${baseHost}/admin/dashboard`)
        if (role === 'ambassadeur') return NextResponse.redirect(`${baseHost}/ambassadeur/dashboard`)

        if (role === 'artisan') {
          // Un compte artisan créé via Google n'a pas encore de ligne dans
          // `prestataires` (métier, ville, qualification...) : ces infos ne
          // viennent pas de Google. Tant que l'onboarding n'est pas fait,
          // l'artisan resterait invisible côté admin/recherche.
          const { data: prestataire, error: prestataireError } = await supabase
            .from('prestataires')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (prestataireError) {
            console.error('Erreur récupération prestataire (auth callback):', prestataireError)
          }

          if (!prestataire) {
            return NextResponse.redirect(`${baseHost}/artisan/onboarding`)
          }

          return NextResponse.redirect(`${baseHost}/artisan/dashboard`)
        }

        return NextResponse.redirect(`${baseHost}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${baseHost}/login`)
}