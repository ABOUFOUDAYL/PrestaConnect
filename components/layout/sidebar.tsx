'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Megaphone, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  Briefcase, 
  CalendarDays, 
  Star 
} from 'lucide-react'

// 👤 Menu exclusif pour le CLIENT
const clientLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mes annonces', href: '/dashboard/annonces', icon: Megaphone },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Paiements', href: '/dashboard/paiements', icon: CreditCard },
  { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
]

// 🛠️ Menu exclusif pour le PRESTATAIRE
const providerLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mes services', href: '/dashboard/services', icon: Briefcase },
  { name: 'Réservations', href: '/dashboard/reservations', icon: CalendarDays },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Paiements', href: '/dashboard/paiements', icon: CreditCard },
  { name: 'Avis', href: '/dashboard/avis', icon: Star },
  { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
]

export default function Sidebar({ userRole }: { userRole: 'client' | 'prestataire' }) {
  const pathname = usePathname()
  
  // Bascule automatique du menu selon le rôle
  const linksToDisplay = userRole === 'client' ? clientLinks : providerLinks

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col shadow-sm">
      {/* Logo de l'application */}
      <div className="p-6 flex items-center gap-2">
        <div className="bg-blue-600 text-white font-bold p-2 rounded-lg text-sm">
          PC
        </div>
        <h2 className="text-xl font-bold text-gray-800">PrestaConnect</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
        {linksToDisplay.map((link) => {
          const IconComponent = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md font-medium' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <IconComponent size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />
              <span className="text-sm">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer de la barre latérale */}
      <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center font-medium">
        © 2026 PrestaConnect
      </div>
    </aside>
  )
}