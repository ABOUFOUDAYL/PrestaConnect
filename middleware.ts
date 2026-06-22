import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_TIMEOUT_MINUTES = 30

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ✅ Timeout de session : déconnexion après 30 min d'inactivité
  if (user) {
    const lastActivity = request.cookies.get('last_activity')?.value
    const now = Date.now()

    if (lastActivity) {
      const diff = now - parseInt(lastActivity)
      const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000

      if (diff > timeoutMs) {
        // Session expirée → déconnexion et redirection login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        loginUrl.searchParams.set('reason', 'timeout')
        const res = NextResponse.redirect(loginUrl)
        res.cookies.delete('last_activity')
        return res
      }
    }

    // Mettre à jour le timestamp d'activité
    response.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TIMEOUT_MINUTES * 60,
    })
  }

  const protectedPaths = [
    '/dashboard',
    '/prestataire',
    '/admin-ambassadeur',
    '/factures',
    '/artisan',
    '/parametres',
    '/portefeuille',
    '/documents',
    '/messages',
    '/notifications',
    '/profil',
  ]

  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protection route admin
  if (request.nextUrl.pathname.startsWith('/admin-ambassadeur')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}