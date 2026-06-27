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
      <div className="p-6 text-xl font-bold border-b">Admin</div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}