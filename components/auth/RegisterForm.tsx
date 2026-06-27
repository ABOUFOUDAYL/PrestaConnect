'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
}

export default function RegisterForm() {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!form.firstName.trim()) errors.firstName = 'Prénom requis'
    if (!form.lastName.trim()) errors.lastName = 'Nom requis'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Adresse email invalide'
    if (!form.password || form.password.length < 8)
      errors.password = 'Minimum 8 caractères'
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    if (!form.acceptTerms)
      errors.acceptTerms = 'Vous devez accepter les conditions'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        role: 'client',
        first_name: form.firstName,
        last_name: form.lastName,
        telephone: form.phone || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(
        data.error?.includes('already registered') || data.error?.includes('already been registered')
          ? 'Un compte existe déjà avec cet email.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      )
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Compte créé avec succès !</h3>
          <p className="text-sm text-gray-500">
            Vous pouvez maintenant vous connecter avec votre email{' '}
            <span className="font-medium text-gray-700">{form.email}</span>.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Prénom *
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Jean"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              ${fieldErrors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          />
          {fieldErrors.firstName && <p className="text-xs text-red-600">{fieldErrors.firstName}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nom *
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Dupont"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              ${fieldErrors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          />
          {fieldErrors.lastName && <p className="text-xs text-red-600">{fieldErrors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Adresse email *
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        />
        {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Téléphone <span className="text-gray-400">(optionnel)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+229 97 00 00 00"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe *
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
      </div>

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
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              ${fieldErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          />
          <button type="button" onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
      </div>

      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.acceptTerms}
            onChange={(e) => setForm((f) => ({ ...f, acceptTerms: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600"
          />
          <span className="text-sm text-gray-500">
            J'accepte les{' '}
            <Link href="/cgu" className="text-blue-600 hover:underline">Conditions d'utilisation</Link>
            {' '}et la{' '}
            <Link href="/confidentialite" className="text-blue-600 hover:underline">Politique de confidentialité</Link>
          </span>
        </label>
        {fieldErrors.acceptTerms && <p className="text-xs text-red-600">{fieldErrors.acceptTerms}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Création du compte…' : 'Créer mon compte'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Mauvais profil ?{' '}
        <Link href="/register/choice" className="text-blue-600 hover:underline font-medium">
          Changer de type de compte
        </Link>
      </p>

    </form>
  )
}