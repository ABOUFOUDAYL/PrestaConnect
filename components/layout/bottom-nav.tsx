"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useImpersonation } from "@/contexts/impersonation-context";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  CreditCard,
  Settings,
  ShieldCheck,
} from "lucide-react";

const defaultNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Réservations", icon: CalendarCheck },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/payments", label: "Paiements", icon: CreditCard },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-ambassadeur", label: "Cockpit", icon: ShieldCheck },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/payments", label: "Paiements", icon: CreditCard },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { authUser } = useAuth();
  const { impersonated } = useImpersonation();

  const activeRole = impersonated?.role ?? authUser?.role;
  const nav = (activeRole === 'admin' || activeRole === 'super_admin') ? adminNav : defaultNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex flex-col items-center gap-1 px-2 py-2 rounded-xl flex-1 " +
                (isActive ? "text-primary" : "text-muted-foreground")
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}