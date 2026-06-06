'use client';

import { useImpersonation } from '@/contexts/impersonation-context';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';

export function ImpersonationBar() {
  const { impersonated, stopImpersonation } = useImpersonation();
  const router = useRouter();

  if (!impersonated) return null;

  const handleStop = () => {
    stopImpersonation();
    router.push('/admin-ambassadeur');
  };

  return (
    <div className="w-full bg-orange-500 text-white px-4 py-2 flex items-center justify-between z-50 text-sm font-semibold">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>
          Mode observation —{' '}
          <span className="font-black">{impersonated.name}</span>{' '}
          <span className="opacity-75">({impersonated.role})</span>
        </span>
      </div>
      <button
        onClick={handleStop}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all"
      >
        <X className="w-3.5 h-3.5" />
        Quitter
      </button>
    </div>
  );
}