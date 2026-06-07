'use client';

import { MessageSquare, ArrowRight, Smartphone, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Connexion instantanée',
    description: "Dès qu'un chantier est accepté, WhatsApp s'ouvre automatiquement.",
  },
  {
    icon: Smartphone,
    title: 'Sur votre téléphone',
    description: "Discutez où que vous soyez, directement depuis votre messagerie.",
  },
  {
    icon: Shield,
    title: 'Contacts centralisés',
    description: "Retrouvez tous vos clients dans Dashboard → Mes chantiers.",
  },
]

export default function MessagesPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-2xl">

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-50 to-transparent rounded-full translate-y-24 -translate-x-24 pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg shadow-blue-200 mb-6">
              <MessageSquare size={36} className="text-white" />
            </div>

            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 ml-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Via WhatsApp
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              Vos discussions<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                en temps réel
              </span>
            </h1>

            <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
              PrestaConnect connecte directement artisans et clients via WhatsApp. Acceptez un chantier et la conversation démarre instantanément.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <feature.icon size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{feature.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-blue-200">
          <div>
            <p className="text-white font-semibold text-sm">Prêt à démarrer ?</p>
            <p className="text-blue-200 text-xs mt-0.5">Consultez vos chantiers en cours</p>
          </div>
          
            href="/dashboard/chantiers"
            className="flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Mes chantiers
            <ArrowRight size={16} />
          </a>
        </div>

      </div>
    </div>
  );
}