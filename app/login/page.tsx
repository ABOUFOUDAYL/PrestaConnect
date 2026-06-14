import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import LoginForm from '@/components/auth/LoginForm'
import { Wrench } from 'lucide-react'

export const metadata = {
  title: 'Connexion — PrestaConnect',
  description: 'Connectez-vous à votre espace client',
}

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen">

      {/* Panneau gauche — visuel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 px-12 text-white">
        <div className="max-w-sm w-full space-y-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">PrestaConnect</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight">
              Trouvez l'artisan idéal pour vos travaux
            </h1>
            <p className="text-blue-100 text-base leading-relaxed">
              Publiez votre demande, recevez des devis comparatifs et échangez directement avec des professionnels vérifiés.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: '🔍', text: "Recherche parmi des centaines d'artisans" },
              { icon: '📋', text: 'Devis gratuits et comparatifs' },
              { icon: '💬', text: 'Messagerie intégrée sécurisée' },
              { icon: '✅', text: 'Artisans vérifiés et notés' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-blue-50">
                <span className="text-lg">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 flex-col justify-center items-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8">

          {/* Logo mobile uniquement */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PrestaConnect</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Bon retour 👋</h2>
            <p className="text-sm text-gray-500">Connectez-vous à votre espace client</p>
          </div>

          <LoginForm />

        </div>
      </div>
    </div>
  )
}