"use client";
import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Search, MapPin, Star, MessageCircle, Plus, X, Clock, Briefcase, CreditCard, User } from 'lucide-react';

const METIER_EMOJI = {
  Electricien: 'E', Plombier: 'P', Macon: 'M', Peintre: 'PT',
  Menuisier: 'MN', Carreleur: 'C', Soudeur: 'S', Chauffeur: 'CH',
  Jardinage: 'J', Nettoyage: 'N', Cuisinier: 'CU', Nounou: 'NN', tous: 'T'
};

export default function DashboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [profile, setProfile] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prestataires');
  const [prestataires, setPrestataires] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [metierFilter, setMetierFilter] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', metier_requis: '', budget_estime: '', urgence: false });
  const [submitting, setSubmitting] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || 'vous';
  const villeClient = profile?.ville || '';

  const fetchPrestataires = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('profiles')
      .select('id, full_name, metier_type, metier, ville, telephone, phone, note, status, diplome_verifie, avatar_url')
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
    const { data } = await supabase.from('annonces').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
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
      urgence: form.urgence,
    });
    setForm({ description: '', metier_requis: '', budget_estime: '', urgence: false });
    setShowForm(false);
    setSubmitting(false);
    fetchAnnonces();
  }

  function getWhatsAppLink(p) {
    const tel = p.telephone || p.phone || '';
    let waNum = tel.replace(/[\s()\-]/g, '');
    if (waNum.startsWith('0')) waNum = '229' + waNum.slice(1);
    waNum = waNum.replace(/^\+/, '');
    return tel ? 'https://wa.me/' + waNum + '?text=Bonjour je viens de PrestaConnect' : '#';
  }

  const metiers = ['tous', ...Array.from(new Set(prestataires.map(p => p.metier_type || p.metier || 'Autre').filter(Boolean)))];
  const filtered = prestataires
    .filter(p => metierFilter === 'tous' || (p.metier_type || p.metier) === metierFilter)
    .filter(p => !searchQuery || p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || (p.metier || p.metier_type)?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (pageLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" /> : <User size={20} className="text-blue-600" />}
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Espace Client</p>
              <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} !</h1>
            </div>
          </div>
          {villeClient && <div className="flex items-center gap-1 mt-2"><MapPin size={13} className="text-gray-400" /><span className="text-sm text-gray-400">{villeClient}</span></div>}
        </div>

        <div className="flex bg-white border border-gray-100 p-1 rounded-2xl w-fit mb-6 shadow-sm gap-1">
          {[
            { key: 'prestataires', label: 'Prestataires', Icon: Briefcase },
            { key: 'annonces', label: 'Mes annonces', Icon: MessageCircle },
            { key: 'paiements', label: 'Paiements', Icon: CreditCard },
          ].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all " + (activeTab === key ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-600")}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {activeTab === 'prestataires' && (
          <div>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Rechercher un prestataire..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {metiers.map(m => (
                  <button key={m} onClick={() => setMetierFilter(m)} className={"flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold " + (metierFilter === m ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500")}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="text-center py-16 text-gray-400">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16"><div className="text-5xl mb-4">🔍</div><p className="text-gray-500">Aucun prestataire disponible.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(p => {
                  const doitPayer = p.diplome_verifie === false;
                  const waLink = getWhatsAppLink(p);
                  const metier = p.metier || p.metier_type || 'Prestataire';
                  const initials = (p.full_name || 'PC').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.avatar_url ? <img src={p.avatar_url} className="w-12 h-12 object-cover" alt="" /> : <span className="text-blue-600 font-bold text-sm">{initials}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{p.full_name}</p>
                          <p className="text-xs text-gray-400">{metier}</p>
                          {p.ville && <div className="flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-gray-300" /><span className="text-xs text-gray-400">{p.ville}</span></div>}
                        </div>
                        {p.note && <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg"><Star size={11} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-amber-600">{p.note}</span></div>}
                      </div>
                      {doitPayer ? (
                        <button onClick={() => alert('FedaPay 500 FCFA')} className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                          <CreditCard size={15} />Debloquer le contact - 500 FCFA
                        </button>
                      ) : (
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                          <MessageCircle size={15} />Contacter sur WhatsApp
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'annonces' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mes annonces</h2>
                <p className="text-sm text-gray-400">Publiez une demande, les prestataires vous contacteront</p>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                <Plus size={16} />Nouvelle annonce
              </button>
            </div>
            {showForm && (
              <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Publier une annonce</h3>
                  <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Metier recherche *</label>
                    <select value={form.metier_requis} onChange={e => setForm({...form, metier_requis: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                      <option value="">Choisir un metier</option>
                      {Object.keys(METIER_EMOJI).filter(k => k !== 'tous').map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description *</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Décrivez votre besoin..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Budget estimé (FCFA)</label>
                    <input type="number" value={form.budget_estime} onChange={e => setForm({...form, budget_estime: e.target.value})} placeholder="Ex: 5000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="urgence" checked={form.urgence} onChange={e => setForm({...form, urgence: e.target.checked})} />
                    <label htmlFor="urgence" className="text-sm text-gray-600">Urgent</label>
                  </div>
                  <button onClick={publierAnnonce} disabled={submitting} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">
                    {submitting ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            )}
            {annonces.length === 0 ? (
              <div className="text-center py-16"><div className="text-5xl mb-4">📋</div><p className="text-gray-500">Aucune annonce publiée.</p></div>
            ) : (
              <div className="space-y-4">
                {annonces.map(a => (
                  <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-bold text-blue-600">{a.metier_requis}</span>
                      {a.urgence && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Urgent</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                    {a.budget_estime && <div className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{a.budget_estime} FCFA</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'paiements' && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-gray-500">Historique des paiements bientôt disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
}
