'use client'

import { usePathname } from 'next/navigation'

const DASHBOARD_ROUTES = [
  '/dashboard',
  '/settings',
  '/bookings',
  '/messages',
  '/payments',
  '/services',
  '/analytics',
  '/admin',
  '/artisan',
  '/ambassadeur',
  '/admin-ambassadeur'
]

export function ConditionalShell({
  children,
  navbar,
  footer,
}: {
  children: React.ReactNode
  navbar: React.ReactNode
  footer: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboard = DASHBOARD_ROUTES.some(route => pathname.startsWith(route))

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {navbar}
      <main className="flex-1 pt-[var(--navbar-height)]">
        {children}
      </main>
      {footer}
    </div>
  )
}