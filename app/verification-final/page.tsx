"use client";

export default function VerificationPage() {
  return (
    <main className="p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Titre large et clair */}
        <h1 className="text-4xl font-black text-gray-900">Validation de votre compte</h1>
        <p className="text-xl text-gray-600">Sélectionnez vos documents pour obtenir votre badge de confiance.</p>

        {/* Bloc directif pour la pièce d'identité */}
        <section className="bg-white p-8 rounded-3xl border-2 border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">1. Pièce d'identité</h2>
          <p className="mb-6 text-gray-500">Carte d'identité ou Passeport (Photo nette)</p>
          <input type="file" className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-lg font-bold" />
        </section>

        {/* Bloc directif pour le diplôme */}
        <section className="bg-white p-8 rounded-3xl border-2 border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">2. Diplôme ou Attestation</h2>
          <p className="mb-6 text-gray-500">Preuve de votre expertise métier</p>
          <input type="file" className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-lg font-bold" />
        </section>

        {/* Bouton d'action massif et directif */}
        <button className="w-full bg-blue-700 text-white text-2xl font-black py-6 rounded-3xl shadow-lg hover:bg-blue-800 transition">
          ENVOYER MON DOSSIER MAINTENANT
        </button>

      </div>
    </main>
  );
}