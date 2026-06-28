'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2 } from 'lucide-react'

const METIERS = [
  'Plombier', 'Électricien', 'Maçon', 'Peintre', 'Menuisier',
  'Carreleur', 'Soudeur', 'Climatiseur', 'Jardinier', 'Informaticien',
  'Mécanicien', 'Coiffeur', 'Couturier', 'Photographe', 'Autre'
]

const VILLES = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon',
  'Kandi', 'Lokossa', 'Ouidah', 'Abomey', 'Natitingou', 'Autre'
]

const TYPES_INTERVENTION = ['À domicile', 'En atelier', 'Les deux']

export default function NouvelleDevisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    service_nom: '',
    metier_type: '',
    description: '',
    ville: '',
    quartier: '',
    telephone: '',
    type_intervention: 'À domicile',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!form.service_nom.trim()) errors.service_nom = 'Titre requis'
    if (!form.metier_type) errors.metier_type = 'Métier requis'
    if (!form.description.trim()) errors.description = 'Description requise'
    if (!form.ville) errors.ville = 'Ville requise'
    if (!form.telephone.trim()) errors.telephone = 'Téléphone requis'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('nom, prenom')
      .eq('user_id', user.id)
      .single()

    const clientName = `${profile?.prenom || ''} ${profile?.nom || ''}`.trim() || user.email

    const { error: insertError } = await supabase
      .from('demandes')
      .insert({
        client_id: user.id,
        client_name: clientName,
        service_nom: form.service_nom,
        metier_type: form.metier_type,
        description: form.description,
        ville: form.ville,
        quartier: form.quartier || null,
        telephone: form.telephone,
        type_intervention: form.type_intervention,
        status: 'Ouvert',
      })

    if (insertError) {
      setError('Erreur lors de la création. Veuillez réessayer.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/demandes'), 2000)
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-6 py-12 text-center mt-10">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900">Demande envoyée !</h2>
        <p className="text-sm text-gray-500">Votre demande a été publiée. Les artisans disponibles vont vous contacter.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
        <p className="text-sm text-gray-500 mt-1">Décrivez votre besoin pour recevoir des propositions d'artisans</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Titre */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Titre de la demande *</label>
          <input
            type="text"
            placeholder="Ex: Réparation fuite robinet cuisine"
            value={form.service_nom}
            onChange={e => setForm(f => ({ ...f, service_nom: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              ${fieldErrors.service_nom ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
          />
          {fieldErrors.service_nom && <p className="text-xs text-red-600">{fieldErrors.service_nom}</p>}
        </div>

        {/* Métier */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Type de métier *</label>
          <select
            value={form.metier_type}
            onChange={e => setForm(f => ({ ...f, metier_type: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              ${fieldErrors.metier_type ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <option value="">Sélectionner un métier</option>
            {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {fieldErrors.metier_type && <p className="text-xs text-red-600">{fieldErrors.metier_type}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Description *</label>
          <textarea
            rows={4}
            placeholder="Décrivez votre problème en détail : symptômes, urgence, contraintes particulières..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition resize-vertical
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              ${fieldErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
          />
          {fieldErrors.description && <p className="text-xs text-red-600">{fieldErrors.description}</p>}
        </div>

        {/* Ville / Quartier */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Ville *</label>
            <select
              value={form.ville}
              onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                ${fieldErrors.ville ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <option value="">Sélectionner</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {fieldErrors.ville && <p className="text-xs text-red-600">{fieldErrors.ville}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Quartier <span className="text-gray-400">(optionnel)</span></label>
            <input
              type="text"
              placeholder="Ex: Akpakpa"
              value={form.quartier}
              onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition hover:border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
          <input
            type="tel"
            placeholder="+229 97 00 00 00"
            value={form.telephone}
            onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              ${fieldErrors.telephone ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
          />
          {fieldErrors.telephone && <p className="text-xs text-red-600">{fieldErrors.telephone}</p>}
        </div>

        {/* Type intervention */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Type d'intervention</label>
          <div className="flex gap-3">
            {TYPES_INTERVENTION.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(f => ({ ...f, type_intervention: type }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition
                  ${form.type_intervention === type
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[.98] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Publication en cours…' : 'Publier ma demande'}
        </button>

      </form>
    </div>
  )
}