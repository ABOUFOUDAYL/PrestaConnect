import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

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

        if (role === 'admin' || role === 'super_admin') return NextResponse.redirect(`${origin}/admin/dashboard`)
        if (role === 'ambassadeur') return NextResponse.redirect(`${origin}/ambassadeur/dashboard`)
        if (role === 'artisan') return NextResponse.redirect(`${origin}/artisan/dashboard`)
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}