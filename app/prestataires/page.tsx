'use client';

import React, { useState, useMemo } from 'react';
import { User, Phone, MapPin, Briefcase, FileText, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Liste complète et catégorisée des métiers du Bénin (Synchronisée avec /demande)
const METIERS_BENIN = [
  { id: 'Maçonnerie', name: 'Maçon (BTP / Rénovation)', type: 'diplome' },
  { id: 'Électricité Bâtiment', name: 'Électricien Bâtiment', type: 'diplome' },
  { id: 'Plomberie', name: 'Plombier', type: 'diplome' },
  { id: 'Peinture Bâtiment', name: 'Peindre en bâtiment', type: 'diplome' },
  { id: 'Menuiserie Bois', name: 'Menuisier Bois', type: 'diplome' },
  { id: 'Menuiserie Aluminium', name: 'Menuisier Aluminium & Vitrier', type: 'diplome' },
  { id: 'Carrelage', name: 'Carreleur', type: 'diplome' },
  { id: 'Faux-Plafond', name: 'Staffeur / Plaquiste', type: 'diplome' },
  { id: 'Soudure & Métallerie', name: 'Soudeur / Constructeur Métallique', type: 'diplome' },
  { id: 'Climatisation & Froid', name: 'Technicien Froid & Climatisation', type: 'diplome' },
  { id: 'Réparation Électroménager', name: 'Réparateur d\'appareils électroménagers', type: 'diplome' },
  { id: 'Bobinage', name: 'Bobineur de moteurs', type: 'diplome' },
  { id: 'Mécanique Automobile', name: 'Mécanicien Auto (Essence/Diesel)', type: 'diplome' },
  { id: 'Électricité Auto', name: 'Électricien Automobile', type: 'diplome' },
  { id: 'Mécanique Moto', name: 'Mécanicien Moto & Deux-roues', type: 'diplome' },
  { id: 'Tôlerie & Peinture Auto', name: 'Tôlier / Peintre Auto', type: 'diplome' },
  { id: 'Maintenance Informatique', name: 'Technicien Informatique / Réseaux', type: 'diplome' },
  // Métiers à Casier Judiciaire
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
  { id: 'Tapisserie', name: 'Tapissier d\'ameublement', type: 'casier' },
  { id: 'Photographie', name: 'Photographe / Caméraman', type: 'casier' },
  { id: 'Sérigraphie', name: 'Sérigraphe / Imprimeur Artisanal', type: 'casier' },
  { id: 'Sculpture & Poterie', name: 'Sculpteur / Potier', type: 'casier' },
  { id: 'Réparation Téléphones', name: 'Réparateur de smartphones', type: 'casier' },
  { id: 'Nettoyage & Blanchisserie', name: 'Blanchisseur / Pressing Artisanal', type: 'casier' }
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

  // Détection automatique du type de métier (diplôme vs casier)
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
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            full_name: fullName,
            phone: formattedPhone,
            ville: ville,
            metier: selectedMetier,
            metier_type: metierInfos?.type,
            status: 'en_attente_validation',
            wallet_balance: 0 
          }
        ]);

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
    <div className="min-h-screen bg-slate-50 text-slate-950 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* En-tête de page - Respect strict de l'espacement et du style */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#3b82f6]/10 text-[#3b82f6] mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Espace Prestataire Bénin
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Inscrivez-vous comme Artisan Vérifié
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Créez votre profil professionnel dès maintenant et accédez aux demandes de chantiers à proximité.
          </p>
        </div>

        {/* Card du Formulaire */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-10">
          
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dossier d'inscription envoyé !</h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                Vos pièces justificatives (CIP/Biométrique et justificatif de métier) sont en cours d'examen. Vous recevrez un SMS de confirmation dès validation par l'équipe PrestaConnect.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              {/* Ligne : Nom & Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#3b82f6]" /> Nom & Prénom professionnel
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: M. Michel Akodjenou"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#3b82f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all text-slate-950"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#3b82f6]" /> Numéro de téléphone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 61000000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#3b82f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all text-slate-950"
                  />
                </div>
              </div>

              {/* Ville */}
              <div>
                <label className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3b82f6]" /> Ville & Quartier de résidence
                </label>
                <input
                  type="text"
                  required
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Ex: Abomey-Calavi, Tankpè, Cotonou"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#3b82f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all text-slate-950"
                />
              </div>

              {/* Sélection Métier */}
              <div>
                <label className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#3b82f6]" /> Votre Corps de Métier
                </label>
                <select
                  required
                  value={selectedMetier}
                  onChange={(e) => setSelectedMetier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#3b82f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all text-slate-950"
                >
                  <option value="">Sélectionnez votre métier spécialisé...</option>
                  {METIERS_BENIN.map((metier) => (
                    <option key={metier.id} value={metier.id}>
                      {metier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Encadré Logique Métier Dynamique & Pièces */}
              {metierInfos && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#3b82f6] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Réglementation du profil :</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Catégorie attribuée :{' '}
                        <span className="font-semibold text-slate-900">
                          {metierInfos.type === 'diplome' ? 'Métier sur Diplôme (Frais de déblocage : 200 FCFA)' : 'Métier Libre (Déblocage par le client)'}
                        </span>.
                      </p>
                      
                      <div className="mt-3 text-xs p-3 rounded-xl bg-white border border-slate-100">
                        {metierInfos.type === 'diplome' ? (
                          <p className="text-slate-700">
                            ⚙️ <span className="font-semibold text-slate-900">Règle financière :</span> C'est vous qui prenez l'initiative de débloquer les demandes des clients. Un montant de 200 FCFA sera déduit de votre compte par déblocage.
                          </p>
                        ) : (
                          <p className="text-slate-700">
                            ⚙️ <span className="font-semibold text-slate-900">Règle financière :</span> Votre inscription et visibilité sont totalement gratuites. C'est le client qui paie la plateforme pour voir vos coordonnées et vous appeler.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Gestion Propre des inputs fichiers sans doublon block/flex */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Carte CIP ou Biométrique (Recto/Verso)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        required
                        onChange={(e) => setIdCard(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#3b82f6]/10 file:text-[#3b82f6] hover:file:bg-[#3b82f6]/20 file:cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> 
                        {metierInfos.type === 'diplome' ? 'Votre Diplôme ou Attestation (CQM, CAP...)' : 'Votre Casier Judiciaire (Moins de 3 mois)'}
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        required
                        onChange={(e) => setDocJustificatif(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#3b82f6]/10 file:text-[#3b82f6] hover:file:bg-[#3b82f6]/20 file:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              <hr className="border-slate-100 my-6" />

              {/* Bouton Soumission */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#3b82f6]/50 text-white font-medium py-3.5 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-200 group text-sm disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création de votre accès artisan...</span>
                  </>
                ) : (
                  <>
                    <span>Soumettre mon dossier d'artisan</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}