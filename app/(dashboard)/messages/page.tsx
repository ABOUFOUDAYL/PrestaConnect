'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, Smartphone, Zap, Shield, Phone } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const features = [
  { icon: Zap, title: 'Connexion instantanee', description: "Des qu un chantier est accepte, WhatsApp s ouvre." },
  { icon: Smartphone, title: 'Sur votre telephone', description: "Discutez depuis votre messagerie habituelle." },
  { icon: Shield, title: 'Contacts centralises', description: "Retrouvez vos clients dans Dashboard > Mes chantiers." },
];

type Chantier = { id: string; title: string; status: string; client_name: string; client_phone: string; };

function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) cleaned = '229' + cleaned.slice(1);
  cleaned = cleaned.replace(/^\+/, '');
  return cleaned;
}

function buildWhatsAppLink(phone: string, clientName: string, chantierTitle: string): string {
  const number = formatWhatsAppNumber(phone);
  const message = encodeURIComponent(`Bonjour ${clientName}, je suis votre artisan PrestaConnect concernant le chantier "${chantierTitle}". Comment puis-je vous aider ?`);
  return `https://wa.me/${number}?text=${message}`;
}

export default function MessagesPage() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    async function loadChantiers() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('chantiers')
        .select(`id, title, status, profiles!chantiers_client_id_fkey (full_name, telephone, phone)`)
        .eq('artisan_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) {
        const formatted: Chantier[] = data.map((c: any) => {
          const profile = c.profiles;
          const phone = profile?.telephone || profile?.phone || '';
          return { id: c.id, title: c.title, status: c.status, client_name: profile?.full_name || 'Client', client_phone: phone };
        });
        setChantiers(formatted.filter(c => c.client_phone));
      }
      setLoading(false);
    }
    loadChantiers();
  }, []);

  return (
    <div className="flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{ minHeight: 'calc(100vh - 80px)' }}>
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
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 text-center text-gray-400 text-sm">Chargement...</div>
        ) : chantiers.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <Phone size={16} className="text-green-500" />
              Contacter vos clients via WhatsApp
            </h2>
            <div className="space-y-3">
              {chantiers.map((chantier) => (
                <div key={chantier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{chantier.title}</p>
                    <p className="text-gray-500 text-xs">{chantier.client_name}</p>
                  </div>
                  <a href={buildWhatsAppLink(chantier.client_phone, chantier.client_name, chantier.title)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.859L.057 23.998l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.214-3.733.979 1.001-3.651-.234-.374A9.818 9.818 0 1112 21.818z"/></svg>
                    WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Pret a demarrer ?</p>
            <p className="text-blue-200 text-xs">Consultez vos chantiers en cours</p>
          </div>
          <a href="/chantiers" className="flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2.5 rounded-xl">
            Mes chantiers <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
