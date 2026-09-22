import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookie (set upon login)
  const sessionUser = request.cookies.get('appadentis_session_user')?.value;

  // Allow static assets, api routes, and next internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public route: /login
  if (pathname === '/login') {
    // If already logged in, redirect to dashboard
    if (sessionUser) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: If not logged in, redirect to /login
  if (!sessionUser) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
