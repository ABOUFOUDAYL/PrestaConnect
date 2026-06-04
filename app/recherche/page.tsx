'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BENIN_CRAFTS } from '@/constants/jobs';
import { Search, MapPin, Star, AlertTriangle, Send, CheckCircle2, Briefcase } from 'lucide-react';

// Types pour structurer nos données
type Artisan = {
  id: string;
  nom: string;
  prenom: string;
  metier: string;
  ville: string;
  score_performance: number;
};

export default function RechercheClientPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtres de recherche
  const [rechercheMetier, setRechercheMetier] = useState('');
  const [rechercheVille, setRechercheVille] = useState('');
  const [estUrgent, setEstUrgent] = useState(false);

  // Gestion de la Modal de Demande
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [description, setDescription] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');

  // Lancer la recherche automatiquement à chaque changement de filtre
  useEffect(() => {
    lancerRecherche();
  }, [rechercheMetier, rechercheVille, estUrgent]);

  async function lancerRecherche() {
    setLoading(true);
    try {
      // 1. On ne cherche QUE les profils validés par l'admin
      let query = supabase
        .from('profiles')
        .select('id, nom, prenom, metier, ville, score_performance')
        .eq('is_verified', true);

      // 2. Filtre par métier
      if (rechercheMetier) {
        query = query.eq('metier', rechercheMetier);
      }

      // 3. Filtre de géolocalisation (Ville) si précisé ou si URGENT
      if (rechercheVille) {
        query = query.ilike('ville', `%${rechercheVille}%`);
      }

      // 4. L'ALGORITHME DE CLASSEMENT : Les meilleurs scores en premier !
      query = query.order('score_performance', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setArtisans(data || []);
    } catch (err) {
      console.error("Erreur de recherche :", err);
    } finally {
      setLoading(false);
    }
  }

  async function envoyerDemandeDirecte(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedArtisan) return;
    setEnvoiEnCours(true);

    try {
      // Récupération de l'ID du client connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Vous devez être connecté (gratuitement) pour envoyer une demande.");
        return;
      }

      // Récupération des règles tarifaires selon le métier de l'artisan choisi
      const reglesMetier = BENIN_CRAFTS.find(c => c.id === selectedArtisan.metier);
      const quiPaie = reglesMetier?.payer || 'artisan';
      const montant = reglesMetier?.price || 200;

      // Insertion dans la nouvelle table 'demandes'
      const { error } = await supabase
        .from('demandes')
        .insert({
          client_id: user.id,
          artisan_id: selectedArtisan.id,
          description: description,
          qui_paie: quiPaie,
          montant_frais: montant,
          statut: 'en_attente'
        });

      if (error) throw error;
      
      setMessageSucces("Votre demande a été envoyée avec succès à l'artisan !");
      setTimeout(() => {
        setSelectedArtisan(null);
        setMessageSucces('');
        setDescription('');
      }, 3000);

    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
      alert("Une erreur est survenue.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* En-tête de recherche */}
      <div className="bg-gray-900 pt-16 pb-24 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          Trouvez le meilleur prestataire au Bénin
        </h1>
        <p className="text-gray-400 font-medium max-w-xl mx-auto mb-10">
          Recherchez par métier et par ville. Les prestataires affichés sont vérifiés et classés selon la qualité de leurs services.
        </p>

        {/* Barre de filtres */}
        <div className="max-w-4xl mx-auto bg-white p-2 rounded-3xl shadow-xl flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select 
              value={rechercheMetier} 
              onChange={(e) => setRechercheMetier(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-transparent border-none font-bold text-gray-900 focus:ring-0 cursor-pointer appearance-none"
            >
              <option value="">Quel métier recherchez-vous ?</option>
              {BENIN_CRAFTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          
          <div className="w-px bg-gray-100 hidden md:block"></div>
          
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              value={rechercheVille}
              onChange={(e) => setRechercheVille(e.target.value)}
              placeholder="Dans quelle ville ? (ex: Cotonou)"
              className="w-full h-14 pl-12 pr-4 bg-transparent border-none font-bold text-gray-900 focus:ring-0"
            />
          </div>

          <button 
            onClick={() => setEstUrgent(!estUrgent)}
            className={`h-14 px-6 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              estUrgent ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle size={18} /> Urgent
          </button>
        </div>
      </div>

      {/* Bannière d'appel vers la Bourse aux Projets */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between text-white">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="p-3 bg-white/20 rounded-xl"><Briefcase size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">Vous avez un gros chantier ?</h3>
              <p className="text-blue-100 text-sm">Publiez une annonce globale et recevez des devis.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-all">
            Publier sur la Bourse
          </button>
        </div>
      </div>

      {/* Résultats de la recherche */}
      <div className="max-w-5xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Recherche des meilleurs profils...</div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
            <p className="text-gray-500 font-medium">Aucun prestataire trouvé pour ces critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan, index) => {
              const labelMetier = BENIN_CRAFTS.find(c => c.id === artisan.metier)?.label;
              const estTopPerformant = index < 3 && artisan.score_performance > 0; // Les 3 premiers s'ils ont un score

              return (
                <div key={artisan.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  {estTopPerformant && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> Recommandé
                    </div>
                  )}
                  
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center text-gray-400 font-bold text-xl">
                    {artisan.nom.charAt(0)}{artisan.prenom.charAt(0)}
                  </div>
                  
                  <h3 className="font-black text-gray-900 text-lg">{artisan.prenom} {artisan.nom}</h3>
                  <p className="text-blue-600 font-bold text-sm mb-1">{labelMetier}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mb-6"><MapPin size={12}/> {artisan.ville}</p>

                  <button 
                    onClick={() => setSelectedArtisan(artisan)}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-sm transition-all"
                  >
                    Sélectionner ce prestataire
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal d'envoi de demande directe */}
      {selectedArtisan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative">
            
            {messageSucces ? (
              <div className="text-center py-10">
                <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 mb-2">Demande Envoyée !</h3>
                <p className="text-gray-500 text-sm">{messageSucces}</p>
              </div>
            ) : (
              <>
                <button onClick={() => setSelectedArtisan(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-bold text-xl">&times;</button>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2">Demande Directe</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Vous allez contacter <strong>{selectedArtisan.prenom} {selectedArtisan.nom}</strong>.
                </p>

                <form onSubmit={envoyerDemandeDirecte} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Décrivez votre besoin</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Ex: J'ai une fuite d'eau urgente dans ma cuisine..."
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={envoiEnCours}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    {envoiEnCours ? 'Envoi en cours...' : <><Send size={18} /> Confirmer la demande</>}
                  </button>
                </form>
                
                <p className="text-center text-[11px] text-gray-400 font-medium mt-4">
                  {BENIN_CRAFTS.find(c => c.id === selectedArtisan.metier)?.payer === 'client' 
                    ? "Vous serez invité à régler les frais de mise en relation après cette étape." 
                    : "L'envoi de cette demande est gratuit pour vous."}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}