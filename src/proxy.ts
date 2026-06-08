import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // update user's auth session
  const { supabaseResponse, user } = await updateSession(request)

  const url = request.nextUrl
  const isAuthPage = url.pathname === '/login' || url.pathname === '/signup'
  const isPublicRoute = isAuthPage || url.pathname === '/' || url.pathname.startsWith('/api/')

  // If there's no user and the route is not public, redirect to login
  if (!user && !isPublicRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If there's a user and they're on an auth page, redirect to dashboard
  if (user && isAuthPage) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
