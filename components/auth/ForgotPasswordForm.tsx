'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate(): boolean {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Adresse email invalide')
      return false
    }
    setEmailError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (resetError) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Email envoyé !</h3>
          <p className="text-sm text-gray-500">
            Un lien de réinitialisation a été envoyé à{' '}
            <span className="font-medium text-gray-700">{email}</span>.
            <br />
            Vérifiez votre boîte de réception et vos spams.
          </p>
          <p className="text-xs text-gray-400 pt-1">
            Le lien est valable pendant <span className="font-medium">1 heure</span>.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full pt-2">
          <button
            onClick={() => { setSuccess(false); setEmail('') }}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Utiliser un autre email
          </button>
          <Link
            href="/login"
            className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-primary-700 transition"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Adresse email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-xl border px-4 py-2.5 pl-10 text-sm outline-none transition
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              ${emailError
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'}`}
          />
        </div>
        {emailError && (
          <p className="text-xs text-red-600">{emailError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>

    </form>
  )
}