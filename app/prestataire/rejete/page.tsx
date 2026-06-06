export default function RejetePage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
        <h1 className="text-3xl font-bold text-red-600">Compte non approuvé</h1>
        <p className="text-gray-600 max-w-md">
          Votre demande n'a pas été approuvée. Contactez-nous pour plus d'informations.
        </p>
      </div>
    );
  }