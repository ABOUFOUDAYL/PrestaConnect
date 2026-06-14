import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { FacturePDF } from '@/lib/pdf-templates'
import React from 'react'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { data: tx, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !tx) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    const facture = {
      numero: tx.id.slice(0, 8).toUpperCase(),
      date: new Date(tx.created_at).toLocaleDateString('fr-FR'),
      client_nom: tx.client_nom || 'Client PrestaConnect',
      artisan_nom: tx.artisan_nom || 'Artisan PrestaConnect',
      description: tx.description || 'Prestation de service',
      montant: tx.montant,
      statut: tx.statut === 'approuve' ? 'Payé' : 'En attente',
    }

    const element = React.createElement(FacturePDF, { facture }) as any
    const buffer = await renderToBuffer(element)
    const uint8Array = new Uint8Array(buffer)

    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${facture.numero}.pdf"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}