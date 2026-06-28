export default function AdminDashboard() {
    return (
      <div>
        <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white">
          <p className="text-orange-100 text-sm mb-1">Bonjour 👋</p>
          <h1 className="text-3xl font-bold">Panel Admin</h1>
          <p className="text-orange-100 mt-1">Gestion de la plateforme PrestaConnect</p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Artisans", value: "0" },
            { label: "Clients", value: "0" },
            { label: "Ambassadeurs", value: "0" },
            { label: "Commandes", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }