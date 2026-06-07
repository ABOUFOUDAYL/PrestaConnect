'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Star } from 'lucide-react'

export default function ReviewsPage() {
  const [avis, setAvis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const userRole = prof?.role ?? null
      setRole(userRole)

      if (userRole === 'prestataire') {
        const { data: prestataire } = await supabase
          .from('prestataires')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (prestataire) {
          const { data } = await supabase
            .from('avis')
            .select('*, annonces(titre)')
            .eq('prestataire_id', prestataire.id)
            .order('created_at', { ascending: false })
          setAvis(data || [])
        }
      } else {
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (client) {
          const { data } = await supabase
            .from('avis')
            .select('*, annonces(titre)')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false })
          setAvis(data || [])
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const moyenneNote = avis.length > 0
    ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
    : null

  const renderStars = (note: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={15}
          className={i <= note ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">
          {role === 'prestataire' ? 'Mes avis recu0301s' : 'Mes avis donnu00e9s'}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {role === 'prestataire' ? 'Les notes laisu00e9es par vos clients' : 'Les notes que vous avez laisu00e9es'}
        </p>
      </div>
      {moyenneNote && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 flex items-center gap-8">
          <div>
            <p className="text-4xl font-bold text-amber-500">{moyenneNote}</p>
            <p className="text-xs text-gray-400 mt-1">note moyenne / 5</p>
          </div>
          <div>
            {renderStars(Math.round(Number(moyenneNote)))}
            <p className="text-sm text-gray-400 mt-2">{avis.length} avis au total</p>
          </div>
        </div>
      )}
      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse text-sm">Chargement...</div>
      ) : avis.length > 0 ? (
        <div className="flex flex-col gap-3">
          {avis.map((a) => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-center mb-3">
                {renderStars(a.note)}
                <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              {a.annonces?.titre && (
                <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">{a.annonces.titre}</span>
              )}
              <p className="text-gray-600 text-sm leading-relaxed">
                {a.commentaire || <span className="text-gray-400 italic">Aucun commentaire.</span>}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Star size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">Aucun avis pour le moment.</p>
        </div>
      )}
    </div>
  )
}