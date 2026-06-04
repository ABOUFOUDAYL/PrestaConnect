export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // 1. Routes publiques inchangées
  const publicRoutes = ['/', '/login', '/register', '/about', '/contact', 
    '/explore', '/prestataires', '/ressources', '/solutions', '/tarifs', 
    '/verification-final', '/annonces']
  
  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')

  // LA MODIFICATION : On autorise l'accès à la page admin pour qu'elle puisse 
  // faire sa propre vérification de rôle (dans page.tsx)
  if (isStatic || isPublic || pathname.startsWith('/admin-ambassadeur')) {
    return res
  }

  // 2. Vérification session
  const token = req.cookies.get('sb-access-token')?.value || 
                req.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}