import { Wallet, CheckCircle2, UserCheck, ShieldCheck, ArrowRight, Hammer, Users, Search } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col justify-between">

      {/* SECTION HERO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none">
            Trouvez un artisan de confiance, <br />
            <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">simplement et rapidement</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            La première plateforme au Bénin qui connecte directement les particuliers avec les meilleurs professionnels locaux (électriciens, plombiers, maçons...).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/explore"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-14 rounded-2xl transition-colors shadow-lg text-base">
              <Search className="w-5 h-5" /> Trouver un prestataire
            </Link>
            <Link href="/register/provider"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 h-14 rounded-2xl transition-colors shadow-lg text-base">
              Devenir Prestataire (Artisan)
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION MODÈLE ÉCONOMIQUE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Un modèle transparent, <span className="text-blue-600">sans abonnement</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Chez PrestaConnect, vous ne payez aucun frais mensuel fixe. Vous ne dépensez que lorsque vous trouvez des opportunités réelles.
          </p>
        </div>

        {/* Carte Tarifs */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center space-y-3">
            <span className="uppercase tracking-wider text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              Tarifs Artisans
            </span>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <div className="bg-white/10 rounded-2xl px-6 py-4 flex-1">
                <p className="text-blue-100 text-sm font-medium mb-1">⚡ Cas urgent</p>
                <p className="text-4xl sm:text-5xl font-black tracking-tight">300 FCFA</p>
                <p className="text-blue-100 text-sm mt-1">par lead</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-6 py-4 flex-1">
                <p className="text-blue-100 text-sm font-medium mb-1">🏗️ Grand chantier</p>
                <p className="text-4xl sm:text-5xl font-black tracking-tight">1500 FCFA</p>
                <p className="text-blue-100 text-sm mt-1">par lead</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <p className="text-gray-600 text-center text-sm sm:text-base leading-relaxed">
              L'accès à la plateforme et l'inscription de votre profil professionnel sont <strong className="text-green-600 font-bold">100% gratuits</strong>. Vous rechargez votre portefeuille uniquement quand vous souhaitez accepter des clients.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100/50">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Zéro engagement</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Pas de contrat, pas de prélèvement automatique. Vous êtes totalement libre.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100/50">
                <UserCheck className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Clients qualifiés</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Vous ne débloquez les coordonnées que si le besoin correspond à votre métier.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100/50">
                <Wallet className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Recharge Mobile Money</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Recharges instantanées sécurisées via MTN ou Moov Money à partir de 500 FCFA.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100/50">
                <ShieldCheck className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Rentabilité assurée</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Un seul chantier de plomberie ou d'électricité rentabilise des dizaines de recharges.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER STATISTIQUES */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-black text-blue-400">100% Béninois</p>
            <p className="text-sm text-gray-400">Pensé pour le marché local</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-blue-400">10+ Domaines</p>
            <p className="text-sm text-gray-400">De métiers artisanaux couverts</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-blue-400">0% Commission</p>
            <p className="text-sm text-gray-400">Sur vos chantiers réalisés</p>
          </div>
        </div>
      </footer>

    </div>
  )
}