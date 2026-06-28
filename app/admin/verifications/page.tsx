export default function AdminVerifications() {
    return (
      <div>
        <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
          <p className="text-orange-100 text-sm mb-1">Modération</p>
          <h1 className="text-3xl font-bold">Vérification des documents</h1>
          <p className="text-orange-100 mt-1">Validez ou refusez les dossiers des artisans</p>
        </div>
  
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex gap-4 mb-6">
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
              En attente
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-orange-50 hover:text-orange-500">
              Approuvés
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-orange-50 hover:text-orange-500">
              Refusés
            </button>
          </div>
  
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Artisan</th>
                <th className="pb-3">Document</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-400">
                  Aucun document en attente
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }