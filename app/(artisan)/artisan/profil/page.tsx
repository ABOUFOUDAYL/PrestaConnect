'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, CheckCircle2, MapPin, Phone, Briefcase, Star, Edit2, Save, X, FileBadge } from 'lucide-react'

// Séparation des métiers selon les exigences de la plateforme
const METIERS_AVEC_DIPLOME = [
  "Électricien", "Électricien automobile", "Technicien en informatique", 
  "Climatiseur", "Installateur de panneaux solaires", "Technicien en alarme et sécurité"
]

const METIERS_SANS_DIPLOME = [
  "Plombier", "Maçon", "Menuisier", "Charpentier", "Peintre", "Carreleur", 
  "Soudeur", "Mécanicien", "Serrurier", "Vitrier", "Couvreur", "Jardinier", 
  "Électroménagiste", "Ferrailleur", "Poseur de faux plafond", "Plâtrier", 
  "Carrossier", "Vulcanisateur", "Tapissier", "Cuisiniste", "Fontainier", 
  "Paysagiste", "Décorateur d'intérieur", "Réparateur d'électroménager", 
  "Tôlier", "Poseur de parquet", "Réparateur de téléphones"
]

const TOUS_LES_METIERS = [...METIERS_AVEC_DIPLOME, ...METIERS_SANS_DIPLOME].sort()

const VILLES_BENIN = [
  "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Bohicon", "Natitingou",
  "Abomey", "Kandi", "Lokossa", "Ouidah", "Djougou", "Savalou", "Nikki",
  "Malanville", "Banikoara", "Tchaourou", "Dassa-Zoumé", "Comè", "Pobè",
  "Aplahoué", "Dogbo", "Sèmè-Podji", "Allada", "Grand-Popo",
].sort()

// Initialisation hors du composant pour éviter les recréations à chaque rendu
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ArtisanProfilPage() {
  const [profile, setProfile] = useState({
    nom: '', prenom: '', metier: '', ville: '',
    telephone: '', description: '', disponible: true,
    diplome_verifie: false // Nouveau champ pour le statut
  })
  const [stats, setStats] = useState({ note: 0, avis: 0, missions: 0 })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vérifie dynamiquement si le métier sélectionné requiert un diplôme
  const requiresDiploma = useMemo(() => 
    METIERS_AVEC_DIPLOME.includes(profile.metier), 
  [profile.metier])

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (prof) {
        setProfile({
          nom: prof.nom || presta?.nom || '',
          prenom: prof.prenom || '',
          metier: presta?.metier || '',
          ville: presta?.ville || prof.ville || '',
          telephone: presta?.telephone || prof.telephone || '',
          description: presta?.description || '',
          disponible: prof.disponible ?? true,
          diplome_verifie: presta?.diplome_verifie ?? false,
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
    if (!profile.nom || !profile.prenom || !profile.metier) {
      setError("Veuillez remplir les champs obligatoires (Nom, Prénom, Métier).")
      return
    }

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

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
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.')
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
    <div className="max-w-3xl mx-auto space-y-6 p-4">
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

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl border-2 border-white/40 shrink-0">
            {initials || '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{fullName || 'Nom non renseigné'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-orange-100 text-sm font-medium">{profile.metier || 'Métier non renseigné'}</p>
              {requiresDiploma && (
                <span className={`flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${profile.diplome_verifie ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                  <FileBadge className="h-3 w-3" />
                  {profile.diplome_verifie ? 'Diplôme vérifié' : 'Diplôme requis'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              {profile.ville && (
                <span className="flex items-center gap-1 text-xs text-orange-100 bg-black/10 px-2 py-1 rounded-lg">
                  <MapPin className="h-3 w-3" /> {profile.ville}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${profile.disponible ? 'bg-green-400/30 text-green-100' : 'bg-gray-400/30 text-gray-100'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${profile.disponible ? 'bg-green-300' : 'bg-gray-300'}`} />
                {profile.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.note > 0 ? stats.note.toFixed(1) : '—'}</p>
            <p className="text-xs text-orange-100 flex items-center justify-center gap-1 mt-1"><Star className="h-3 w-3" /> Note</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-2xl font-bold">{stats.avis}</p>
            <p className="text-xs text-orange-100 mt-1">Avis clients</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.missions}</p>
            <p className="text-xs text-orange-100 mt-1">Missions</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Prénom *</label>
            {editing ? (
              <input
                value={profile.prenom}
                onChange={e => setProfile(p => ({ ...p, prenom: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            ) : (
              <p className="mt-1 font-medium text-gray-900">{profile.prenom || '—'}</p>
            )}
          </div>
          
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Nom *</label>
            {editing ? (
              <input
                value={profile.nom}
                onChange={e => setProfile(p => ({ ...p, nom: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            ) : (
              <p className="mt-1 font-medium text-gray-900">{profile.nom || '—'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Métier *
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
                  {TOUS_LES_METIERS.map(m => <option key={m} value={m} />)}
                </datalist>
                {requiresDiploma && (
                   <p className="text-[11px] text-orange-600 mt-1 flex items-center gap-1">
                     <FileBadge className="h-3 w-3" /> Ce métier nécessite de fournir un diplôme/certificat.
                   </p>
                )}
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
              className="mt-1 w-full md:w-1/2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
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
            <p className="mt-1 text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{profile.description || 'Aucune description renseignée.'}</p>
          )}
        </div>

        {editing && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="text-sm text-gray-900 font-medium block">Statut de disponibilité</label>
              <span className="text-xs text-gray-500">Apparaître dans les résultats de recherche clients</span>
            </div>
            <button
              onClick={() => setProfile(p => ({ ...p, disponible: !p.disponible }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${profile.disponible ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.disponible ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}