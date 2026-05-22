import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/token';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Let internal routes, static files, login/signup APIs, and public images pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images/') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg')
  ) {
    return NextResponse.next();
  }

  // Validate session token asynchronously
  const payload = token ? (await verifyToken(token)) : null;
  const isValidSession = payload !== null;

  // Protect admin routes first
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isAdminRoute) {
    if (!isValidSession) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (payload?.email !== 'rwaguimaraes@gmail.com') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Acesso proibido.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If user is logged in and accesses login page, redirect to dashboard
  if (isValidSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard and secure app pages/APIs
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isOtherApiRoute = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth');

  if (!isValidSession && (isDashboardRoute || isOtherApiRoute)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets and standard bypasses
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

