'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Wrench, User, Phone, MapPin, FileText, CheckCircle, HelpCircle } from 'lucide-react';

const METIERS_BENIN = [
  { id: 'electricite', name: 'Électricité' },
  { id: 'plomberie', name: 'Plomberie & Sanitaire' },
  { id: 'maconnerie', name: 'Maçonnerie & Rénovation' },
  { id: 'climatisation', name: 'Froid & Climatisation' },
  { id: 'menuiserie', name: 'Menuiserie (Bois/Alu)' },
  { id: 'mecanique', name: 'Mécanique Automobile' },
  { id: 'securite', name: 'Sécurité & Gardiennage' },
  { id: 'chauffeur', name: 'Chauffeur Professionnel' },
  { id: 'livreur', name: 'Livraison & Courses' }
];

export default function DemandePage() {
  const router = useRouter();
  
  // États mappés sur les colonnes de ta table Supabase 'demandes'
  const [clientName, setClientName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [serviceNom, setServiceNom] = useState('');
  const [description, setDescription] = useState('');
  const [typeIntervention, setTypeIntervention] = useState('Standard');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Déduction automatique du type de métier (utilisé pour les filtres artisans)
    const metierTypeCalculated = serviceNom; 

    try {
      // Insertion directe dans ta table existante
      const { error: insertError } = await supabase
        .from('demandes')
        .insert([
          {
            client_name: clientName,
            telephone: telephone,
            ville: ville.trim(),
            quartier: quartier.trim(),
            service_nom: serviceNom,
            metier_type: metierTypeCalculated,
            description: description,
            type_intervention: typeIntervention,
            status: 'En attente' // Valeur par défaut standard
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error('Erreur lors de la publication:', err);
      setError(err.message || "Impossible d'enregistrer votre demande.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="h-12 w-12 bg-blue-50 text-[#3b82f6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Demande publiée !</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Votre demande pour un artisan (**{serviceNom}**) à **{ville} ({quartier})** a été transmise aux prestataires validés de la zone.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setClientName('');
              setTelephone('');
              setVille('');
              setQuartier('');
              setServiceNom('');
              setDescription('');
            }}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all mt-6"
          >
            Publier une autre demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#3b82f6]" /> Demander une intervention
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Décrivez votre panne ou projet pour recevoir les propositions des artisans vérifiés au Bénin.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitDemande} className="space-y-5">
          
          {/* Nom complet client */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Votre nom complet
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Koffi Mensah"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#3b82f6] focus:bg-white transition-all"
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Numéro de téléphone (WhatsApp ou Appel)
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: +229 0100000000"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#3b82f6] focus:bg-white transition-all"
            />
          </div>

          {/* Zone Géographique (Ville + Quartier) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Ville
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cotonou"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#3b82f6] focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Quartier
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Fidjrossè"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#3b82f6] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Sélection du Corps de Métier */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400" /> Métier requis
            </label>
            <select
              required
              value={serviceNom}
              onChange={(e) => setServiceNom(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#3b82f6] focus:bg-white transition-all appearance-none"
            >
              <option value="">Sélectionnez le métier...</option>
              {METIERS_BENIN.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Type d'intervention */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Degré d'urgence
            </label>
            <select
              value={typeIntervention}
              onChange={(e) => setTypeIntervention(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#3b82f6] focus:bg-white transition-all appearance-none"
            >
              <option value="Urgent">Urgence immédiate (Dépannage direct)</option>
              <option value="Standard">Standard (Sur rendez-vous)</option>
              <option value="Gros Projet">Gros Projet (Chantier / Rénovation)</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Description des travaux
            </label>
            <textarea
              required
              rows={4}
              placeholder="Décrivez en quelques mots votre problème ou besoin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#3b82f6] focus:bg-white transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#3b82f6] text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publication en cours...</span>
              </>
            ) : (
              <span>Rechercher un artisan</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}