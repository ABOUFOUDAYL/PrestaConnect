'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, LogOut, AlertCircle, Shield, CheckCircle, Phone, MapPin, Briefcase, Mail } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState<any>(null);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [metier, setMetier] = useState('');
  const [ville, setVille] = useState('');
  const [email, setEmail] = useState('');
  const [statut, setStatut] = useState('');

  useEffect(() => { fetchUserData(); }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      setEmail(user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setNom(data.nom || data.full_name?.split(' ')[0] || '');
        setPrenom(data.prenom || data.full_name?.split(' ')[1] || '');
        setTelephone(data.telephone || data.phone || '');
        setMetier(data.metier || '');
        setVille(data.ville || data.city || '');
        setStatut(data.statut_verification || data.status || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({ nom, prenom, telephone, metier, ville, full_name: `${nom} ${prenom}` })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const isValide = statut === 'valide';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">

      {/* Bannière statut */}
      <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
        isValide ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className={`p-3 rounded-xl ${isValide ? 'bg-emerald-600' : 'bg-amber-500'} text-white`}>
          {isValide ? <CheckCircle size={22} /> : <Shield size={22} />}
        </div>
        <div>
          <h3 className={`font-black text-sm ${isValide ? 'text-emerald-800' : 'text-amber-800'}`}>
            {isValide ? '✅ Compte validé — Vous pouvez prendre des chantiers' : '⏳ En attente de validation par l\'administrateur'}
          </h3>
          <p className={`text-xs mt-0.5 ${isValide ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isValide
              ? 'Votre dossier a été approuvé. Vous êtes visible par les clients.'
              : 'Votre dossier est en cours d\'examen. Vous serez notifié dès validation.'}
          </p>
        </div>
      </div>

      {/* Carte profil */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
            {(nom || 'A')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-black text-gray-900 text-lg">{nom} {prenom}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={11} /> {email}</p>
            {metier && <p className="text-xs text-blue-600 font-bold mt-0.5 flex items-center gap-1"><Briefcase size={11} /> {metier}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Téléphone</p>
            <p className="text-sm font-bold text-gray-700 flex items-center gap-1"><Phone size={13} /> {telephone || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Ville</p>
            <p className="text-sm font-bold text-gray-700 flex items-center gap-1"><MapPin size={13} /> {ville || '—'}</p>
          </div>
        </div>
      </div>

      {/* Formulaire modification */}
      <form onSubmit={handleUpdateProfile} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><User size={18} /></div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Modifier mon profil</h3>
            <p className="text-xs text-gray-400">Vos informations professionnelles</p>
          </div>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            <AlertCircle size={15} /> {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">Nom</label>
            <input type="text" value={nom} onChange={e => setNom(e.target.value)}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">Prénom</label>
            <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">Métier</label>
            <input type="text" value={metier} onChange={e => setMetier(e.target.value)}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Ex: Électricien, Plombier..." />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">Ville</label>
            <input type="text" value={ville} onChange={e => setVille(e.target.value)}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Ex: Cotonou, Parakou..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">Téléphone WhatsApp</label>
            <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Ex: +229XXXXXXXX" />
          </div>
        </div>

        <button type="submit" disabled={updating}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-50">
          {updating ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>

      {/* Déconnexion */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900 text-sm">Se déconnecter</p>
          <p className="text-xs text-gray-400">Fermer votre session PrestaConnect</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-black transition-all">
          <LogOut size={14} /> Déconnexion
        </button>
      </div>

    </div>
  );
}