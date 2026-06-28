"use client";

export default function AdminTopbar() {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div className="flex items-center gap-4 ml-6">
        <span className="text-sm text-gray-500">Administrateur</span>
        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}