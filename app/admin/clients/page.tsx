export default function AdminClients() {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion Clients</h1>
        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Nom</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  Aucun client pour le moment
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }