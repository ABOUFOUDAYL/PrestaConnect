"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Comment trouver un prestataire sur PrestaConnect ?",
    answer: "Rendez-vous dans la section \"Trouver un prestataire\", choisissez votre catégorie de service et votre ville, puis comparez les profils disponibles avant de contacter celui qui vous convient.",
  },
  {
    question: "Comment puis-je payer un prestataire ?",
    answer: "Les paiements se font en FCFA via Mobile Money (MTN ou Moov), directement et en toute sécurité sur la plateforme.",
  },
  {
    question: "Les prestataires sont-ils vérifiés ?",
    answer: "Oui, chaque prestataire passe par une vérification de documents avant de pouvoir proposer ses services sur PrestaConnect.",
  },
  {
    question: "Comment devenir prestataire sur PrestaConnect ?",
    answer: "Cliquez sur \"Devenir Prestataire\", remplissez le formulaire d'inscription et soumettez vos documents. Votre profil sera validé après vérification.",
  },
  {
    question: "Que faire en cas de litige avec un prestataire ?",
    answer: "Contactez notre équipe via la page Contact, par email ou WhatsApp. Nous étudierons votre situation et reviendrons vers vous rapidement.",
  },
  {
    question: "Dans quelles villes PrestaConnect est-il disponible ?",
    answer: "PrestaConnect est disponible à Cotonou, Porto-Novo, Parakou et dans plusieurs autres communes du Bénin, avec une couverture qui s'étend progressivement.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }} className="px-4 pt-28 pb-16 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-black mb-3">Questions fréquentes</h1>
        <p className="text-red-100 text-base max-w-xl mx-auto">
          Tout ce qu&apos;il faut savoir pour bien utiliser PrestaConnect.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 pb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={"flex-shrink-0 text-gray-400 transition-transform " + (isOpen ? "rotate-180" : "")}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-2">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Vous ne trouvez pas de réponse à votre question ?{" "}
          <a href="/contact" className="font-semibold" style={{ color: "#e63946" }}>
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}