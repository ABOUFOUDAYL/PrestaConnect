'use client';

import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-blue-100 p-10 rounded-[3rem] shadow-xl shadow-blue-50/50 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-lg shadow-blue-200">
          <Calendar size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          Réservations
        </h1>
        
        <p className="text-gray-500 font-medium leading-relaxed mb-10">
          Toutes vos interventions confirmées sont désormais gérées directement dans votre tableau de bord principal pour plus de simplicité.
        </p>

        <Link 
          href="/dashboard"
          className="group w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-200"
        >
          Aller au Dashboard
          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}