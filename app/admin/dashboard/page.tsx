export default function AdminDashboard() {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Artisans", value: "0" },
            { label: "Clients", value: "0" },
            { label: "Ambassadeurs", value: "0" },
            { label: "Commandes", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }