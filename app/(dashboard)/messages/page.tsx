'use client';
import { MessageSquare, ArrowRight, Smartphone, Zap, Shield } from 'lucide-react';
const features = [
  { icon: Zap, title: 'Connexion instantanee', description: "Des qu'un chantier est accepte, WhatsApp s'ouvre." },
  { icon: Smartphone, title: 'Sur votre telephone', description: "Discutez depuis votre messagerie habituelle." },
  { icon: Shield, title: 'Contacts centralises', description: "Retrouvez vos clients dans Dashboard > Mes chantiers." },
]
export default function MessagesPage() {
  return (
    <div className="flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{minHeight: 'calc(100vh - 80px)'}}>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6">
            <MessageSquare size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vos discussions en temps reel</h1>
          <p className="text-gray-500 max-w-md mx-auto">PrestaConnect connecte artisans et clients via WhatsApp.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <feature.icon size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{feature.title}</h3>
              <p className="text-gray-500 text-xs">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Pret a demarrer ?</p>
            <p className="text-blue-200 text-xs">Consultez vos chantiers en cours</p>
          </div>
          <a href="/dashboard/chantiers" className="flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2.5 rounded-xl">
            Mes chantiers <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}