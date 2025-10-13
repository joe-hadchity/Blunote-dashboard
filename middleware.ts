import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/meetings',
  '/meeting',
  '/recordings',
  '/recording',
  '/videos',
  '/audio',
  '/profile',
  '/settings',
  '/calendar',
  '/integrations',
  '/support',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow callback without authentication check
  if (pathname === '/callback') {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    // If no access token but we have refresh token, let the page load
    // The /api/auth/me endpoint will handle refreshing the token
    if (!accessToken && !refreshToken) {
      // Redirect to login if no tokens at all
      const loginUrl = new URL('/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add tokens to headers for use in pages
    const requestHeaders = new Headers(request.headers);
    if (accessToken) {
      requestHeaders.set('x-access-token', accessToken);
    }
    if (refreshToken) {
      requestHeaders.set('x-refresh-token', refreshToken);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/signin' || pathname === '/signup') {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;
    
    if (accessToken || refreshToken) {
      return NextResponse.redirect(new URL('/recordings', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
