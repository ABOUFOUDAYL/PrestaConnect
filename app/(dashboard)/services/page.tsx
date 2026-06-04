'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, CheckCircle, AlertCircle, Save, MapPin } from 'lucide-react';

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [metier, setMetier] = useState('');
  const [ville, setVille] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchArtisanService();
  }, []);

  async function fetchArtisanService() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('metier, ville, description')
        .eq('id', user.id)
        .single();

      if (data) {
        setMetier(data.metier || '');
        setVille(data.ville || '');
        setDescription(data.description || '');
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des services :", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          metier: metier,
          ville: ville,
          description: description
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Vos compétences ont été mises à jour avec succès au Bénin !' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde de vos données.' });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Chargement de votre profil métier...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mes Services</h1>
        <p className="text-gray-500 mt-2 font-medium">Gérez votre visibilité et vos informations professionnelles.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Briefcase size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Spécialisation &amp; Zone</h3>
            <p className="text-xs text-gray-400">Ces critères définissent les demandes de chantiers que vous recevez.</p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Votre Corps de Métier</label>
            <input 
              type="text" 
              value={metier} 
              onChange={(e) => setMetier(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Ex: Électricien, Maçon, Plombier, Frigoriste..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Zone d'intervention (Bénin)</label>
            <div className="relative">
              <input 
                type="text" 
                value={ville} 
                onChange={(e) => setVille(e.target.value)}
                className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Ex: Cotonou, Calavi, Porto-Novo..."
                required
              />
              <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Présentation de vos compétences</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
              placeholder="Décrivez brièvement votre savoir-faire pour rassurer les clients..."
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={updating}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          <Save size={20} />
          {updating ? 'Mise à jour...' : 'Enregistrer mon profil professionnel'}
        </button>
      </form>
    </div>
  );
}