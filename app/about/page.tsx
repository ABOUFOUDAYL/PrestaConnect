import Link from "next/link";
import { Target, Shield, Smartphone, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }} className="px-4 pt-28 pb-16 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-black mb-3">À propos de PrestaConnect</h1>
        <p className="text-red-100 text-base max-w-xl mx-auto">
          La marketplace de services pensée pour le Bénin.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 pb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
          <p className="text-gray-600 leading-relaxed">
            PrestaConnect connecte les Béninois aux meilleurs prestataires de services — plombiers, électriciens, coiffeur·se·s, livreurs et bien plus — partout à Cotonou, Porto-Novo, Parakou et dans les communes du pays.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Notre mission : rendre l&apos;accès aux services professionnels simple, sûr et accessible, avec des paiements en FCFA via Mobile Money (MTN, Moov) et une vérification rigoureuse des prestataires.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { icon: <Target size={18} />, label: "Mission claire" },
              { icon: <Shield size={18} />, label: "Prestataires vérifiés" },
              { icon: <Smartphone size={18} />, label: "Paiement Mobile Money" },
              { icon: <Users size={18} />, label: "Pensé pour le Bénin" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-gray-50">
                <div className="text-red-600">{item.icon}</div>
                <p className="text-xs font-medium text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/register/provider"
            className="inline-block mt-4 px-6 py-3 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}
          >
            Rejoindre la plateforme →
          </Link>
        </div>
      </div>
    </div>
  );
}