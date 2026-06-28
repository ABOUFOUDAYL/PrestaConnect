"use client";

export default function AdminTopbar() {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800">Panel Admin</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Administrateur</span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}