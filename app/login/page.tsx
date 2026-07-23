import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import LoginForm from '@/components/auth/LoginForm'
import { Wrench } from 'lucide-react'

export const metadata = {
  title: 'Connexion — PrestaConnect',
  description: 'Connectez-vous à votre espace',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params?.redirect

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    if (redirectTo) {
      redirect(redirectTo)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = profile?.role

    if (role === 'admin' || role === 'super_admin') redirect('/admin/dashboard')
    else if (role === 'ambassadeur') redirect('/ambassadeur/dashboard')
    else if (role === 'artisan') redirect('/artisan/dashboard')
    else redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-12 text-white">
        <div className="max-w-sm w-full space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="font-title text-2xl font-bold">PrestaConnect</span>
          </div>
          <div className="space-y-3">
            <h1 className="font-title text-3xl font-bold leading-tight">
              Trouvez l'artisan idéal pour vos travaux
            </h1>
            <p className="text-primary-100 text-base leading-relaxed">
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
              <li key={item.text} className="flex items-center gap-3 text-sm text-primary-50">
                <span className="text-lg">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center items-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="font-title text-lg font-bold text-gray-900">PrestaConnect</span>
          </div>
          <div className="space-y-1">
            <h2 className="font-title text-2xl font-bold text-gray-900">Bon retour 👋</h2>
            <p className="text-sm text-gray-500">Connectez-vous à votre espace</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}