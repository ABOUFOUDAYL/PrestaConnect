export default function EnAttentePage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
        <h1 className="text-3xl font-bold text-yellow-600">Compte en attente de validation</h1>
        <p className="text-gray-600 max-w-md">
          Votre inscription a bien été reçue. Un administrateur va examiner 
          votre profil et vous contacter sous peu.
        </p>
      </div>
    );
  }