export default function AdminParametres() {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h1>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du site
            </label>
            <input
              type="text"
              defaultValue="PrestaConnect"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de contact
            </label>
            <input
              type="email"
              placeholder="admin@prestaconnect.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Sauvegarder
          </button>
        </div>
      </div>
    );
  }