import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Only protect app routes; allow /auth/* and / to pass without redirects to avoid loops
  const protectedRoutes = ['/jobs', '/candidates', '/interviews', '/reports', '/analytics', '/settings', '/profile', '/dashboard', '/subscription', '/prompt-template']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    console.log('🛡️ Protected route accessed:', request.nextUrl.pathname);
    
    // Check for ANY Supabase auth cookies
    const cookies = request.cookies.getAll();
    const hasSupabaseCookie = cookies.some(cookie => 
      cookie.name.startsWith('sb-') || 
      cookie.name.includes('supabase')
    );

    // If has ANY auth cookies, allow through immediately (client will handle auth)
    if (hasSupabaseCookie) {
      console.log('✅ Auth cookie found, allowing access');
      return response;
    }

    // No cookies at all - likely not logged in
    console.log('⚠️ No auth cookies found');
    
    // Check if Supabase is configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const isConfigured = url && url.includes('supabase.co') && !url.includes('demo') &&
                        key && key.length > 50 && key.includes('eyJ')
    
    // If not configured, allow through (dev mode)
    if (!isConfigured) {
      console.log('⚠️ Supabase not configured, allowing access (dev mode)');
      return response;
    }
    
    // Try to get user from Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('✅ User found via Supabase, allowing access');
        return response;
      }
    } catch (error) {
      console.log('⚠️ Error checking user:', error);
    }
    
    // No user found - redirect to login
    console.log('❌ No user found, redirecting to login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response
}

export const config = {
  matcher: [
    // Temporarily disabled to allow all routes
    // '/jobs/:path*',
    // '/jobs',
    // '/candidates/:path*',
    // '/interviews/:path*',
    // '/interviews',
    // '/reports/:path*',
    // '/reports',
    // '/analytics/:path*',
    // '/analytics',
    // '/settings/:path*',
    // '/settings',
    // '/profile/:path*',
    // '/profile',
    // '/dashboard/:path*',
    // '/dashboard',
  ],
}
