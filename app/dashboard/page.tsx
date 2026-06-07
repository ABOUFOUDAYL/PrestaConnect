'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, Star, Clock, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUser(profile);
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">

        {/* Header */}
        <div className="bg-white rounded-2xl border p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {user?.full_name || 'Client'} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Bienvenue sur votre espace PrestaConnect</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/explore"
            className="bg-blue-600 text-white rounded-2xl p-6 flex flex-col gap-3 hover:bg-blue-700 transition">
            <Search size={24} />
            <div>
              <p className="font-bold">Trouver un artisan</p>
              <p className="text-blue-100 text-sm">Parcourez les prestataires</p>
            </div>
          </Link>

          <Link href="/dashboard/reservations"
            className="bg-white border rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition">
            <Clock size={24} className="text-blue-600" />
            <div>
              <p className="font-bold text-gray-900">Mes réservations</p>
              <p className="text-gray-500 text-sm">Suivez vos demandes</p>
            </div>
          </Link>

          <Link href="/dashboard/settings"
            className="bg-white border rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition">
            <Settings size={24} className="text-gray-600" />
            <div>
              <p className="font-bold text-gray-900">Mon profil</p>
              <p className="text-gray-500 text-sm">Gérez vos informations</p>
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" /> Comment ça marche
          </h2>
          <div className="space-y-3">
            {[
              { num: "1", text: "Recherchez un artisan par métier ou localité" },
              { num: "2", text: "Payez 500 FCFA pour débloquer son contact WhatsApp" },
              { num: "3", text: "Contactez-le directement et négociez le tarif" },
            ].map(item => (
              <div key={item.num} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.num}
                </div>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
