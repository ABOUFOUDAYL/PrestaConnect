'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, MapPin, Calendar, Zap, Building2 } from 'lucide-react'
import Link from 'next/link'

const STATUTS = ['Toutes', 'Ouvert', 'En cours', 'Terminée', 'Refusée']

const STATUT_COLORS: Record<string, { color: string; bg: string }> = {
  'Ouvert': { color: '#2563eb', bg: '#eff6ff' },
  'En cours': { color: '#f97316', bg: '#fff7ed' },
  'Terminée': { color: '#16a34a', bg: '#f0fdf4' },
  'Refusée': { color: '#dc2626', bg: '#fef2f2' },
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function ArtisanDemandesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [prestataire, setPrestataire] = useState<any>(null)
  const [demandes, setDemandes] = useState<any[]>([])
  const [filtre, setFiltre] = useState('Toutes')
  const [filtreType, setFiltreType] = useState('Tous')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setPrestataire(presta)

      if (presta) {
        // Demandes encore ouvertes (visibles par tous) OU déjà assignées à cet artisan (tous statuts)
        const { data: list } = await supabase
          .from('demandes')
          .select('*')
          .or(`status.eq.Ouvert,artisan_id.eq.${user.id}`)
          .order('created_at', { ascending: false })

        if (list) {
          const sorted = list.sort((a, b) => {
            if (a.type_intervention === 'urgent' && b.type_intervention !== 'urgent') return -1
            if (b.type_intervention === 'urgent' && a.type_intervention !== 'urgent') return 1

            if (presta.latitude && presta.longitude && a.latitude && b.latitude) {
              const distA = haversine(presta.latitude, presta.longitude, a.latitude, a.longitude)
              const distB = haversine(presta.latitude, presta.longitude, b.latitude, b.longitude)
              return distA - distB
            }

            if (a.ville === presta.ville && b.ville !== presta.ville) return -1
            if (b.ville === presta.ville && a.ville !== presta.ville) return 1

            return 0
          })

          setDemandes(sorted)
        }
      }

      setIsLoading(false)
    }

    load()
  }, [])

  const filtered = demandes.filter(d => {
    if (filtre !== 'Toutes' && d.status !== filtre) return false
    if (filtreType !== 'Tous' && d.type_intervention !== filtreType) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes disponibles</h1>
        <p className="text-sm text-gray-500 mt-1">
          {filtered.length} demande{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
          {prestataire?.metier && ` · Votre métier : ${prestataire.metier}`}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltre(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
              ${filtre === s
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {['Tous', 'urgent', 'grand_projet'].map(t => (
          <button
            key={t}
            onClick={() => setFiltreType(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition
              ${filtreType === t
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {t === 'urgent' && <Zap className="h-3 w-3" />}
            {t === 'grand_projet' && <Building2 className="h-3 w-3" />}
            {t === 'Tous' ? 'Tous types' : t === 'urgent' ? 'Urgent' : 'Grand projet'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucune demande pour le moment</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(d => {
            const statutStyle = STATUT_COLORS[d.status] || { color: '#64748b', bg: '#f8fafc' }
            const isUrgent = d.type_intervention === 'urgent'
            const distance = prestataire?.latitude && d.latitude
              ? haversine(prestataire.latitude, prestataire.longitude, d.latitude, d.longitude)
              : null

            return (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {isUrgent && (
                        <span className="flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          <Zap className="h-3 w-3" /> URGENT
                        </span>
                      )}
                      {!isUrgent && (
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          <Building2 className="h-3 w-3" /> Grand projet
                        </span>
                      )}
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: statutStyle.color, background: statutStyle.bg }}
                      >
                        {d.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{d.service_nom || d.description?.slice(0, 50)}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.ville}{d.quartier ? ` · ${d.quartier}` : ''}
                    {distance !== null && (
                      <span className="ml-1 font-medium text-orange-500">
                        ({distance < 1 ? '<1' : Math.round(distance)} km)
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(d.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  {d.metier_type && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-600">
                      {d.metier_type}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{d.description}</p>

                <Link
                  href={`/artisan/demandes/${d.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition"
                >
                  Voir la demande →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}