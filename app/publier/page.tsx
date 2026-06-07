'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowRight, FileText } from 'lucide-react';

const METIERS = ['Macon','Electricien','Plombier','Peintre','Menuisier','Carreleur','Couvreur','Soudeur','Mecanicien','Coiffeur','Couturier','Cuisinier','Jardinier','Climaticien','Informaticien','Photographe','Chauffeur','Autre'];
const VILLES = ['Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon','Natitingou','Ouidah','Lokossa','Djougou','Autre'];

export default function PublierAnnoncePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [form, setForm] = useState({ titre: '', description: '', metier_requis: '', type_annonce: 'urgent', ville: '', quartier: '', budget_estime: '' });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setClientId(user.id);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    setLoading(true);
    setError('');
    try {
      const { data: clientData, error: clientError } = await supabase.from('clients').select('id').eq('user_id', clientId).single();
      if (clientError || !clientData) throw new Error('Client introuvable');
      const { error: dbError } = await supabase.from('annonces').insert({
        client_id: clientData.id,
        titre: form.titre,
        description: form.description,
        metier_requis: form.metier_requis,
        type_annonce: form.type_annonce,
        ville: form.ville,
        quartier: form.quartier || null,
        budget_estime: form.budget_estime ? Number(form.budget_estime) : null,
        statut: 'active',
      });
      if (dbError) throw dbError;
      router.push('/dashboard/annonces');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Poster une annonce</h1>
            <p className="text-slate-500 text-sm mt-1">Decrivez votre besoin, les artisans vous contactent</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre de l annonce</label>
              <input name="titre" type="text" required value={form.titre} onChange={handleChange}
                placeholder="Ex : Besoin d un electricien"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" required value={form.description} onChange={handleChange} rows={4}
                placeholder="Decrivez votre besoin en detail..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Metier requis</label>
                <select name="metier_requis" required value={form.metier_requis} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-slate-300 transition">
                  <option value="">Choisir un metier</option>
                  {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de mission</label>
                <select name="type_annonce" required value={form.type_annonce} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-slate-300 transition">
                  <option value="urgent">Urgent</option>
                  <option value="gros_chantier">Gros chantier</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                <select name="ville" required value={form.ville} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-slate-300 transition">
                  <option value="">Choisir une ville</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quartier (optionnel)</label>
                <input name="quartier" type="text" value={form.quartier} onChange={handleChange}
                  placeholder="Ex : Cadjehoun"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget estime en FCFA (optionnel)</label>
              <input name="budget_estime" type="number" value={form.budget_estime} onChange={handleChange}
                placeholder="Ex : 25000"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 bg-slate-900 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-700 transition disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Publication en cours...</span></> : <><span>Publier l annonce</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
