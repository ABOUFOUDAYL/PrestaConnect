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

    // 1. Créer l'utilisateur
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    })

    if (authError) throw authError
    const userId = authData.user?.id
    if (!userId) throw new Error('User non créé')

    // 2. Insérer le profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        user_id: userId,
        role: 'artisan',  // ← corrigé
        full_name,
        telephone,
        email,
        ville: ville || null,
        metier: metier || null,
        carte_identite_url: carte_identite_url || null,
        casier_judiciaire_url: casier_judiciaire_url || null,
        statut_verification: 'en_attente_validation',
      }, { onConflict: 'id' })

    if (profileError) throw profileError

    // 3. Insérer dans prestataires si c'est un artisan ← NOUVEAU
    if (role === 'prestataire' || role === 'artisan') {
      const { error: prestaError } = await supabaseAdmin
        .from('prestataires')
        .insert({
          user_id: userId,
          nom: full_name,
          metier: metier || 'Non renseigné',
          statut: 'en_attente',
        })

      if (prestaError) throw prestaError
    }

    return NextResponse.json({ success: true, userId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}