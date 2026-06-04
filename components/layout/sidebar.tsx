'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Star, 
  BarChart3, 
  Settings 
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/services', label: 'Mes services', icon: Briefcase },
    { href: '/bookings', label: 'Réservations', icon: Calendar },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/payments', label: 'Paiements', icon: CreditCard },
    { href: '/reviews', label: 'Avis', icon: Star },
    { href: '/analytics', label: 'Analytiques', icon: BarChart3 },
    { href: '/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 p-6 flex flex-col justify-between">
      <div>
        <div className="mb-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm">
            PC
          </div>
          <h2 className="text-xl font-bold text-blue-600">PrestaConnect</h2>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-[11px] text-gray-400 font-medium">
        © 2026 PrestaConnect
      </div>
    </div>
  );
}