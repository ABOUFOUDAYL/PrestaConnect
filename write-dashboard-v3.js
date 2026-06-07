const fs = require('fs');

const code = `"use client";
import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, MapPin, Briefcase, Megaphone, CreditCard, ChevronRight, Star, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ annonces: 0, prestataires: 0, paiements: 0 });
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { count: nbAnnonces } = await supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('client_id', user.id);
      const ville = prof?.ville || '';
      let q = supabase.from('profiles')
        .select('id, full_name, metier_type, metier, ville, note, diplome_verifie, avatar_url, telephone, phone')
        .in('role', ['artisan', 'prestataire'])
        .eq('status', 'valide');
      if (ville) q = q.eq('ville', ville);
      const { data: presta } = await q.order('note', { ascending: false }).limit(4);
      setPrestataires(presta || []);
      setStats({ annonces: nbAnnonces || 0, prestataires: (presta || []).length, paiements: 0 });
      setLoading(false);
    }
    load();
  }, [supabase]);

  const firstName = profile?.full_name?.split(' ')[0] || 'vous';
  const ville = profile?.ville || '';

  function getWhatsAppLink(p) {
    const tel = p.telephone || p.phone || '';
    let waNum = tel.replace(/[\\s()\\-]/g, '');
    if (waNum.startsWith('0')) waNum = '229' + waNum.slice(1);
    waNum = waNum.replace(/^\\+/, '');
    return tel ? 'https://wa.me/' + waNum + '?text=Bonjour je viens de PrestaConnect' : '#';
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} className="w-14 h-14 object-cover" alt="" />
            : <User size={24} className="text-blue-600" />}
        </div>
        <div>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Espace Client</p>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} 👋</h1>
          {ville && <div className="flex items-center gap-1 mt-0.5"><MapPin size={12} className="text-gray-400" /><span className="text-sm text-gray-400">{ville}</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Annonces', value: stats.annonces, icon: Megaphone, color: 'blue', href: '/dashboard/annonces' },
          { label: 'Prestataires', value: stats.prestataires, icon: Briefcase, color: 'green', href: '/dashboard' },
          { label: 'Paiements', value: stats.paiements, icon: CreditCard, color: 'purple', href: '/dashboard/paiements' },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 bg-" + color + "-50"}>
              <Icon size={18} className={"text-" + color + "-600"} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link href="/dashboard/annonces" className="flex items-center gap-4 bg-blue-600 text-white rounded-2xl p-5 hover:bg-blue-700 transition-colors">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold">Publier une annonce</p>
            <p className="text-blue-200 text-xs mt-0.5">Les prestataires vous contacteront</p>
          </div>
          <ChevronRight size={18} className="text-blue-300" />
        </Link>
        <Link href="/dashboard/messages" className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Mes messages</p>
            <p className="text-gray-400 text-xs mt-0.5">Discutez avec les prestataires</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Prestataires disponibles{ville ? ' à ' + ville : ''}
        </h2>
        {prestataires.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 text-sm">Aucun prestataire disponible dans votre ville.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prestataires.map(p => {
              const metier = p.metier || p.metier_type || 'Prestataire';
              const initials = (p.full_name || 'PC').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const doitPayer = p.diplome_verifie === false;
              const waLink = getWhatsAppLink(p);
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.avatar_url
                        ? <img src={p.avatar_url} className="w-12 h-12 object-cover" alt="" />
                        : <span className="text-blue-600 font-bold text-sm">{initials}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{p.full_name}</p>
                      <p className="text-xs text-gray-400">{metier}</p>
                      {p.ville && <div className="flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-gray-300" /><span className="text-xs text-gray-400">{p.ville}</span></div>}
                    </div>
                    {p.note && (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-600">{p.note}</span>
                      </div>
                    )}
                  </div>
                  {doitPayer ? (
                    <button onClick={() => alert('FedaPay 500 FCFA')} className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      <CreditCard size={15} />Débloquer - 500 FCFA
                    </button>
                  ) : (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 block text-center">
                      <MessageCircle size={15} />Contacter sur WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
`;

fs.writeFileSync('app/(dashboard)/dashboard/page.tsx', code, 'utf8');
console.log('done!');