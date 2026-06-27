import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import RegisterProviderForm from '@/components/auth/RegisterProviderForm'
import { Wrench } from 'lucide-react'

export const metadata = {
  title: 'Inscription Artisan — PrestaConnect',
  description: 'Créez votre compte artisan PrestaConnect',
}

export default async function RegisterProviderPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/artisan/dashboard')

  return (
    <div className="flex min-h-screen">

      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-12 text-white">
        <div className="max-w-sm w-full space-y-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">PrestaConnect</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight">
              Développez votre activité avec PrestaConnect
            </h1>
            <p className="text-primary-100 text-base leading-relaxed">
              Rejoignez des centaines d'artisans vérifiés et recevez des demandes qualifiées.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: '📋', text: 'Recevez des demandes dans votre métier' },
              { icon: '💰', text: 'Développez votre chiffre d\'affaires' },
              { icon: '⭐', text: 'Construisez votre réputation en ligne' },
              { icon: '🔒', text: 'Paiements sécurisés et garantis' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-primary-50">
                <span className="text-lg">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex flex-1 flex-col justify-center items-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PrestaConnect</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Créer un compte artisan</h2>
            <p className="text-sm text-gray-500">
              Déjà un compte ?{' '}
              <a href="/login" className="text-primary-600 hover:underline font-medium">
                Se connecter
              </a>
            </p>
          </div>

          <RegisterProviderForm />

        </div>
      </div>
    </div>
  )
}