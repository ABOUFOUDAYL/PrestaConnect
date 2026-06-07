"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function DashboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [profile, setProfile] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prestataires' | 'annonces' | 'paiement'>('prestataires');
  const [prestataires, setPrestataires] = useState<any[]>([]);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [metierFilter, setMetierFilter] = useState<string>('tous');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', metier_requis: '', budget_estime: '' });
  const [submitting, setSubmitting] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || profile?.prenom || 'vous';
  const villeClient = profile?.ville || '';

  const fetchPrestataires = useCallback(async () => {
    setLoading(true);
    // Note : assure-toi que 'diplome_verifie' est bien le nom de ta colonne en base
    let query = supabase
      .from('profiles')
      .select('id, full_name, metier_type, metier, ville, telephone, phone, note, status, diplome_verifie')
      .in('role', ['artisan', 'prestataire'])
      .eq('status', 'valide');
      
    if (villeClient) query = query.eq('ville', villeClient);
    
    const { data } = await query.order('note', { ascending: false });
    setPrestataires(data || []);
    setLoading(false);
  }, [supabase, villeClient]);

  const fetchAnnonces = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('annonces')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    setAnnonces(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      setPageLoading(false);
    }
    loadProfile();
  }, [supabase]);

  useEffect(() => {
    if (!pageLoading) {
      if (activeTab === 'prestataires') fetchPrestataires();
      if (activeTab === 'annonces') fetchAnnonces();
    }
  }, [activeTab, pageLoading, fetchPrestataires, fetchAnnonces]);

  async function publierAnnonce() {
    if (!form.description || !form.metier_requis) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('annonces').insert({
      client_id: user.id,
      description: form.description,
      metier_requis: form.metier_requis,
      budget_estime: form.budget_estime ? Number(form.budget_estime) : null,
    });
    setForm({ description: '', metier_requis: '', budget_estime: '' });
    setShowForm(false);
    setSubmitting(false);
    fetchAnnonces();
  }

  const metiers = ['tous', ...Array.from(new Set(prestataires.map(p => p.metier_type || p.metier || 'Autre').filter(Boolean)))];
  const filtered = metierFilter === 'tous' ? prestataires : prestataires.filter(p => (p.metier_type || p.metier) === metierFilter);

  const metierEmoji: Record<string, string> = {
    'Electricien': '⚡', 'Plombier': '🔧', 'Macon': '🧱', 'Peintre': '🎨',
    'Menuisier': '🪚', 'Carreleur': '🏠', 'Soudeur': '🔥', 'Chauffeur': '🚗',
    'Jardinage': '🌱', 'Nettoyage': '🧹', 'tous': '🔍',
  };

  if (pageLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Bonjour, {firstName} !</h1>

        <div className="flex bg-white border border-gray-100 p-1.5 rounded-2xl w-fit mb-8 shadow-sm gap-1">
          {([
            { key: 'prestataires', label: 'Prestataires', emoji: '👷' },
            { key: 'annonces', label: 'Mes annonces', emoji: '📢' },
            { key: 'paiement', label: 'Paiement', emoji: '💳' },
          ] as const).map(({ key, label, emoji }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ' + (activeTab === key ? 'bg-blue-600 text-white' : 'text-gray-400')}>
              {emoji} {label}
            </button>
          ))}
        </div>

        {activeTab === 'prestataires' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => {
              const tel = p.telephone || p.phone || '';
              let waNum = tel.replace(/[\s()\-]/g, '');
              if (waNum.startsWith('0')) waNum = '229' + waNum.slice(1);
              waNum = waNum.replace(/^\+/, '');
              const waLink = tel ? 'https://wa.me/' + waNum + '?text=' + encodeURIComponent('Bonjour, j\'ai trouvé votre profil sur PrestaConnect.') : '#';
              
              // Logique paiement
              const doitPayer = p.diplome_verifie === false;

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="font-bold">{p.full_name}</p>
                  <p className="text-xs text-gray-400 mb-4">{p.metier}</p>
                  
                  {doitPayer ? (
                    <button onClick={() => alert("Redirection FedaPay : 500 FCFA")} className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm">
                      Payer 500 FCFA pour contacter
                    </button>
                  ) : (
                    <a href={waLink} target="_blank" className="w-full py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm flex justify-center">
                      Contacter sur WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}