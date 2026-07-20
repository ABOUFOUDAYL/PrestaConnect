'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface FormData {
  email: string
  password: string
}

interface FieldErrors {
  email?: string
  password?: string
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const [form, setForm] = useState<FormData>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Adresse email invalide'
    }
    if (!form.password) {
      errors.password = 'Mot de passe requis'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
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

    router.refresh()

    if (redirectTo) {
      router.replace(redirectTo)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

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
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            ${fieldErrors.email
              ? 'border-red-400 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-600">{fieldErrors.email}</p>
        )}
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
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              ${fieldErrors.password
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Connexion en cours…' : 'Se connecter'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-primary-600 hover:underline">
          Créer un compte
        </Link>
      </p>

    </form>
  )
}