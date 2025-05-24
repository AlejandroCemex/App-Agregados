import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // If there's an error getting the user, treat as unauthenticated
    const isAuthenticated = !error && !!user

    // Define protected and public routes
    const protectedRoutes = [
      '/dashboard', 
      '/admin', 
      '/profile',
      '/nueva-cotizacion',
      '/cotizacion-flete',
      '/historial',
      '/reportes',
      '/generar-cotizacion'
    ]
    const authRoutes = ['/login', '/signup']
    
    const pathname = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Redirect logic
    if (!isAuthenticated && isProtectedRoute) {
      // User is not authenticated and trying to access protected route
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthenticated && isAuthRoute) {
      // User is authenticated and trying to access auth route
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      redirectUrl.search = '' // Clear any search params
      return NextResponse.redirect(redirectUrl)
    }

    // For root path, redirect authenticated users to dashboard
    if (isAuthenticated && pathname === '/') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // For root path, redirect unauthenticated users to login
    if (!isAuthenticated && pathname === '/') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }

  } catch (error) {
    // On error, allow the request to proceed
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 