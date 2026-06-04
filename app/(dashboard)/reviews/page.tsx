'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Star } from 'lucide-react'

export default function ReviewsPage() {
  const [avis, setAvis] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(prof)
      setRole(prof?.role)

      if (prof?.role === 'prestataire') {
        // Récupérer les avis reçus par ce prestataire
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
        // Récupérer les avis laissés par ce client
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
        <Star key={i} size={16}
          className={i <= note ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {role === 'prestataire' ? 'Mes avis reçus' : 'Mes avis donnés'}
        </h1>
        <p className="text-gray-500 mt-1">
          {role === 'prestataire'
            ? 'Les notes laissées par vos clients'
            : 'Les notes que vous avez laissées'}
        </p>
      </div>

      {/* Moyenne globale */}
      {moyenneNote && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-black text-amber-500">{moyenneNote}</p>
            <p className="text-xs text-amber-600 font-medium mt-1">sur 5</p>
          </div>
          <div>
            {renderStars(Math.round(Number(moyenneNote)))}
            <p className="text-sm text-gray-500 mt-2">{avis.length} avis au total</p>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse">Chargement...</div>
      ) : avis.length > 0 ? (
        <div className="flex flex-col gap-4">
          {avis.map((a) => (
            <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                {renderStars(a.note)}
                <span className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {a.annonces?.titre && (
                <p className="text-xs text-blue-600 font-semibold mb-2 bg-blue-50 px-3 py-1 rounded-full w-fit">
                  {a.annonces.titre}
                </p>
              )}
              <p className="text-gray-700 leading-relaxed">
                {a.commentaire || <span className="text-gray-400 italic">Aucun commentaire.</span>}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <Star size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-bold text-lg">Aucun avis pour le moment.</p>
        </div>
      )}
    </div>
  )
}