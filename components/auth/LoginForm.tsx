'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, Clock } from 'lucide-react'
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

  const [authStep, setAuthStep] = useState<'credentials' | 'otp_verify'>('credentials')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  
  const [timeLeft, setTimeLeft] = useState(120)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (authStep === 'otp_verify' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [authStep, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function validateCredentials(): boolean {
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

  // Connexion / inscription client via Google.
  // Pas de paramètre "role" : le trigger SQL handle_new_user() applique
  // le rôle par défaut (client). Le callback redirige ensuite vers /dashboard.
  async function handleGoogleLogin() {
    setSocialLoading(true)
    setError(null)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo
          ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
          : `${window.location.origin}/auth/callback`,
      },
    })

    if (oauthError) {
      setError('Impossible de continuer avec Google pour le moment.')
      setSocialLoading(false)
    }
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateCredentials()) return

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    })

    if (authError) {
      const msg = authError.message
      if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter.')
      } else {
        setError(`Erreur : ${msg}`)
      }
      setLoading(false)
      return
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
    })

    if (otpError) {
      setError("Erreur lors de l'envoi du code de sécurité. Veuillez réessayer.")
      setLoading(false)
      return
    }

    setTimeLeft(120)
    setAuthStep('otp_verify')
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    
    if (timeLeft === 0) {
      setError('Le code a expiré. Veuillez recommencer la procédure de connexion.')
      return
    }

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

      {authStep === 'credentials' && (
        <>
          {/* BOUTON CONNEXION GOOGLE */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={socialLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[.98] disabled:opacity-60"
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

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase">Ou avec votre email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleCredentialsSubmit} noValidate className="space-y-5">
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
              {loading ? 'Vérification...' : 'Continuer'}
            </button>
          </form>
        </>
      )}

      {authStep === 'otp_verify' && (
        <form onSubmit={handleVerifyOtp} noValidate className="space-y-5">
          <div className="rounded-xl bg-primary-50 p-4 flex flex-col items-center text-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary-600" />
            <p className="text-sm text-primary-900">
              Par mesure de sécurité, un code à 6 chiffres a été envoyé à <br />
              <span className="font-semibold">{email}</span>.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 text-center">
              Saisissez le code de vérification
            </label>
            <input
              id="token"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={timeLeft === 0 || loading}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:bg-gray-50"
            />
            {fieldErrors.token && <p className="text-xs text-red-600 text-center">{fieldErrors.token}</p>}
            
            <div className="flex justify-center items-center gap-2 mt-2">
              <Clock className={`h-4 w-4 ${timeLeft > 0 ? 'text-gray-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${timeLeft > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                {timeLeft > 0 ? `Code valide pendant : ${formatTime(timeLeft)}` : 'Le code a expiré'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || timeLeft === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Connexion en cours...' : 'Valider et accéder au tableau de bord'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setAuthStep('credentials'); setToken(''); setError(null); }}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 underline"
            >
              {timeLeft === 0 ? 'Renvoyer un nouveau code' : 'Annuler et revenir en arrière'}
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