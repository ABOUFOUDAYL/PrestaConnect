'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, ShieldCheck, AlertCircle, FileText, Eye, Check, X, Phone, 
  MapPin, XCircle, CheckCircle, UserCheck, Users, Briefcase, Building2, Layers
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SuperAdminCockpitPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Données globales
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>(['Tous']);
  
  // Filtres
  const [activeTab, setActiveTab] = useState<'attente' | 'valides' | 'ambassadeurs'>('attente');
  const [selectedCity, setSelectedCity] = useState<string>('Tous');

  // KPIs
  const [metrics, setMetrics] = useState({
    totalArtisans: 0,
    pendingCount: 0,
    ambassadorsCount: 0
  });

  // Examen
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [assignedAmbassadorZone, setAssignedAmbassadorZone] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.replace('/login');
          return;
        }

        const { data: profile, error: dbError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (dbError) throw new Error(`Erreur Base de données: ${dbError.message}`);
        if (!profile || profile.role !== 'admin') {
          throw new Error("Accès refusé : Interface réservée à l'Administration Principale.");
        }

        setAuthorized(true);
        await fetchPlatformData();
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [router]);

  const fetchPlatformData = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      
      const profilesList = data || [];
      setAllProfiles(profilesList);
      
      // Extraction dynamique de toutes les villes du Bénin présentes en base
      const citiesSet = new Set(
        profilesList
          .map(p => p.city || p.ville)
          .filter(Boolean)
          .map(c => c.trim())
      );
      setAvailableCities(['Tous', ...Array.from(citiesSet).sort()]);
      
      // KPIs
      const pending = profilesList.filter(p => p.status === 'en_attente_validation').length;
      const validArtisans = profilesList.filter(p => p.status === 'valide' && p.role === 'artisan').length;
      const ambassadors = profilesList.filter(p => p.role === 'ambassadeur' || p.role === 'ambassador').length;

      setMetrics({
        totalArtisans: validArtisans,
        pendingCount: pending,
        ambassadorsCount: ambassadors
      });
    } catch (err: any) {
      console.error("Erreur de synchronisation :", err);
    }
  };

  useEffect(() => {
    let result = [...allProfiles];

    if (activeTab === 'attente') {
      result = result.filter(p => p.status === 'en_attente_validation');
    } else if (activeTab === 'valides') {
      result = result.filter(p => p.status === 'valide' && p.role === 'artisan');
    } else if (activeTab === 'ambassadeurs') {
      result = result.filter(p => p.role === 'ambassadeur' || p.role === 'ambassador');
    }

    if (selectedCity !== 'Tous') {
      result = result.filter(p => 
        (p.city && p.city.toLowerCase() === selectedCity.toLowerCase()) || 
        (p.ville && p.ville.toLowerCase() === selectedCity.toLowerCase())
      );
    }

    setFilteredProfiles(result);
  }, [allProfiles, activeTab, selectedCity]);

  const handleUpdateStatus = async (profileId: string, newStatus: 'valide' | 'rejete') => {
    try {
      setIsUpdating(true);
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'valide') {
        updateData.role = 'artisan';
        if (assignedAmbassadorZone) {
          updateData.assigned_zone = assignedAmbassadorZone;
        }
      }

      const { error } = await supabase.from('profiles').update(updateData).eq('id', profileId);
      if (error) throw error;

      await fetchPlatformData();
      setSelectedProfile(null);
      setAssignedAmbassadorZone('');
    } catch (err: any) {
      alert("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAmbassadorRole = async (profileId: string, currentRole: string) => {
    try {
      setIsUpdating(true);
      const newRole = currentRole === 'ambassadeur' ? 'user' : 'ambassadeur';
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
      if (error) throw error;
      await fetchPlatformData();
    } catch (err: any) {
      console.error("Erreur modification rôle :", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
    </div>
  );

  if (errorMessage) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">Accès restreint</h1>
      <p className="text-slate-600 mt-2 font-medium">{errorMessage}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête Principal */}
        <div className="mb-10 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
              Administration Nationale
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
              PrestaConnect Cockpit
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Super-Administrateur : <span className="text-slate-200 font-semibold">SAYO ISSA Sabirou</span>
            </p>
          </div>

          {/* Filtre Dynamique National */}
          <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl border border-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-200 outline-none pr-4 cursor-pointer"
            >
              {availableCities.map((city, index) => (
                <option key={index} value={city} className="bg-slate-800 text-slate-200">
                  {city === 'Tous' ? 'Tout le Bénin' : city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ... (Le reste du code des KPIs et des onglets reste identique) ... */}
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800/60 border border-slate-700/70 p-6 rounded-2xl flex items-center gap-5">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Layers className="w-6 h-6" /></div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">En attente</span>
              <span className="text-2xl font-black text-white">{metrics.pendingCount}</span>
            </div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/70 p-6 rounded-2xl flex items-center gap-5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Briefcase className="w-6 h-6" /></div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Validés</span>
              <span className="text-2xl font-black text-white">{metrics.totalArtisans}</span>
            </div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/70 p-6 rounded-2xl flex items-center gap-5">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-6 h-6" /></div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Ambassadeurs</span>
              <span className="text-2xl font-black text-white">{metrics.ambassadorsCount}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-800 mb-6 gap-6">
          {['attente', 'valides', 'ambassadeurs'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-bold tracking-wide border-b-2 transition-all capitalize ${
                activeTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'attente' ? `Dossiers en attente (${metrics.pendingCount})` : 
               tab === 'valides' ? `Artisans Certifiés (${metrics.totalArtisans})` : 
               'Équipes Terrain'}
            </button>
          ))}
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-800 text-center py-16 rounded-2xl">
            <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">Aucun résultat pour cette sélection.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="bg-slate-800 border border-slate-700/60 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <h3 className="font-bold text-lg text-white tracking-tight mb-2">{profile.full_name || 'Inscrit sans nom'}</h3>
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> {profile.phone}</p>
                  <p className="text-xs text-slate-400 mb-6 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {profile.city || profile.ville}</p>
                </div>
                {activeTab === 'ambassadeurs' ? (
                  <button onClick={() => handleToggleAmbassadorRole(profile.id, profile.role)} className="w-full py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                    Révoquer les droits
                  </button>
                ) : (
                  <button onClick={() => setSelectedProfile(profile)} className="w-full py-2.5 bg-slate-700/60 text-slate-200 rounded-xl text-xs font-bold border border-slate-600/50 hover:border-blue-500 hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> Inspecter
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-2 bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            <div className="p-8">
              <h2 className="text-xl font-black text-white mb-6 border-b border-slate-700 pb-4">Analyse : {selectedProfile.full_name}</h2>
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-xs">
                  <div><span className="block text-slate-500 font-bold mb-1">Téléphone</span><span className="text-slate-200">{selectedProfile.phone}</span></div>
                  <div><span className="block text-slate-500 font-bold mb-1">Ville</span><span className="text-slate-200">{selectedProfile.city || selectedProfile.ville}</span></div>
                </div>

                <div className="bg-slate-900/30 border border-slate-700 p-5 rounded-xl">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Identité (CIP / Acte)</span>
                  {selectedProfile.cip_url ? (
                    <a href={selectedProfile.cip_url} target="_blank" rel="noopener noreferrer" className="px-4 py-3 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 flex justify-center items-center gap-2"><Eye className="w-4 h-4" /> Visualiser le document</a>
                  ) : (
                     <p className="text-xs text-amber-500 font-bold text-center">Aucune pièce fournie</p>
                  )}
                </div>

                {selectedProfile.status === 'en_attente_validation' && (
                  <div className="bg-slate-900/30 border border-slate-700 p-5 rounded-xl">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assignation Terrain Nationale</span>
                    <input 
                      type="text"
                      placeholder="Ex: Secteur Djougou Centre, Agblangandan, Natitingou..."
                      value={assignedAmbassadorZone}
                      onChange={(e) => setAssignedAmbassadorZone(e.target.value)}
                      className="w-full p-3 border border-slate-700 rounded-lg bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 text-slate-200 outline-none placeholder-slate-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-700">
                {selectedProfile.status === 'en_attente_validation' ? (
                  <>
                    <button disabled={isUpdating} onClick={() => handleUpdateStatus(selectedProfile.id, 'rejete')} className="flex-1 py-3 px-4 bg-red-500/10 text-red-400 font-bold rounded-xl text-xs hover:bg-red-600 hover:text-white transition-all">Rejeter</button>
                    <button disabled={isUpdating} onClick={() => handleUpdateStatus(selectedProfile.id, 'valide')} className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-500 transition-all flex justify-center items-center gap-2">
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Approuver
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleUpdateStatus(selectedProfile.id, 'en_attente_validation')} className="w-full py-3 bg-slate-700 text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-600 transition-all">Remettre en examen</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}