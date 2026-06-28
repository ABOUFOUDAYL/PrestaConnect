"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠", mobileLabel: "Home" },
  { href: "/admin/verifications", label: "Vérifications", icon: "📋", mobileLabel: "Vérif." },
  { href: "/admin/artisans", label: "Gestion artisans", icon: "🔨", mobileLabel: "Artisans" },
  { href: "/admin/clients", label: "Gestion clients", icon: "👥", mobileLabel: "Clients" },
  { href: "/admin/ambassadeurs", label: "Ambassadeurs", icon: "🌟", mobileLabel: "Ambass." },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️", mobileLabel: "Config" },
];

export default function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="bg-white border-t border-gray-200 flex justify-around items-center h-16 px-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 text-xs px-1 py-1 rounded-lg transition-colors ${
              pathname === link.href
                ? "text-orange-500 font-semibold"
                : "text-gray-400"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="text-[10px] text-center leading-tight">{link.mobileLabel}</span>
          </Link>
        ))}
      </nav>
    );
  }

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
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}