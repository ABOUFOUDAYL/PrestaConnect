"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Home,
  ClipboardList,
  Hammer,
  Users,
  Star,
  KeyRound,
  Settings,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home, mobileLabel: "Home" },
  { href: "/admin/verifications", label: "Vérifications", icon: ClipboardList, mobileLabel: "Vérif." },
  { href: "/admin/artisans", label: "Gestion artisans", icon: Hammer, mobileLabel: "Artisans" },
  { href: "/admin/clients", label: "Gestion clients", icon: Users, mobileLabel: "Clients" },
  { href: "/admin/ambassadeurs", label: "Ambassadeurs", icon: Star, mobileLabel: "Ambass." },
  { href: "/admin/utilisateurs", label: "Utilisateurs & rôles", icon: KeyRound, mobileLabel: "Rôles" },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, mobileLabel: "Config" },
];

export default function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (mobile) {
    return (
      <nav className="bg-white border-t border-gray-200 flex justify-around items-center h-16 px-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 text-xs px-1 py-1 rounded-lg transition-colors ${
                pathname === link.href
                  ? "text-orange-500 font-semibold"
                  : "text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px] text-center leading-tight">{link.mobileLabel}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 text-xs px-1 py-1 rounded-lg text-gray-400"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] text-center leading-tight">Sortir</span>
        </button>
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
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}