'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Wrench, User, Phone } from 'lucide-react';

export default function ChantierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [demande, setDemande] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function fetchDemande() {
      const { data } = await supabase
        .from('demandes')
        .select('*')
        .eq('id', id)
        .single();
      setDemande(data);
      setLoading(false);
    }
    if (id) fetchDemande();
  }, [id]);

  async function accepterChantier() {
    setAccepting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('demandes')
      .update({ status: 'accepted', artisan_id: user.id })
      .eq('id', id);

    if (!error) {
      const phone = demande?.telephone || demande?.phone || '';
      if (phone) {
        let cleaned = phone.replace(/[\s\-\(\)]/g, '');
        if (cleaned.startsWith('0')) cleaned = '229' + cleaned.slice(1);
        cleaned = cleaned.replace(/^\+/, '');
        const message = encodeURIComponent(
          `Bonjour ${demande.client_name || ''}, je suis votre artisan PrestaConnect pour "${demande.service_nom}". Je suis disponible pour intervenir.`
        );
        window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank');
      }
      router.push('/chantiers');
    }
    setAccepting(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Chargement...</p>
    </div>
  );

  if (!demande) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Demande introuvable.</p>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={18} /> Retour
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">
            {demande.metier_type || 'Service'}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-400 font-semibold">
            <MapPin size={14} /> {demande.ville}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{demande.service_nom}</h1>
        <p className="text-gray-600 mb-8">{demande.description}</p>

        <div className="border-t border-gray-100 pt-6 space-y-3 mb-8">
          {demande.client_name && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <User size={16} className="text-gray-400" />
              <span>{demande.client_name}</span>
            </div>
          )}
          {(demande.telephone || demande.phone) && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Phone size={16} className="text-gray-400" />
              <span>{demande.telephone || demande.phone}</span>
            </div>
          )}
          {demande.budget && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Wrench size={16} className="text-gray-400" />
              <span>Budget : {demande.budget} FCFA</span>
            </div>
          )}
          {demande.quartier && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin size={16} className="text-gray-400" />
              <span>{demande.quartier}</span>
            </div>
          )}
        </div>

        <button
          onClick={accepterChantier}
          disabled={accepting || demande.status !== 'disponible'}
          className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.859L.057 23.998l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.214-3.733.979 1.001-3.651-.234-.374A9.818 9.818 0 1112 21.818z"/>
          </svg>
          {accepting ? 'Acceptation...' : 'Accepter et contacter via WhatsApp'}
        </button>
      </div>
    </div>
  );
}