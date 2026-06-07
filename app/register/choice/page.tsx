'use client';

import { useRouter } from 'next/navigation';
import { UserCircle, Wrench, ArrowRight } from 'lucide-react';

export default function RegisterChoicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">

        <div className="flex flex-col items-center mb-10">
          <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p className="text-slate-500 text-sm mt-1">Choisissez votre profil pour commencer</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Client */}
          <button
            onClick={() => router.push('/register/client')}
            className="group bg-white border border-slate-100 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4 hover:border-slate-400 hover:shadow-md transition text-left"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition">
              <UserCircle className="w-8 h-8 text-slate-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 text-lg">Je suis client</p>
              <p className="text-slate-500 text-sm mt-1">Je cherche un prestataire pour mes travaux</p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-medium text-slate-900">
              Continuer <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          {/* Prestataire */}
          <button
            onClick={() => router.push('/register/provider')}
            className="group bg-white border border-slate-100 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4 hover:border-slate-400 hover:shadow-md transition text-left"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition">
              <Wrench className="w-8 h-8 text-slate-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 text-lg">Je suis prestataire</p>
              <p className="text-slate-500 text-sm mt-1">Je propose mes services et compétences</p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-medium text-slate-900">
              Continuer <ArrowRight className="w-4 h-4" />
            </span>
          </button>

        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Déjà un compte ?{' '}
          <a href="/login" className="text-slate-900 font-medium hover:underline">
            Se connecter
          </a>
        </p>

      </div>
    </div>
  );
}
