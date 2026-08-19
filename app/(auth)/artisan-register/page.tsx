'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const DOCUMENT_TYPES = [
  { id: 'cni', label: "Carte d'identité (CNI)" },
  { id: 'cip', label: 'Carte d\'Identification Personnelle (CIP)' },
  { id: 'diplome', label: 'Diplôme' },
  { id: 'casier', label: 'Casier judiciaire' },
]

const COLUMN_MAP: Record<string, string> = {
  cni: 'piece_identite_url',
  cip: 'carte_artisan_url',
  diplome: 'diplome_url',
  casier: 'casier_judiciaire_url',
}

export default function ArtisanRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    metier: '',
    ville: '',
    qualification_type: 'diplome', // Valeur par défaut
  })

  const [documents, setDocuments] = useState<Record<string, File | null>>({
    cni: null, cip: null, diplome: null, casier: null,
  })

  // Déterminer les documents à afficher selon le type de qualification
  const visibleDocuments = form.qualification_type === 'diplome' 
    ? DOCUMENT_TYPES.filter(doc => ['cni', 'cip', 'diplome'].includes(doc.id))
    : DOCUMENT_TYPES.filter(doc => ['cni', 'cip', 'casier'].includes(doc.id))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (type: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }))
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Création du compte via l'API
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        role: 'artisan',
        first_name: form.first_name,
        last_name: form.last_name,
        telephone: form.phone || null,
        ville: form.ville || null,
        metier: form.metier || null,
        qualification_type: form.qualification_type, // On envoie la qualification au backend
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(
        data.error?.includes('already registered') || data.error?.includes('already been registered')
          ? 'Un compte existe déjà avec cet email.'
          : (data.error || 'Une erreur est survenue. Veuillez réessayer.')
      )
      setLoading(false)
      return
    }

    const userId = data.userId

    if (userId) {
      // 2. Connexion immédiate pour autoriser l'upload (RLS)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        console.error("Erreur de connexion post-inscription:", signInError)
        router.push('/artisan-login?registered=true')
        return
      }

      // 3. Upload des documents visibles uniquement
      const updates: Record<string, string> = {}

      for (const [type, file] of Object.entries(documents)) {
        if (file && visibleDocuments.find(doc => doc.id === type)) {
          const path = `documents/${userId}/${type}/${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('Documents')
            .upload(path, file, { upsert: true })

          if (uploadError) {
            console.error(`Erreur upload document ${type}:`, uploadError)
            continue
          }

          const column = COLUMN_MAP[type]
          if (column) {
            updates[column] = path
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('prestataires')
          .update(updates)
          .eq('user_id', userId)

        if (updateError) {
          console.error('Erreur mise à jour URLs documents:', updateError)
        }
      }
    }

    router.push('/artisan-login?registered=true')
  }

  async function handleGoogleSignup() {
    setSocialLoading(true)
    setError('')

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=artisan`,
      },
    })

    if (oauthError) {
      setError('Impossible de continuer avec Google pour le moment.')
      setSocialLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inscription Artisan</h1>
          <p className="text-gray-500 text-sm mt-1">Étape {step} sur 2</p>
        </div>

        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={socialLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[.98] disabled:opacity-60 mb-4"
            >
              {socialLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.17 21.31 7.27 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.08-3.16z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.27 0 3.17 2.69 1.19 6.6l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                </svg>
              )}
              Continuer avec Google
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase">Ou avec votre email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange} required
                    placeholder="Jean"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange} required
                    placeholder="Dupont"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required
                  placeholder="+229 00 00 00 00"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              
              {/* NOUVEAU CHAMP : Type de qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau de qualification</label>
                <select 
                  name="qualification_type" 
                  value={form.qualification_type} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="diplome">Diplômé(e)</option>
                  <option value="non_diplome">Non diplômé(e) / Apprentissage sur le tas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Métier</label>
                  <input name="metier" value={form.metier} onChange={handleChange} required
                    placeholder="Plombier..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                  <input name="ville" value={form.ville} onChange={handleChange} required
                    placeholder="Cotonou..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <button type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
                Continuer →
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Téléversez vos documents pour validation. Au moins un document est requis.
            </p>
            {visibleDocuments.map(doc => (
              <div key={doc.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{doc.label}</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => handleFileChange(doc.id, e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                />
              </div>
            ))}
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                {loading ? 'Inscription...' : "S'inscrire"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/artisan-login" className="text-orange-600 hover:text-orange-700 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}