'use client';
import Link from 'next/link';
import { ArrowLeft, Megaphone } from 'lucide-react';

export default function AnnoncesPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} /> Retour au dashboard
      </Link>
      <div className="bg-white rounded-2xl border p-8 text-center">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Megaphone size={24} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes annonces</h1>
        <p className="text-gray-500 text-sm mb-6">Publiez une annonce pour que les prestataires vous contactent.</p>
        <Link href="/publier" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
          Publier une annonce
        </Link>
      </div>
    </div>
  );
}
