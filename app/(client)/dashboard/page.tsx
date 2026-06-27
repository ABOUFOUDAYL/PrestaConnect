"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  FileText, 
  MessageSquare, 
  Heart, 
  Clock, 
  AlertCircle,
  User
} from "lucide-react";

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  
  // États de chargement et d'erreurs
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Données de l'utilisateur et statistiques
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    demandes: 0,
    devis: 0,
    conversations: 0,
    favoris: 0,
  });

  // Listes pour les activités récentes
  const [recentDemandes, setRecentDemandes] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // 1. Récupération sécurisée de la session utilisateur
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) throw authError;
        
        if (!session?.user) {
          setErrorMessage("Vous devez être connecté pour accéder à cette page.");
          return;
        }

        const currentUser = session.user;
        setUser(currentUser);
        const userId = currentUser.id;

        // 2. Récupération des données en parallèle (Promise.all)
        // Chaque requête est isolée pour éviter qu'un échec sur une table bloque toutes les autres
        const [
          demandesRes, 
          devisRes, 
          conversationsRes, 
          favorisRes
        ] = await Promise.all([
          supabase.from("demandes").select("*", { count: "exact" }).eq("client_id", userId).order("created_at", { ascending: false }).limit(5),
          supabase.from("devis").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("conversations").select("*", { count: "exact", head: true }).eq("client_id", userId),
          supabase.from("favoris").select("*", { count: "exact", head: true }).eq("user_id", userId),
        ]);

        // Traitement des demandes récentes (si la colonne client_id n'existe pas, demandesRes.error sera défini)
        if (!demandesRes.error && demandesRes.data) {
          setRecentDemandes(demandesRes.data);
          setStats(prev => ({ ...prev, demandes: demandesRes.count || 0 }));
        } else if (demandesRes.error) {
          console.warn("Note: Impossible de charger les demandes (Vérifiez la colonne client_id) :", demandesRes.error.message);
        }

        // Mise à jour des autres compteurs
        setStats(prev => ({
          ...prev,
          devis: devisRes.count || 0,
          conversations: conversationsRes.count || 0,
          favoris: favorisRes.count || 0,
        }));

      } catch (error: any) {
        console.error("Erreur critique lors du chargement du tableau de bord :", error);
        setErrorMessage("Une erreur est survenue lors de la synchronisation de vos données.");
      } finally {
        // ZONE DE SÉCURITÉ ABSOLUE : Quoi qu'il se passe au-dessus, on retire l'écran de chargement
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [supabase]);

  // Écran de chargement initial (Ne restera jamais bloqué grâce au finally)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Authentification et chargement en cours...</p>
      </div>
    );
  }

  // Écran si l'utilisateur n'est pas connecté
  if (errorMessage && !user) {
    return (
      <div className="p-6 max-w-md mx-auto my-12 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold">Accès refusé</h3>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* En-tête de bienvenue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Bienvenue <span>👋</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
        </div>
      </div>

      {/* Grille des indicateurs / Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cartes Demandes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Mes demandes</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.demandes}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Cartes Devis */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Devis reçus</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.devis}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Cartes Messages */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Messages</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.conversations}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Cartes Favoris */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Favoris</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.favoris}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section Activité Récente */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" /> Activité récente
        </h2>

        {recentDemandes.length === 0 ? (
          // S'affiche proprement si la table est vide ou s'il y a eu un problème de colonne
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-500 font-medium">Aucune activité pour le moment</p>
            <p className="text-gray-400 text-xs mt-1">Vos dernières demandes de prestations apparaîtront ici.</p>
          </div>
        ) : (
          // S'affiche dès qu'il y a des lignes dans la base de données
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Ville</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User className="w-4 h-4" />
                      </div>
                      {demande.client_name || "Client anonyme"}
                    </td>
                    <td className="px-4 py-4">{demande.telephone || "Non renseigné"}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {demande.ville || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}