'use client';

import { useState } from 'react';
import { useImpersonation } from '@/contexts/impersonation-context';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  client:      { bg: '#dbeafe', text: '#1e40af' },
  artisan:     { bg: '#dcfce7', text: '#166534' },
  prestataire: { bg: '#dcfce7', text: '#166534' },
  admin:       { bg: '#f1f5f9', text: '#475569' },
};

type User = {
  id: string;
  name: string;
  email?: string;
  role: 'client' | 'artisan' | 'prestataire';
};

export function VoirEnTantQueButton({ users = [] }: { users?: User[] }) {
  const { impersonated, startImpersonation, stopImpersonation } = useImpersonation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  if (impersonated) {
    return (
      <button
        onClick={stopImpersonation}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all"
      >
        ✕ Arrêter l'observation
      </button>
    );
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all"
      >
        👁 Voir en tant que…
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
          <div className="p-3 border-b border-slate-100">
            <input
              autoFocus
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">Aucun utilisateur</li>
            ) : filtered.map(u => {
              const c = ROLE_COLORS[u.role] ?? ROLE_COLORS.admin;
              return (
                <li key={u.id}>
                  <button
                    onClick={() => {
                      startImpersonation({ id: u.id, name: u.name, role: u.role });
                      setOpen(false);
                      setSearch('');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-50 transition-all text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800">{u.name}</div>
                      {u.email && (
                        <div className="text-xs text-slate-400 truncate">{u.email}</div>
                      )}
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {u.role}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}