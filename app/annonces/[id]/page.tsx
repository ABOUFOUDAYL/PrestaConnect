'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Briefcase, Clock, ArrowLeft, Lock, CheckCircle } from 'lucide-react';

const BADGE_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  ponctuel: 'bg-blue-100 text-blue-700',
  recurrent: 'bg-green-100 text-green-700',
};

export default function AnnonceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [annonce, setAnnonce] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deblocage, setDeblocage] = useState(false);
  const [debloque, setDebloque] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnonce();
    checkDeblocage();
  }, [id]);

  const fetchAnnonce = async () => {
    const { data } = await supabase
      .from('annonces')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setAnnonce(data);
    setLoading(false);
  };

  const checkDeblocage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('deblocages')
      .select('id')
      .eq('annonce_id', id)
      .eq('prestataire_id', user.id)
      .single();

    if (data) setDebloque(true);
  };

  const handleDebloquer = async () => {
    setDeblocage(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      // Vérifier le solde du prestataire
      const { data: prestataire } = await supabase
        .from('prestataires')
        .select('solde, id')
        .eq('id', user.id)
        .single();

      if (!prestataire) throw new Error('Prestataire introuvable');
      if (prestataire.solde < annonce.cout_deblocage) {
        throw new Error(`Solde insuffisant. Il vous faut ${annonce.cout_deblocage} FCFA.`);
      }

      // Insérer le déblocage
      const { error: debError } = await supabase.from('deblocages').insert({
        annonce_id: annonce.id,
        prestataire_id: user.id,
        montant: annonce.cout_deblocage,
      });

      if (debError) throw debError;

      // Déduire le solde
      const { error: soldeError } = await supabase
        .from('prestataires')
        .update({ solde: prestataire.solde - annonce.cout_deblocage })
        .eq('id', user.id);

      if (soldeError) throw soldeError;

      setDebloque(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setDeblocage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!annonce) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Annonce introuvable.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Retour */}
        <button
          onClick={() => router.push('/annonces')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux annonces
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-8">

          {/* Badge + titre */}
          <div className="mb-6">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLORS[annonce.type_annonce] || 'bg-slate-100 text-slate-600'}`}>
              {annonce.type_annonce}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">{annonce.titre}</h1>
          </div>

          {/* Infos */}
          <div className="flex flex-wrap gap-4 mb-6">
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <Briefcase className="w-4 h-4 text-slate-400" />
              {annonce.metier_requis}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              {annonce.ville}{annonce.quartier ? `, ${annonce.quartier}` : ''}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              {new Date(annonce.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-700 mb-2">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{annonce.description}</p>
          </div>

          {/* Budget */}
          {annonce.budget_estime && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm text-amber-800">
                Budget estimé : <span className="font-semibold">{annonce.budget_estime.toLocaleString()} FCFA</span>
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-6">

            {debloque ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Annonce débloquée !</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    Contactez le client pour cette mission.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600">Coût de déblocage</p>
                    <p className="text-xl font-bold text-slate-900">{annonce.cout_deblocage?.toLocaleString() || '1 500'} FCFA</p>
                  </div>
                  <button
                    onClick={handleDebloquer}
                    disabled={deblocage}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    {deblocage ? 'Déblocage...' : 'Débloquer cette annonce'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  En débloquant, vous accédez aux coordonnées du client et pouvez le contacter directement.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}