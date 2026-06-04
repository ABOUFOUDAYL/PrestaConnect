'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BENIN_CRAFTS } from '@/constants/jobs';
import { User, LogOut, AlertCircle, Shield, FileText } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Champs du profil prestataire
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [metier, setMetier] = useState('');
  const [ville, setVille] = useState('');

  // États des documents de vérification (gérés côté administrateur/BDD)
  const [hasCni, setHasCni] = useState(false);
  const [hasDiplome, setHasDiplome] = useState(false);
  const [hasCasier, setHasCasier] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('nom, prenom, telephone, metier, ville, has_cni, has_diplome, has_casier, is_verified')
        .eq('id', user.id)
        .single();

      if (data) {
        setNom(data.nom || '');
        setPrenom(data.prenom || '');
        setTelephone(data.telephone || '');
        setMetier(data.metier || '');
        setVille(data.ville || '');
        setHasCni(data.has_cni || false);
        setHasDiplome(data.has_diplome || false);
        setHasCasier(data.has_casier || false);
        setIsVerified(data.is_verified || false);
      }
    } catch (err) {
      console.error("Erreur de récupération des données profil:", err);
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
        .update({ nom, prenom, telephone, metier, ville })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ 
        type: 'success', 
        text: 'Profil enregistré avec succès. Vos pièces seront étudiées par l\'administrateur.' 
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la mise à jour.' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  }

  // Détermination de la catégorie de métier pour adapter les pièces requises
  const selectedCraft = BENIN_CRAFTS.find(c => c.id === metier);
  const besoinDiplome = selectedCraft?.type === 'diploma';
  const besoinCasier = selectedCraft?.type === 'criminal_record';

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400 animate-pulse font-medium">
        Chargement de vos paramètres sécurisés...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      
      {/* En-tête : Statut de validation par l'administration */}
      <div className={`mb-8 p-6 rounded-[2.5rem] border flex items-start gap-4 ${
        isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className={`p-3 rounded-2xl ${isVerified ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          <Shield size={24} />
        </div>
        <div>
          <h3 className="font-black text-base">
            {isVerified ? "Compte Prestataire Validé" : "Compte Bloqué - En attente de validation admin"}
          </h3>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {isVerified 
              ? "Votre dossier complet a été approuvé. Vous êtes désormais visible par les clients de votre zone au Bénin." 
              : "L'administration doit obligatoirement authentifier vos pièces justificatives avant de vous autoriser à prendre des chantiers."}
          </p>
        </div>
      </div>

      {/* Formulaire principal */}
      <form onSubmit={handleUpdateProfile} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm space-y-6">
        
        <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Formulaire d'Inscription Professionnelle</h3>
            <p className="text-xs text-gray-400">Renseignez des informations authentiques pour l'étude de votre dossier.</p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            <AlertCircle size={18} /> {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Nom</label>
            <input 
              type="text" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Prénom</label>
            <input 
              type="text" 
              value={prenom} 
              onChange={(e) => setPrenom(e.target.value)} 
              className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Sélectionnez votre Métier</label>
            <select 
              value={metier} 
              onChange={(e) => setMetier(e.target.value)} 
              className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all" 
              required
            >
              <option value="">-- Sélectionner un métier --</option>
              {BENIN_CRAFTS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Ville de résidence (Bénin)</label>
            <input 
              type="text" 
              value={ville} 
              onChange={(e) => setVille(e.target.value)} 
              className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all" 
              placeholder="Ex: Cotonou, Abomey-Calavi, Parakou..." 
              required 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Numéro WhatsApp (Format national avec +229)</label>
            <input 
              type="text" 
              value={telephone} 
              onChange={(e) => setTelephone(e.target.value)} 
              className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-500 transition-all" 
              placeholder="Ex: +229XXXXXXXX"
              required 
            />
          </div>
        </div>

        {/* --- SECTION DES PIÈCES JOINTE OBLIGATOIRES STRICTES --- */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-purple-600" /> 
            Pièces requises pour validation manuelle
          </h4>
          
          {/* Document 1 : CNI / Passeport / RAVIP */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border">
            <div>
              <p className="text-xs font-bold text-gray-900">Carte d'Identité Nationale / CIP / RAVIP</p>
              <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wide">Obligatoire pour tous les profils</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              hasCni ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {hasCni ? 'Transmis' : 'Manquant'}
            </span>
          </div>

          {/* Document 2 : Diplôme (Métiers Techniques) */}
          {besoinDiplome && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-l-4 border-l-purple-500">
              <div>
                <p className="text-xs font-bold text-gray-900">Diplôme ou Attestation Professionnelle (CQP, CQM...)</p>
                <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wide">Obligatoire pour votre métier technique</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                hasDiplome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {hasDiplome ? 'Transmis' : 'Manquant'}
              </span>
            </div>
          )}

          {/* Document 3 : Casier Judiciaire (Métiers de Services à domicile) */}
          {besoinCasier && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-l-4 border-l-amber-500">
              <div>
                <p className="text-xs font-bold text-gray-900">Extrait de Casier Judiciaire (Moins de 3 mois)</p>
                <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wide">Obligatoire pour la sécurité à domicile (Nounou, Gardien...)</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                hasCasier ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {hasCasier ? 'Transmis' : 'Manquant'}
              </span>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={updating} 
          className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-sm tracking-wide shadow-md transition-all disabled:opacity-50"
        >
          {updating ? 'Enregistrement en cours...' : 'Soumettre mon dossier à l\'administration'}
        </button>
      </form>

      {/* Déconnexion */}
      <div className="text-center mt-8">
        <button 
          onClick={handleLogout} 
          className="text-xs font-bold text-gray-400 hover:text-rose-600 inline-flex items-center gap-2 transition-colors"
        >
          <LogOut size={14} /> Se déconnecter de mon espace
        </button>
      </div>
    </div>
  );
}