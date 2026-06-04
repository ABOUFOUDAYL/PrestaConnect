'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, AlertTriangle, Lock, Unlock, Phone, CheckCircle2 } from 'lucide-react';
import { BENIN_CRAFTS } from '@/constants/jobs';

// Typage des données
type Projet = {
  id: string;
  titre: string;
  description: string;
  ville: string;
  urgence: string;
  frais_deblocage: number;
  created_at: string;
};

export default function BourseProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [unlockedProjets, setUnlockedProjets] = useState<string[]>([]);
  const [solde, setSolde] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [artisanId, setArtisanId] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Récupérer le profil de l'artisan (Solde, Métier, ID)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, solde_credits, metier, is_verified')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSolde(profile.solde_credits || 0);
        setArtisanId(profile.id);

        // Si l'artisan n'est pas vérifié, on arrête là (sécurité)
        if (!profile.is_verified) {
          setLoading(false);
          return;
        }

        // 2. Récupérer uniquement les chantiers ouverts correspondant à son métier
        const { data: projetsData } = await supabase
          .from('bourse_projets')
          .select('*')
          .eq('statut', 'ouvert')
          .eq('metier_cible', profile.metier)
          .order('created_at', { ascending: false });
        
        if (projetsData) setProjets(projetsData);

        // 3. Récupérer les projets que cet artisan a DÉJÀ payés et débloqués
        const { data: deblocages } = await supabase
          .from('deblocages_projets')
          .select('projet_id')
          .eq('artisan_id', profile.id);

        if (deblocages) {
          setUnlockedProjets(deblocages.map(d => d.projet_id));
        }
      }
    } catch (err) {
      console.error("Erreur de chargement :", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDebloquerProjet(projetId: string, frais: number) {
    if (solde < frais) {
      alert(`Solde insuffisant. Vous avez besoin de ${frais} FCFA pour débloquer ce chantier.`);
      return;
    }

    const confirmer = window.confirm(`Confirmez-vous le paiement de ${frais} FCFA pour débloquer le numéro du client ?`);
    if (!confirmer) return;

    setProcessingId(projetId);
    try {
      // 1. Débiter le solde de l'artisan
      const nouveauSolde = solde - frais;
      const { error: errorUpdate } = await supabase
        .from('profiles')
        .update({ solde_credits: nouveauSolde })
        .eq('id', artisanId);
      
      if (errorUpdate) throw errorUpdate;

      // 2. Enregistrer le déblocage dans l'historique premium
      const { error: errorInsert } = await supabase
        .from('deblocages_projets')
        .insert({
          projet_id: projetId,
          artisan_id: artisanId,
          montant_paye: frais
        });

      if (errorInsert) throw errorInsert;

      // 3. Mettre à jour l'interface immédiatement
      setSolde(nouveauSolde);
      setUnlockedProjets([...unlockedProjets, projetId]);
      
      alert("Félicitations ! Le chantier est débloqué.");

    } catch (err) {
      console.error("Erreur lors du déblocage :", err);
      alert("Une erreur est survenue lors du paiement.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Chargement de la bourse aux projets...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      
      {/* En-tête avec Solde en temps réel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Briefcase className="text-blue-600" /> Bourse aux Projets
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Découvrez les grands chantiers publiés par les clients au Bénin.</p>
        </div>
        
        <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Votre Solde Disponible</p>
            <p className="text-2xl font-black">{solde} FCFA</p>
          </div>
          <button className="h-10 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all">
            Recharger
          </button>
        </div>
      </div>

      {/* Liste des Projets */}
      {projets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun projet pour le moment</h3>
          <p className="text-gray-500 text-sm">Les clients n'ont pas encore publié de grands chantiers dans votre corps de métier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projets.map((projet) => {
            const isUnlocked = unlockedProjets.includes(projet.id);
            const isProcessing = processingId === projet.id;

            return (
              <div key={projet.id} className={`p-6 rounded-[2rem] border transition-all relative ${
                isUnlocked ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-gray-100 shadow-md hover:shadow-lg'
              }`}>
                
                {/* Badge d'urgence */}
                {projet.urgence === 'urgente' && (
                  <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <AlertTriangle size={12} /> Urgent
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-black text-xl text-gray-900 mb-2 leading-tight">{projet.titre}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{projet.description}</p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <MapPin size={14} /> {projet.ville}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    Publié le {new Date(projet.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Section d'Action : Débloquer vs Débloqué */}
                <div className="pt-6 border-t border-gray-100/50">
                  {isUnlocked ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <CheckCircle2 size={18} /> Chantier débloqué
                      </div>
                      <a href={`https://wa.me/22900000000`} target="_blank" rel="noreferrer" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                        <Phone size={16} /> Contacter le Client (WhatsApp)
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Frais d'accès : <span className="text-lg text-gray-900 block">{projet.frais_deblocage} FCFA</span>
                      </div>
                      <button 
                        onClick={() => handleDebloquerProjet(projet.id, projet.frais_deblocage)}
                        disabled={isProcessing}
                        className="flex-1 h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                      >
                        {isProcessing ? 'Paiement...' : <><Lock size={16} /> Débloquer</>}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}