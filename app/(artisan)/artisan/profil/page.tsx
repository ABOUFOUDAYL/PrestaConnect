'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function ArtisanProfilPage() {
  const [profile, setProfile] = useState({
    nom: '',
    prenom: '',
    metier: '',
    ville: '',
    telephone: '',
    description: '',
    disponible: true,
  })
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

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile({
          nom: data.nom || '',
          prenom: data.prenom || '',
          metier: data.metier || '',
          ville: data.ville || '',
          telephone: data.telephone || '',
          description: data.description || '',
          disponible: data.disponible ?? true,
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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nom: profile.nom,
        prenom: profile.prenom,
        metier: profile.metier,
        ville: profile.ville,
        telephone: profile.telephone,
        description: profile.description,
        disponible: profile.disponible,
      })
      .eq('user_id', user.id)

    if (updateError) {
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
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition
            ${editing ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            disabled:opacity-60`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? (saving ? 'Sauvegarde...' : 'Sauvegarder') : 'Modifier'}
        </button>
      </div>

      {/* Success */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-green-700 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Profil mis à jour avec succès
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Avatar + nom */}
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl">
            {initials || '?'}
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900">{fullName || 'Nom non renseigné'}</div>
            <div className="text-gray-500 text-sm">{profile.metier} · {profile.ville}</div>
            <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium
              ${profile.disponible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {profile.disponible ? '● Disponible' : '● Indisponible'}
            </span>
          </div>
        </div>

        {/* Champs */}
        {[
          { label: 'Prénom', key: 'prenom' },
          { label: 'Nom', key: 'nom' },
          { label: 'Métier', key: 'metier' },
          { label: 'Ville', key: 'ville' },
          { label: 'Téléphone', key: 'telephone' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm text-gray-500 mb-1">{label}</label>
            {editing ? (
              <input
                value={profile[key as keyof typeof profile] as string}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            ) : (
              <div className="font-medium text-gray-900">
                {profile[key as keyof typeof profile] as string || '—'}
              </div>
            )}
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">Description</label>
          {editing ? (
            <textarea
              value={profile.description}
              onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Décrivez votre activité, votre expérience..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-vertical"
            />
          ) : (
            <div className="text-gray-700 text-sm">{profile.description || '—'}</div>
          )}
        </div>

        {/* Disponibilité */}
        {editing && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Disponibilité</label>
            <input
              type="checkbox"
              checked={profile.disponible}
              onChange={e => setProfile(p => ({ ...p, disponible: e.target.checked }))}
              className="h-4 w-4 accent-orange-600"
            />
            <span className="text-sm text-gray-700">
              {profile.disponible ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}