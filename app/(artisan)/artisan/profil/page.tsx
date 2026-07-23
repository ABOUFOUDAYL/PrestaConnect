'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, CheckCircle2, MapPin, Phone, Briefcase, Star, Edit2, Save, X } from 'lucide-react'

const METIERS_BENIN = [
  "Plombier", "Électricien", "Maçon", "Menuisier", "Charpentier", "Peintre",
  "Carreleur", "Climatiseur", "Soudeur", "Mécanicien", "Serrurier", "Vitrier",
  "Couvreur", "Jardinier", "Électroménagiste", "Ferrailleur", "Poseur de faux plafond",
  "Technicien en informatique", "Plâtrier", "Électricien automobile", "Carrossier",
  "Vulcanisateur", "Tapissier", "Cuisiniste", "Installateur de panneaux solaires",
  "Fontainier", "Paysagiste", "Décorateur d'intérieur", "Réparateur d'électroménager",
  "Tôlier", "Poseur de parquet", "Technicien en alarme et sécurité", "Réparateur de téléphones",
]

const VILLES_BENIN = [
  "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Bohicon", "Natitingou",
  "Abomey", "Kandi", "Lokossa", "Ouidah", "Djougou", "Savalou", "Nikki",
  "Malanville", "Banikoara", "Tchaourou", "Dassa-Zoumé", "Comè", "Pobè",
  "Aplahoué", "Dogbo", "Sèmè-Podji", "Allada", "Grand-Popo",
]

export default function ArtisanProfilPage() {
  const [profile, setProfile] = useState({
    nom: '', prenom: '', metier: '', ville: '',
    telephone: '', description: '', disponible: true,
  })
  const [stats, setStats] = useState({ note: 0, avis: 0, missions: 0 })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (prof) {
        setProfile({
          nom: presta?.nom || prof.nom || '',
          prenom: prof.prenom || '',
          metier: presta?.metier || '',
          ville: presta?.ville || prof.ville || '',
          telephone: presta?.telephone || prof.telephone || '',
          description: presta?.description || '',
          disponible: prof.disponible ?? true,
        })
        setStats({
          note: presta?.note || 0,
          avis: presta?.nb_avis || 0,
          missions: presta?.nb_missions || 0,
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profUpdate, prestaUpdate] = await Promise.all([
      supabase.from('profiles').update({
        prenom: profile.prenom,
        ville: profile.ville,
        telephone: profile.telephone,
        disponible: profile.disponible,
      }).eq('user_id', user.id),

      supabase.from('prestataires').update({
        nom: profile.nom,
        metier: profile.metier,
        ville: profile.ville,
        telephone: profile.telephone,
        description: profile.description,
      }).eq('user_id', user.id),
    ])

    if (profUpdate.error || prestaUpdate.error) {
      setError('Erreur lors de la sauvegarde.')
    } else {
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const fullName = `${profile.prenom} ${profile.nom}`.trim()
  const initials = `${profile.prenom?.[0] || ''}${profile.nom?.[0] || ''}`.toUpperCase()

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition"
          >
            <Edit2 className="h-4 w-4" /> Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              <X className="h-4 w-4" /> Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
          <CheckCircle2 className="h-4 w-4" /> Profil mis à jour avec succès
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl border-2 border-white/40">
            {initials || '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{fullName || 'Nom non renseigné'}</h2>
            <p className="text-orange-100 text-sm mt-0.5">{profile.metier || 'Métier non renseigné'}</p>
            <div className="flex items-center gap-3 mt-2">
              {profile.ville && (
                <span className="flex items-center gap-1 text-xs text-orange-100">
                  <MapPin className="h-3 w-3" /> {profile.ville}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.disponible ? 'bg-green-400/30 text-green-100' : 'bg-gray-400/30 text-gray-100'}`}>
                {profile.disponible ? '● Disponible' : '● Indisponible'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
          <div className="text-center">
            <p className="text-xl font-bold">{stats.note > 0 ? stats.note.toFixed(1) : '—'}</p>
            <p className="text-xs text-orange-100 flex items-center justify-center gap-1"><Star className="h-3 w-3" /> Note</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{stats.avis}</p>
            <p className="text-xs text-orange-100">Avis clients</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{stats.missions}</p>
            <p className="text-xs text-orange-100">Missions</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">
          Informations personnelles
        </h3>

        <div className="grid grid-cols-2 gap-5">
          {[
            { label: 'Prénom', key: 'prenom' },
            { label: 'Nom', key: 'nom' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</label>
              {editing ? (
                <input
                  value={profile[key as keyof typeof profile] as string}
                  onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              ) : (
                <p className="mt-1 font-medium text-gray-900">{profile[key as keyof typeof profile] as string || '—'}</p>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> Métier
          </label>
          {editing ? (
            <div className="mt-1">
              <input
                type="text"
                list="metiers-profil"
                value={profile.metier}
                onChange={e => setProfile(p => ({ ...p, metier: e.target.value }))}
                placeholder="Ex: Plombier, Électricien..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
              <datalist id="metiers-profil">
                {METIERS_BENIN.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
          ) : (
            <p className="mt-1 font-medium text-gray-900">{profile.metier || '—'}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Ville
          </label>
          {editing ? (
            <div className="mt-1">
              <input
                type="text"
                list="villes-profil"
                value={profile.ville}
                onChange={e => setProfile(p => ({ ...p, ville: e.target.value }))}
                placeholder="Ex: Cotonou"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
              <datalist id="villes-profil">
                {VILLES_BENIN.map(v => <option key={v} value={v} />)}
              </datalist>
            </div>
          ) : (
            <p className="mt-1 font-medium text-gray-900">{profile.ville || '—'}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
            <Phone className="h-3 w-3" /> Téléphone
          </label>
          {editing ? (
            <input
              value={profile.telephone}
              onChange={e => setProfile(p => ({ ...p, telephone: e.target.value }))}
              placeholder="+229 97 00 00 00"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            />
          ) : (
            <p className="mt-1 font-medium text-gray-900">{profile.telephone || '—'}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Description</label>
          {editing ? (
            <textarea
              value={profile.description}
              onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
              rows={4}
              placeholder="Décrivez votre activité, votre expérience, vos spécialités..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none"
            />
          ) : (
            <p className="mt-1 text-gray-700 text-sm leading-relaxed">{profile.description || 'Aucune description renseignée.'}</p>
          )}
        </div>

        {editing && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <label className="text-sm text-gray-600 font-medium">Disponibilité</label>
            <button
              onClick={() => setProfile(p => ({ ...p, disponible: !p.disponible }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${profile.disponible ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.disponible ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-gray-600">{profile.disponible ? 'Disponible' : 'Indisponible'}</span>
          </div>
        )}
      </div>
    </div>
  )
}