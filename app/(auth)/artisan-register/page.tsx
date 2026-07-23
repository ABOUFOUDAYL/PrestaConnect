'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const DOCUMENT_TYPES = [
  { id: 'cni', label: "Carte d'identité" },
  { id: 'cip', label: 'CIP' },
  { id: 'diplome', label: 'Diplôme' },
  { id: 'attestation', label: 'Attestation' },
  { id: 'casier', label: 'Casier judiciaire' },
]

export default function ArtisanRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
  })

  const [documents, setDocuments] = useState<Record<string, File | null>>({
    cni: null, cip: null, diplome: null, attestation: null, casier: null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Passe par la même route API que l'inscription client,
    // pour que profiles / prestataires soient créés de façon cohérente.
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
      for (const [type, file] of Object.entries(documents)) {
        if (file) {
          const path = `documents/${userId}/${type}/${file.name}`
          await supabase.storage.from('artisan-documents').upload(path, file)
        }
      }
    }

    router.push('/artisan-login?registered=true')
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Métier</label>
              <input name="metier" value={form.metier} onChange={handleChange} required
                placeholder="Plombier, Électricien..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
              <input name="ville" value={form.ville} onChange={handleChange} required
                placeholder="Cotonou, Porto-Novo..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
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
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Téléversez vos documents pour validation. Au moins un document est requis.
            </p>
            {DOCUMENT_TYPES.map(doc => (
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