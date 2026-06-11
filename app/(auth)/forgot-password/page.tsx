import { Wrench } from 'lucide-react'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Mot de passe oublié — PrestaConnect',
  description: 'Réinitialisez votre mot de passe PrestaConnect',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">

      {/* Panneau gauche */}
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
              Récupérez l'accès à votre compte
            </h1>
            <p className="text-blue-100 text-base leading-relaxed">
              Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe en quelques secondes.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: '📧', text: 'Lien envoyé instantanément par email' },
              { icon: '🔒', text: 'Lien sécurisé valable 1 heure' },
              { icon: '✅', text: 'Aucune donnée perdue' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-blue-50">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PrestaConnect</span>
          </div>

          {/* Icône */}
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <span className="text-2xl">🔑</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h2>
              <p className="text-sm text-gray-500">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>
          </div>

          <ForgotPasswordForm />

        </div>
      </div>
    </div>
  )
}