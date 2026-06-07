const fs = require('fs');

const code = `"use client";
import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, X, Clock, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

const METIERS = ['Electricien','Plombier','Macon','Peintre','Menuisier','Carreleur','Soudeur','Chauffeur','Jardinage','Nettoyage','Cuisinier','Nounou'];

export default function AnnoncesPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ description: '', metier_requis: '', budget_estime: '', urgence: false });

  useEffect(() => {
    async function fetchAnnonces() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data, error } = await supabase.from('annonces').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
        if (error) console.error(error);
        setAnnonces(data || []);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnonces();
  }, [supabase]);

  async function publier() {
    if (!form.description || !form.metier_requis) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('annonces').insert({
        client_id: user.id,
        description: form.description,
        metier_requis: form.metier_requis,
        budget_estime: form.budget_estime ? Number(form.budget_estime) : null,
        urgence: form.urgence,
      });
      setForm({ description: '', metier_requis: '', budget_estime: '', urgence: false });
      setShowForm(false);
      const { data: { user: u } } = await supabase.auth.getUser();
      const { data } = await supabase.from('annonces').select('*').eq('client_id', u.id).order('created_at', { ascending: false });
      setAnnonces(data || []);
    } finally {
      setSubmitting(false);
    }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cette annonce ?')) return;
    await supabase.from('annonces').delete().eq('id', id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
          <p className="text-sm text-gray-400 mt-0.5">Publiez une demande, les prestataires vous contacteront</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
          <Plus size={16} />Nouvelle annonce
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Publier une annonce</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Métier recherché *</label>
              <select value={form.metier_requis} onChange={e => setForm({...form, metier_requis: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option value="">Choisir un métier</option>
                {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Description *</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} placeholder="Décrivez votre besoin en détail..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Budget estimé (FCFA)</label>
              <input type="number" value={form.budget_estime} onChange={e => setForm({...form, budget_estime: e.target.value})} placeholder="Ex: 5000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl cursor-pointer" onClick={() => setForm({...form, urgence: !form.urgence})}>
              <div className={"w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors " + (form.urgence ? "bg-red-500 border-red-500" : "border-gray-300")}>
                {form.urgence && <CheckCircle size={12} className="text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">Marquer comme urgent</p>
                <p className="text-xs text-red-400">Votre annonce sera mise en avant</p>
              </div>
            </div>
            <button onClick={publier} disabled={submitting || !form.description || !form.metier_requis} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {submitting ? 'Publication en cours...' : "Publier l'annonce"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : annonces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-700 font-semibold mb-1">Aucune annonce publiée</p>
          <p className="text-gray-400 text-sm mb-6">Publiez votre première annonce pour trouver un prestataire</p>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700">
            Publier une annonce
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {annonces.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{a.metier_requis}</span>
                  {a.urgence && (
                    <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                      <AlertCircle size={11} />Urgent
                    </span>
                  )}
                </div>
                <button onClick={() => supprimer(a.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-2">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">{a.description}</p>
              <div className="flex items-center justify-between">
                {a.budget_estime && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />{Number(a.budget_estime).toLocaleString()} FCFA
                  </span>
                )}
                <span className="text-xs text-gray-300 ml-auto">{formatDate(a.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('app/(dashboard)/dashboard/annonces/page.tsx', code, 'utf8');
console.log('done!');