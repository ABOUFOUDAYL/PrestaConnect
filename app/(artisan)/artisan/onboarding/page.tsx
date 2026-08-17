'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

const QUALIFICATIONS = [
  { value: 'diplome', label: 'Diplômé(e)' },
  { value: 'non_diplome', label: 'Non diplômé(e)' },
]

export default function ArtisanOnboardingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')
  const [metier, setMetier] = useState('')
  const [qualificationType, setQualificationType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Si l'utilisateur a déjà une ligne prestataires (ex: retour en arrière
  // manuel sur cette page), on ne le laisse pas la recréer.
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/artisan-login')
        return
      }
      setUserId(user.id)
      setFullName(user.user_metadata?.full_name || '')

      const { data: existing } = await supabase
        .from('prestataires')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        router.replace('/artisan/documents')
        return
      }
      setChecking(false)
    }
    check()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    if (!ville.trim() || !metier.trim() || !qualificationType) {
      setError('Merci de remplir tous les champs.')
      return
    }

    setLoading(true)
    setError('')

    const { error: prestaError } = await supabase
      .from('prestataires')
      .insert({
        user_id: userId,
        nom: fullName || 'Artisan',
        metier: metier.trim(),
        ville: ville.trim(),
        telephone: telephone.trim() || null,
        statut: 'en_attente',
        qualification_type: qualificationType,
      })

    if (prestaError) {
      setError("Une erreur est survenue, merci de réessayer.")
      setLoading(false)
      return
    }

    router.push('/artisan/documents')
  }

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complétez votre profil</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quelques informations avant de pouvoir recevoir des demandes.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Métier</label>
            <input
              type="text"
              value={metier}
              onChange={(e) => setMetier(e.target.value)}
              required
              placeholder="Ex: Plombier, Électricien..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              required
              placeholder="Ex: Cotonou"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone <span className="text-gray-400">(optionnel)</span></label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+229 97 00 00 00"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Qualification</label>
            <div className="grid grid-cols-2 gap-3">
              {QUALIFICATIONS.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setQualificationType(q.value)}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
                    qualificationType === q.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Enregistrement...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  )
}