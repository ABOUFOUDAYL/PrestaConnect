'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, FileText, ArrowRight, ShieldAlert, Zap, Building2 } from 'lucide-react';

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

      {/* Grille des tarifs */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">

        {/* Tarif 1 — Urgence / Petits travaux */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 md:p-8 space-y-6 relative ring-2 ring-red-500/10">
          <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase"
            style={{ background: '#fff1f2', color: '#e63946' }}>
            <Zap className="w-3 h-3 inline mr-1" />Urgence
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Petits travaux & Urgences</h3>
            <p className="text-xs text-slate-500">Dépannage rapide, réparations, interventions urgentes...</p>
            <div className="pt-2 flex items-baseline" style={{ color: '#e63946' }}>
              <span className="text-4xl font-black tracking-tight">300</span>
              <span className="text-xl font-black ml-1">FCFA</span>
              <span className="ml-2 text-sm font-semibold text-slate-500">/ déblocage contact</span>
            </div>
          </div>

          <ul className="space-y-3 border-t border-slate-50 pt-4 text-sm text-slate-600">
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#e63946' }} />
              <span>Inscription et réception des demandes <strong>100% gratuites</strong>.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#e63946' }} />
              <span>Vous payez <strong>300 FCFA</strong> uniquement pour obtenir le contact du client.</span>
            </li>
            <li className="flex items-start space-x-3">
              <FileText className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>Document requis :</strong> Attestation, Certificat (CQP/CQM) ou Diplôme de formation.</span>
            </li>
          </ul>
        </div>

        {/* Tarif 2 — Gros chantiers */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 md:p-8 space-y-6 relative ring-2 ring-orange-500/10">
          <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase"
            style={{ background: '#fff7ed', color: '#f97316' }}>
            <Building2 className="w-3 h-3 inline mr-1" />Chantier
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Gros chantiers & Projets</h3>
            <p className="text-xs text-slate-500">Construction, rénovation, aménagement, projets de grande envergure...</p>
            <div className="pt-2 flex items-baseline" style={{ color: '#f97316' }}>
              <span className="text-4xl font-black tracking-tight">1 500</span>
              <span className="text-xl font-black ml-1">FCFA</span>
              <span className="ml-2 text-sm font-semibold text-slate-500">/ déblocage contact</span>
            </div>
          </div>

          <ul className="space-y-3 border-t border-slate-50 pt-4 text-sm text-slate-600">
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Accès aux projets de grande envergure avec budget élevé.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Contact direct avec le maître d'ouvrage ou l'entreprise cliente.</span>
            </li>
            <li className="flex items-start space-x-3">
              <ShieldAlert className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span><strong>Profil vérifié requis :</strong> Documents et expérience validés par notre équipe.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Section Services de proximité */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 md:p-8 relative ring-2 ring-green-500/10">
          <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase"
            style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <ShieldCheck className="w-3 h-3 inline mr-1" />Sécurité maximale
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">Services de Proximité</h3>
              <p className="text-xs text-slate-500">Ménage, Nounous, Gardiens de nuit, Cuisiniers à domicile...</p>
              <div className="pt-2 flex items-baseline text-green-700">
                <span className="text-4xl font-black tracking-tight">0</span>
                <span className="text-xl font-black ml-1">FCFA</span>
                <span className="ml-2 text-sm font-semibold text-slate-500">/ pour l'artisan</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Accès illimité et gratuit aux coordonnées de vos clients.</span>
              </li>
              <li className="flex items-start space-x-3">
                <ShieldAlert className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Condition stricte :</strong> Fournir obligatoirement un <strong>Casier Judiciaire</strong> vierge.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Note paiement */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="rounded-xl border border-slate-200 bg-slate-100 px-6 py-4 text-sm text-slate-600 text-center">
          💡 <strong>Paiement mobile bientôt disponible.</strong> Pour le moment, le déblocage de contact se fait via notre équipe. Contactez-nous pour toute demande.
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a href="/register/provider"
          className="inline-flex items-center space-x-2 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-sm transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}>
          <span>Créer mon compte prestataire maintenant</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}