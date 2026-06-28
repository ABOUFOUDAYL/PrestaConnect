"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/artisans", label: "Gestion artisans" },
  { href: "/admin/clients", label: "Gestion clients" },
  { href: "/admin/ambassadeurs", label: "Gestion ambassadeurs" },
  { href: "/admin/parametres", label: "Paramètres" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <div>
            <p className="font-bold text-gray-800">PrestaConnect</p>
            <p className="text-xs text-orange-500">Espace Admin</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}