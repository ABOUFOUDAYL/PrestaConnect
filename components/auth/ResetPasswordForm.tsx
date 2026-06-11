'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type PasswordStrength = 'faible' | 'moyen' | 'fort'

function getStrength(password: string): PasswordStrength {
  if (password.length < 6) return 'faible'
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)
  const score = [password.length >= 8, hasUpper, hasNumber, hasSymbol].filter(Boolean).length
  if (score <= 2) return 'faible'
  if (score === 3) return 'moyen'
  return 'fort'
}

const strengthConfig = {
  faible: { label: 'Faible', color: 'bg-red-400', width: 'w-1/3', text: 'text-red-500' },
  moyen:  { label: 'Moyen', color: 'bg-yellow-400', width: 'w-2/3', text: 'text-yellow-500' },
  fort:   { label: 'Fort',  color: 'bg-green-500', width: 'w-full', text: 'text-green-500' },
}

interface FieldErrors {
  password?: string
  confirmPassword?: string
}

export default function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [sessionReady, setSessionReady] = useState(false)

  const strength = password.length > 0 ? getStrength(password) : null
  const config = strength ? strengthConfig[strength] : null

  // Vérifie que la session de reset est bien active (token dans l'URL)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!password || password.length < 8) {
      errors.password = 'Minimum 8 caractères'
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError('Une erreur est survenue. Le lien est peut-être expiré.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirection automatique après 3 secondes
    setTimeout(() => router.push('/login'), 3000)
  }

  // État succès
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Mot de passe mis à jour !
          </h3>
          <p className="text-sm text-gray-500">
            Votre mot de passe a été réinitialisé avec succès.
            <br />
            Vous allez être redirigé vers la connexion…
          </p>
        </div>
        <Link
          href="/login"
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-blue-700 transition"
        >
          Se connecter maintenant
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Erreur globale */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Nouveau mot de passe */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Nouveau mot de passe *
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              ${fieldErrors.password
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-600">{fieldErrors.password}</p>
        )}

        {/* Indicateur de force */}
        {password.length > 0 && config && (
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${config.color} ${config.width}`}
              />
            </div>
            <p className={`text-xs font-medium ${config.text}`}>
              Force du mot de passe : {config.label}
            </p>
          </div>
        )}
      </div>

      {/* Confirmer mot de passe */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmer le mot de passe *
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              ${fieldErrors.confirmPassword
                ? 'border-red-400 bg-red-50'
                : confirmPassword.length > 0 && confirmPassword === password
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
        )}
        {confirmPassword.length > 0 && confirmPassword === password && (
          <p className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3 w-3" /> Les mots de passe correspondent
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Mise à jour…' : 'Réinitialiser le mot de passe'}
      </button>

      {/* Retour connexion */}
      <p className="text-center text-sm text-gray-500">
        Vous vous souvenez de votre mot de passe ?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>

    </form>
  )
}