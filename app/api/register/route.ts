import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      email,
      password,
      role,
      full_name,
      telephone,
      ville,
      metier,
      carte_identite_url,
      casier_judiciaire_url,
    } = body

    // 1. Créer l'utilisateur avec le client admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    })

    if (authError) throw authError
    const userId = authData.user?.id
    if (!userId) throw new Error('User non créé')

    // 2. Insérer le profil directement
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        user_id: userId,
        role,
        full_name,
        telephone,
        email,
        ville: ville || null,
        metier: metier || null,
        carte_identite_url: carte_identite_url || null,
        casier_judiciaire_url: casier_judiciaire_url || null,
        statut_verification: role === 'prestataire' ? 'en_attente_validation' : null,
      }, { onConflict: 'id' })

    if (profileError) throw profileError

    return NextResponse.json({ success: true, userId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
