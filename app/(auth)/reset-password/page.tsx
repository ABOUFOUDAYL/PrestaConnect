import { Wrench } from 'lucide-react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Nouveau mot de passe — PrestaConnect',
  description: 'Choisissez un nouveau mot de passe pour votre compte',
}

export default function ResetPasswordPage() {
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
              Choisissez un mot de passe sécurisé
            </h1>
            <p className="text-blue-100 text-base leading-relaxed">
              Votre nouveau mot de passe doit être différent de l'ancien et contenir au minimum 8 caractères.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: '🔒', text: 'Minimum 8 caractères' },
              { icon: '💡', text: 'Mélangez lettres, chiffres et symboles' },
              { icon: '🚫', text: 'Évitez les mots de passe évidents' },
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

          {/* Icône + titre */}
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h2>
              <p className="text-sm text-gray-500">
                Choisissez un mot de passe sécurisé pour votre compte
              </p>
            </div>
          </div>

          <ResetPasswordForm />

        </div>
      </div>
    </div>
  )
}