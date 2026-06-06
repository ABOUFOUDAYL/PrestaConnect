'use client';

import React, { useState, useMemo } from 'react';
import { User, Phone, MapPin, Briefcase, FileText, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const METIERS_BENIN = [
  { id: 'Maçonnerie', name: 'Maçon (BTP / Rénovation)', type: 'diplome' },
  { id: 'Électricité Bâtiment', name: 'Électricien Bâtiment', type: 'diplome' },
  { id: 'Plomberie', name: 'Plombier', type: 'diplome' },
  { id: 'Peinture Bâtiment', name: 'Peintre en bâtiment', type: 'diplome' },
  { id: 'Menuiserie Bois', name: 'Menuisier Bois', type: 'diplome' },
  { id: 'Menuiserie Aluminium', name: 'Menuisier Aluminium & Vitrier', type: 'diplome' },
  { id: 'Carrelage', name: 'Carreleur', type: 'diplome' },
  { id: 'Faux-Plafond', name: 'Staffeur / Plaquiste', type: 'diplome' },
  { id: 'Soudure & Métallerie', name: 'Soudeur / Constructeur Métallique', type: 'diplome' },
  { id: 'Climatisation & Froid', name: 'Technicien Froid & Climatisation', type: 'diplome' },
  { id: 'Réparation Électroménager', name: "Réparateur d'appareils électroménagers", type: 'diplome' },
  { id: 'Bobinage', name: 'Bobineur de moteurs', type: 'diplome' },
  { id: 'Mécanique Automobile', name: 'Mécanicien Auto (Essence/Diesel)', type: 'diplome' },
  { id: 'Électricité Auto', name: 'Électricien Automobile', type: 'diplome' },
  { id: 'Mécanique Moto', name: 'Mécanicien Moto & Deux-roues', type: 'diplome' },
  { id: 'Tôlerie & Peinture Auto', name: 'Tôlier / Peintre Auto', type: 'diplome' },
  { id: 'Maintenance Informatique', name: 'Technicien Informatique / Réseaux', type: 'diplome' },
  { id: 'Réparation Téléphones', name: 'Réparateur de smartphones', type: 'casier' },
  { id: 'Vulcanisation', name: 'Vulcanisateur (Vulcain)', type: 'casier' },
  { id: 'Couture & Stylisme', name: 'Couturier / Styliste / Modéliste', type: 'casier' },
  { id: 'Tissage', name: 'Tisseur traditionnel (Kanvô)', type: 'casier' },
  { id: 'Coiffure Homme', name: 'Coiffeur (Barbier)', type: 'casier' },
  { id: 'Coiffure Femme', name: 'Coiffeuse / Tresseuse', type: 'casier' },
  { id: 'Esthétique & Maquillage', name: 'Esthéticienne / Maquilleuse', type: 'casier' },
  { id: 'Cordonnerie', name: 'Cordonnier / Artisan Maroquinier', type: 'casier' },
  { id: 'Boulangerie & Pâtisserie', name: 'Boulanger / Pâtissier', type: 'casier' },
  { id: 'Cuisine & Traiteur', name: 'Cuisinier / Traiteur', type: 'casier' },
  { id: 'Transformation de produits', name: 'Transformateur agroalimentaire', type: 'casier' },
  { id: 'Tapisserie', name: "Tapissier d'ameublement", type: 'casier' },
  { id: 'Photographie', name: 'Photographe / Caméraman', type: 'casier' },
  { id: 'Sérigraphie', name: 'Sérigraphe / Imprimeur Artisanal', type: 'casier' },
  { id: 'Nettoyage & Blanchisserie', name: 'Blanchisseur / Pressing Artisanal', type: 'casier' },
  { id: 'Sculpture & Poterie', name: 'Sculpteur / Potier', type: 'casier' },
];

export default function PrestatairesPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [ville, setVille] = useState('');
  const [selectedMetier, setSelectedMetier] = useState('');
  const [idCard, setIdCard] = useState<File | null>(null);
  const [docJustificatif, setDocJustificatif] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metierInfos = useMemo(() => {
    return METIERS_BENIN.find(m => m.id === selectedMetier) || null;
  }, [selectedMetier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fullName || !phone || !ville || !selectedMetier || !idCard || !docJustificatif) {
      setError('Veuillez remplir tous les champs et charger tous les documents requis.');
      setLoading(false);
      return;
    }

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+') && !formattedPhone.startsWith('00')) {
      if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
      formattedPhone = `+229${formattedPhone}`;
    }

    try {
      // 1. Upload CIP
      let cipUrl = '';
      const cipPath = `cip/${Date.now()}_${idCard.name}`;
      const { error: cipError } = await supabase.storage
        .from('documents')
        .upload(cipPath, idCard);
      if (!cipError) {
        const { data: cipData } = supabase.storage.from('documents').getPublicUrl(cipPath);
        cipUrl = cipData.publicUrl;
      }

      // 2. Upload document justificatif
      let docUrl = '';
      const docPath = `justificatifs/${Date.now()}_${docJustificatif.name}`;
      const { error: docError } = await supabase.storage
        .from('documents')
        .upload(docPath, docJustificatif);
      if (!docError) {
        const { data: docData } = supabase.storage.from('documents').getPublicUrl(docPath);
        docUrl = docData.publicUrl;
      }

      // 3. Créer un compte Auth avec email généré depuis le téléphone
      const fakeEmail = `${formattedPhone.replace('+', '')}@prestaconnect.app`;
      const fakePassword = `PC_${Date.now()}`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: fakePassword,
        options: {
          data: {
            full_name: fullName,
            role: 'prestataire',
          },
        },
      });

      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('Compte non créé');

      // 4. Insérer le profil avec les colonnes exactes de la table
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          user_id: userId,
          full_name: fullName,
          telephone: formattedPhone,
          email: fakeEmail,
          ville: ville,
          metier: selectedMetier,
          role: 'prestataire',
          statut_verification: 'en_attente_validation',
          carte_identite_url: cipUrl,
          casier_judiciaire_url: docUrl,
        }, { onConflict: 'id' });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error('Erreur inscription prestataire:', err);
      setError(err.message || 'Une erreur est survenue pendant la création de votre profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Espace Prestataire Bénin
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-3">
            Inscrivez-vous comme Artisan Vérifié
          </h1>
          <p className="text-base text-slate-500 max-w-lg mx-auto">
            Créez votre profil professionnel et accédez aux demandes de chantiers à proximité.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8">
          {success ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-5">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dossier envoyé avec succès !</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Vos pièces sont en cours d'examen. Vous serez contacté par SMS dès validation par l'équipe PrestaConnect.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" /> Nom & Prénom professionnel
                  </label>
                  <input
                    type="text" required value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Michel Akodjenou"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" /> Numéro de téléphone (WhatsApp)
                  </label>
                  <input
                    type="tel" required value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 61000000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> Ville & Quartier de résidence
                </label>
                <input
                  type="text" required value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Ex: Abomey-Calavi, Tankpè"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" /> Votre Corps de Métier
                </label>
                <select
                  required value={selectedMetier}
                  onChange={(e) => setSelectedMetier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Sélectionnez votre métier...</option>
                  <optgroup label="— Métiers sur Diplôme">
                    {METIERS_BENIN.filter(m => m.type === 'diplome').map((metier) => (
                      <option key={metier.id} value={metier.id}>{metier.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="— Métiers Libres (Casier Judiciaire)">
                    {METIERS_BENIN.filter(m => m.type === 'casier').map((metier) => (
                      <option key={metier.id} value={metier.id}>{metier.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {metierInfos && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-900">Règle financière : </span>
                      {metierInfos.type === 'diplome'
                        ? 'Vous débloquez les contacts clients. Tarif : 300 FCFA (urgent) ou 1500 FCFA (grand chantier).'
                        : "Votre inscription est gratuite. C'est le client qui paie 500 FCFA pour voir vos coordonnées."}
                    </div>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Carte CIP / Biométrique
                      </label>
                      <input
                        type="file" accept="image/*,.pdf" required
                        onChange={(e) => setIdCard(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {metierInfos.type === 'diplome' ? 'Diplôme / Attestation' : 'Casier Judiciaire (-3 mois)'}
                      </label>
                      <input
                        type="file" accept="image/*,.pdf" required
                        onChange={(e) => setDocJustificatif(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><span>Soumettre mon dossier</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}