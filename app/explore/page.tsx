'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ShieldCheck, Filter, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const METIERS_AVEC_DIPLOME = [
  "Électricien", "Plombier", "Maçon / Technicien en bâtiment",
  "Menuisier / Ébéniste", "Mécanicien automobile", "Soudeur",
  "Carreleur", "Peintre en bâtiment", "Technicien en froid et climatisation",
  "Technicien en électronique", "Coiffeur / Barbier (diplômé)",
  "Esthéticien(ne)", "Photographe professionnel", "Cuisinier / Chef cuisinier",
  "Pâtissier / Boulanger", "Tailleur / Couturier (diplômé)",
  "Informaticien / Technicien PC", "Agent de sécurité",
  "Chauffeur professionnel (permis D/E)", "Technicien en énergies renouvelables",
]

const METIERS_SANS_DIPLOME = [
  "Coiffeur / Barbier", "Tailleur / Couturier", "Cordonnier",
  "Tisserand", "Potier / Céramiste", "Forgeron",
  "Jardinier / Paysagiste", "Laveur de véhicules",
  "Réparateur de motos", "Réparateur d'appareils électroménagers",
  "Cuisinier traditionnel / Traiteur", "Décorateur d'événements",
  "Tresseur / Tresseuse de cheveux", "Fabricant de savon artisanal",
]

type Prestataire = {
  id: string
  user_id: string
  nom: string
  prenom: string
  metier: string
  ville: string
  quartier: string
  note_moyenne: number
  verifie: boolean
  statut: string
  latitude: number | null
  longitude: number | null
}

// Formule de Haversine : distance en km entre 2 points GPS
function calculerDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function ExplorePage() {
  const router = useRouter()
  const [prestataires, setPrestataires] = useState<Prestataire[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [metierFiltre, setMetierFiltre] = useState('Tous')
  const [categorieFiltre, setCategorieFiltre] = useState<'tous' | 'avec_diplome' | 'sans_diplome'>('tous')
  const [showFiltres, setShowFiltres] = useState(false)
  const [userPosition, setUserPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle')

  useEffect(() => {
    const fetchPrestataires = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('prestataires')
        .select('*')
        .eq('statut', 'approuve')
      if (!error) setPrestataires(data || [])
      setLoading(false)
    }
    fetchPrestataires()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setGeoStatus('success')
      },
      () => {
        setGeoStatus('denied')
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  }, [])

  const metiersFiltres = categorieFiltre === 'avec_diplome'
    ? ['Tous', ...METIERS_AVEC_DIPLOME]
    : categorieFiltre === 'sans_diplome'
    ? ['Tous', ...METIERS_SANS_DIPLOME]
    : ['Tous', ...METIERS_AVEC_DIPLOME, ...METIERS_SANS_DIPLOME]

  const prestatairesAvecDistance = prestataires.map((p) => {
    let distanceKm: number | null = null
    if (userPosition && p.latitude != null && p.longitude != null) {
      distanceKm = calculerDistanceKm(userPosition.lat, userPosition.lon, p.latitude, p.longitude)
    }
    return { ...p, distanceKm }
  })

  const prestatairesAffiches = prestatairesAvecDistance
    .filter((p) => {
      const nom = `${p.prenom || ''} ${p.nom || ''}`.toLowerCase()
      const matchRecherche =
        nom.includes(recherche.toLowerCase()) ||
        p.metier?.toLowerCase().includes(recherche.toLowerCase()) ||
        p.ville?.toLowerCase().includes(recherche.toLowerCase())
      const matchMetier = metierFiltre === 'Tous' || p.metier === metierFiltre
      const matchCategorie =
        categorieFiltre === 'tous' ||
        (categorieFiltre === 'avec_diplome' && METIERS_AVEC_DIPLOME.includes(p.metier)) ||
        (categorieFiltre === 'sans_diplome' && METIERS_SANS_DIPLOME.includes(p.metier))
      return matchRecherche && matchMetier && matchCategorie
    })
    .sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })

  return (
    <div className="min-h-screen bg-gray-50">

      <div style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }} className="px-4 pt-10 pb-16">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Trouver un artisan
          </h1>
          <p className="text-red-100 text-sm sm:text-base">
            Professionnels vérifiés et certifiés partout au Bénin 🇧🇯
          </p>
          {geoStatus === 'success' && (
            <p className="text-red-100 text-xs mt-2 flex items-center justify-center gap-1">
              <MapPin size={12} /> Triés par proximité avec votre position
            </p>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Plombier, Cotonou, nom..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 shadow-lg"
            />
            {recherche && (
              <button onClick={() => setRecherche('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'tous', label: '🔍 Tous', count: prestataires.length },
              { key: 'avec_diplome', label: '🎓 Diplômés', count: prestataires.filter(p => METIERS_AVEC_DIPLOME.includes(p.metier)).length },
              { key: 'sans_diplome', label: '🛠️ Expérimentés', count: prestataires.filter(p => METIERS_SANS_DIPLOME.includes(p.metier)).length },
            ] as const).map((cat) => (
              <button key={cat.key}
                onClick={() => { setCategorieFiltre(cat.key); setMetierFiltre('Tous') }}
                style={{
                  background: categorieFiltre === cat.key ? '#e63946' : '#f1f5f9',
                  color: categorieFiltre === cat.key ? 'white' : '#64748b',
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                {cat.label}
                <span style={{
                  background: categorieFiltre === cat.key ? 'rgba(255,255,255,0.25)' : 'white',
                  color: categorieFiltre === cat.key ? 'white' : '#64748b',
                }} className="text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {cat.count}
                </span>
              </button>
            ))}

            <button
              onClick={() => setShowFiltres(!showFiltres)}
              style={{
                background: showFiltres ? '#fff1f2' : '#f8fafc',
                color: showFiltres ? '#e63946' : '#64748b',
                border: showFiltres ? '1px solid #fecaca' : '1px solid #e2e8f0',
              }}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all">
              <Filter size={15} /> Métier
              {metierFiltre !== 'Tous' && <span className="w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>

          {showFiltres && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
                {metiersFiltres.map((metier) => (
                  <button key={metier} onClick={() => setMetierFiltre(metier)}
                    style={{
                      background: metierFiltre === metier ? '#e63946' : 'white',
                      color: metierFiltre === metier ? 'white' : '#64748b',
                      border: metierFiltre === metier ? '1px solid #e63946' : '1px solid #e2e8f0',
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all">
                    {metier}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            {loading ? 'Chargement...' : `${prestatairesAffiches.length} artisan${prestatairesAffiches.length > 1 ? 's' : ''} trouvé${prestatairesAffiches.length > 1 ? 's' : ''}`}
          </p>
          {metierFiltre !== 'Tous' && (
            <button onClick={() => setMetierFiltre('Tous')}
              className="flex items-center gap-1 text-xs font-semibold hover:underline"
              style={{ color: '#e63946' }}>
              <X size={12} /> Effacer le filtre
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full mx-auto mb-4 animate-spin"
              style={{ borderColor: '#e63946', borderTopColor: 'transparent' }} />
            <p className="text-gray-400 font-medium">Recherche des meilleurs profils...</p>
          </div>
        ) : prestatairesAffiches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mb-8">
            <ShieldCheck className="w-14 h-14 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-bold text-gray-700">Aucun artisan disponible</p>
            <p className="text-sm text-gray-400 mt-1">Revenez bientôt ou modifiez votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {prestatairesAffiches.map((p) => {
              const fullName = `${p.prenom || ''} ${p.nom || ''}`.trim() || 'Artisan'
              const initials = `${p.prenom?.[0] || ''}${p.nom?.[0] || ''}`.toUpperCase() || '?'
              const hasDiplome = METIERS_AVEC_DIPLOME.includes(p.metier)

              return (
                <div key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{ background: '#fff1f2', color: '#e63946' }}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">{fullName}</span>
                          {p.verifie && <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#e63946' }} />}
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#e63946' }}>{p.metier}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-gray-700">
                        {p.note_moyenne > 0 ? p.note_moyenne.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {p.quartier ? `${p.quartier}, ` : ''}{p.ville || 'Bénin'}
                    </span>
                    {p.distanceKm != null && (
                      <span className="ml-1 font-semibold flex-shrink-0" style={{ color: '#e63946' }}>
                        · {p.distanceKm < 1
                          ? `${Math.round(p.distanceKm * 1000)} m`
                          : `${p.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{
                        background: hasDiplome ? '#fff1f2' : '#f0fdf4',
                        color: hasDiplome ? '#e63946' : '#16a34a',
                      }}>
                      {hasDiplome ? '🎓 DIPLÔMÉ' : '🛠️ EXPÉRIMENTÉ'}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/messages?with=${p.user_id}`)}`)}
                    className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}>
                    <MessageCircle size={15} /> Contacter
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}