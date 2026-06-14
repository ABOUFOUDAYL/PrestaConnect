import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    const type = searchParams.get('type') // 'client' | 'artisan'

    if (!user_id || !type) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const column = type === 'client' ? 'user_id' : 'artisan_id'

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq(column, user_id)
      .eq('statut', 'approuve')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ factures: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}