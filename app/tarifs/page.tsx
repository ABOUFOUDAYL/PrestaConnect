'use client';

import React from 'react';
import { ShieldCheck, Coins, CheckCircle2, FileText, ArrowRight, ShieldAlert } from 'lucide-react';

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* En-tête */}
      <div className="max-w-3xl mx-auto text-center space-y-4 pt-24 mb-12">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Transparence totale, selon votre métier
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto">
          Sur PrestaConnect, aucun abonnement mensuel obligatoire. Nous adaptons nos règles pour soutenir l'artisanat et garantir la sécurité au Bénin.
        </p>
      </div>

      {/* Grille des 2 Catégories */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Catégorie 1 : Métiers Techniques à Diplôme */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6 relative">
          <div className="absolute top-4 right-4 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
            Sur Diplôme
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Métiers Techniques</h3>
            <p className="text-xs text-slate-500">Plomberie, Électricité, Maçonnerie, Climatisation, Mécanique...</p>
            <div className="pt-2 flex items-baseline text-slate-900">
              <span className="text-3xl font-black tracking-tight">200 FCFA</span>
              <span className="ml-1 text-sm font-semibold text-slate-500">/ déblocage contact</span>
            </div>
          </div>

          <ul className="space-y-3 border-t border-slate-50 pt-4 text-sm text-slate-600">
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Inscription et réception des pannes <strong>100% gratuites</strong>.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Vous ne payez 200 FCFA que pour obtenir le numéro de téléphone du client.</span>
            </li>
            <li className="flex items-start space-x-3">
              <FileText className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>Document requis :</strong> Attestation, Certificat (CQP/CQM) ou Diplôme de formation.</span>
            </li>
          </ul>
        </div>

        {/* Catégorie 2 : Métiers de Service à la Personne */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 md:p-8 space-y-6 relative ring-2 ring-purple-500/5">
          <div className="absolute top-4 right-4 bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
            Sécurité Maximale
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Services de Proximité</h3>
            <p className="text-xs text-slate-500">Ménage, Nounous, Gardiens de nuit, Cuisiniers à domicile...</p>
            <div className="pt-2 flex items-baseline text-purple-700">
              <span className="text-3xl font-black tracking-tight">0 FCFA</span>
              <span className="ml-1 text-sm font-semibold text-purple-500">/ pour l'artisan</span>
            </div>
          </div>

          <ul className="space-y-3 border-t border-slate-50 pt-4 text-sm text-slate-600">
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>Accès illimité et gratuit aux coordonnées de vos clients.</span>
            </li>
            <li className="flex items-start space-x-3">
              <ShieldAlert className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span><strong>Condition stricte :</strong> Fournir obligatoirement un <strong>Casier Judiciaire</strong> vierge.</span>
            </li>
            <li className="flex items-start space-x-3">
              <Coins className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Le client paie une contribution de sécurité lors de la commande pour financer la vérification.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bouton d'action global */}
      <div className="text-center mt-12">
        <a href="/register/provider" className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition">
          <span>Créer mon compte prestataire maintenant</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}