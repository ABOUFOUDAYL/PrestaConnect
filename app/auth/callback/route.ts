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
  const requestedRole = searchParams.get('role') // 'artisan' si venant du bouton Google artisan

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

        let role = profile?.role

        // Si la personne vient du bouton Google "artisan" et que le trigger
        // handle_new_user() a mis un rôle par défaut différent, on force le rôle
        // artisan sur le profil (uniquement dans ce cas précis).
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

        if (role === 'admin' || role === 'super_admin') return NextResponse.redirect(`${baseHost}/admin/dashboard`)
        if (role === 'ambassadeur') return NextResponse.redirect(`${baseHost}/ambassadeur/dashboard`)

        if (role === 'artisan') {
          // Vérifie si une ligne prestataires existe déjà pour cet utilisateur
          const { data: presta, error: prestaError } = await supabaseAdmin
            .from('prestataires')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (prestaError) {
            console.error('Erreur vérification prestataires (auth callback):', prestaError)
          }

          if (!presta) {
            // Première connexion artisan via Google : crée une ligne prestataires
            // minimale, à compléter dans l'onboarding (métier, ville, qualification).
            const fullName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'Artisan'

            const { error: insertError } = await supabaseAdmin
              .from('prestataires')
              .insert({
                user_id: user.id,
                nom: fullName,
                metier: 'Non renseigné',
                statut: 'en_attente',
              })

            if (insertError) {
              console.error('Erreur création prestataires (auth callback):', insertError)
            }

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