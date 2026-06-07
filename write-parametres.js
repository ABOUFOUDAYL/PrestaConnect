const fs = require('fs');

const code = `"use client";
import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';

export default function ParametresPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', telephone: '', ville: '', bio: ''
  });

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setForm({
            full_name: data.full_name || '',
            email: user.email || '',
            telephone: data.telephone || data.phone || '',
            ville: data.ville || '',
            bio: data.bio || '',
          });
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  async function sauvegarder() {
    setSaving(true);
    setSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').update({
        full_name: form.full_name,
        telephone: form.telephone,
        ville: form.ville,
        bio: form.bio,
      }).eq('id', user.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch(e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
      <p className="text-sm text-gray-400 mb-8">Gérez votre profil et vos informations</p>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden">
            <User size={32} className="text-blue-600" />
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700">
            <Camera size={13} className="text-white" />
          </button>
        </div>
        <div>
          <p className="font-bold text-gray-900">{form.full_name || 'Votre nom'}</p>
          <p className="text-sm text-gray-400">{form.email}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">
          ✅ Profil mis à jour avec succès !
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 mb-4">Informations personnelles</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Nom complet</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Votre nom complet" className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.email} disabled placeholder="Votre email" className="w-full pl-9 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">L'email ne peut pas être modifié</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Téléphone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} placeholder="Ex: 0123456789" className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Ville</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} placeholder="Votre ville" className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} placeholder="Décrivez-vous en quelques mots..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <button onClick={sauvegarder} disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Save size={16} />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/(dashboard)/dashboard/parametres/page.tsx', code, 'utf8');
console.log('done!');