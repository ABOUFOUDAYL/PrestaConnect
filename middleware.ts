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

  if (user) {
    const lastActivity = request.cookies.get('last_activity')?.value
    const now = Date.now()

    if (lastActivity) {
      const diff = now - parseInt(lastActivity)
      const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000

      if (diff > timeoutMs) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        loginUrl.searchParams.set('reason', 'timeout')
        const res = NextResponse.redirect(loginUrl)
        res.cookies.delete('last_activity')
        return res
      }
    }

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

  // Protection route admin-ambassadeur
  if (request.nextUrl.pathname.startsWith('/admin-ambassadeur')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'ambassadeur') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protection route admin/parametres → super_admin uniquement
  if (request.nextUrl.pathname.startsWith('/admin/parametres')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Protection route admin → admin ET super_admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
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