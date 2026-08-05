'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, KeyRound, Lock } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface FieldErrors {
  email?: string
  password?: string
  token?: string
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  // Modes : 'password' | 'otp_email' | 'otp_verify'
  const [authMode, setAuthMode] = useState<'password' | 'otp_email' | 'otp_verify'>('password')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Validation commune de l'email
  function validateEmail(): boolean {
    const errors: FieldErrors = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Adresse email invalide'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validation pour le mot de passe
  function validatePasswordLogin(): boolean {
    const errors: FieldErrors = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Adresse email invalide'
    }
    if (!password) {
      errors.password = 'Mot de passe requis'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Fonction partagée pour la redirection selon le rôle
  async function handlePostLoginRedirect(userId: string) {
    router.refresh()

    if (redirectTo) {
      router.replace(redirectTo)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Erreur récupération profil:', profileError)
    }

    const role = profile?.role

    if (role === 'admin' || role === 'super_admin') {
      router.replace('/admin/dashboard')
    } else if (role === 'ambassadeur') {
      router.replace('/ambassadeur/dashboard')
    } else if (role === 'artisan') {
      router.replace('/artisan/dashboard')
    } else {
      router.replace('/dashboard')
    }
  }

  // 1. Soumission Connexion par Mot de Passe
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePasswordLogin()) return

    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    })

    if (authError || !data.user) {
      const msg = authError?.message ?? 'Erreur inconnue'
      if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter.')
      } else if (msg.includes('Too many requests')) {
        setError('Trop de tentatives. Réessayez dans quelques minutes.')
      } else {
        setError(`Erreur : ${msg}`)
      }
      setLoading(false)
      return
    }

    await handlePostLoginRedirect(data.user.id)
  }

  // 2. Étape 1 OTP : Demander l'envoi du code à 6 chiffres
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!validateEmail()) return

    setLoading(true)
    setError(null)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true, // Crée le compte automatiquement s'il n'existe pas
      },
    })

    setLoading(false)

    if (otpError) {
      setError(`Erreur lors de l'envoi du code : ${otpError.message}`)
      return
    }

    // Passage à l'écran de saisie du code à 6 chiffres
    setAuthMode('otp_verify')
  }

  // 3. Étape 2 OTP : Vérifier le code à 6 chiffres saisi
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!token || token.length !== 6) {
      setFieldErrors({ token: 'Veuillez entrer un code valide à 6 chiffres' })
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    })

    if (verifyError || !data.user) {
      setError('Code invalide ou expiré. Veuillez réessayer.')
      setLoading(false)
      return
    }

    await handlePostLoginRedirect(data.user.id)
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORMULAIRE MOT DE PASSE */}
      {authMode === 'password' && (
        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            />
            {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                  ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
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
            {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setAuthMode('otp_email'); setError(null); }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
            >
              <KeyRound className="h-4 w-4" />
              Se connecter par code unique (OTP)
            </button>
          </div>
        </form>
      )}

      {/* FORMULAIRE OTP - ÉTAPE 1 : SAISIE DE L'EMAIL */}
      {authMode === 'otp_email' && (
        <form onSubmit={handleSendOtp} noValidate className="space-y-5">
          <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary-800">
            Entrez votre adresse email pour recevoir un code de connexion unique à 6 chiffres.
          </div>

          <div className="space-y-1.5">
            <label htmlFor="otp-email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              id="otp-email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            />
            {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Envoi du code...' : 'Recevoir mon code par email'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setError(null); }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <Lock className="h-4 w-4" />
              Retour à la connexion par mot de passe
            </button>
          </div>
        </form>
      )}

      {/* FORMULAIRE OTP - ÉTAPE 2 : SAISIE DU CODE À 6 CHIFFRES */}
      {authMode === 'otp_verify' && (
        <form onSubmit={handleVerifyOtp} noValidate className="space-y-5">
          <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary-800">
            Un code à 6 chiffres a été envoyé à l'adresse <span className="font-semibold">{email}</span>. Vérifiez votre boîte mail.
          </div>

          <div className="space-y-1.5">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Code de vérification (6 chiffres)
            </label>
            <input
              id="token"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-xl tracking-widest outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            {fieldErrors.token && <p className="text-xs text-red-600">{fieldErrors.token}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Vérification...' : 'Valider et se connecter'}
          </button>

          <div className="flex items-center justify-between pt-2 text-sm">
            <button
              type="button"
              onClick={() => { setAuthMode('otp_email'); setError(null); }}
              className="text-gray-600 hover:underline"
            >
              Changer d'email
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setError(null); }}
              className="text-primary-600 font-medium hover:underline"
            >
              Par mot de passe
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-primary-600 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}