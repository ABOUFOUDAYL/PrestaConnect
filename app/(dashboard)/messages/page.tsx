'use client';

import { MessageSquare, ExternalLink } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="text-center bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-sm max-w-md flex flex-col items-center">
        <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl mb-6">
          <MessageSquare size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Vos discussions sur WhatsApp
        </h1>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          PrestaConnect met directement en relation les artisans et les clients via WhatsApp. Lorsque vous acceptez un chantier, la discussion s'ouvre instantanément sur votre application de messagerie.
        </p>

        <div className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left text-xs text-gray-500 mb-2">
          💡 **Astuce :** Retrouvez tous les contacts de vos clients en cours dans l'onglet **Dashboard &gt; Mes chantiers**.
        </div>
      </div>
    </div>
  );
}