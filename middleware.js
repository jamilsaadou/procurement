import { NextResponse } from 'next/server';
import { validateSession } from './app/lib/auth';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/',
  '/dashboard',
  '/conventions',
  '/mandats',
  '/partenaires',
  '/lignes-budgetaires',
  '/rapports',
  '/configuration',
  '/utilisateurs'
];

// Routes publiques (pas besoin d'authentification)
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Ignorer les fichiers statiques et les API routes non protégées
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    publicRoutes.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Récupérer le token d'authentification
  const token = request.cookies.get('auth-token')?.value;
  
  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
  console.log('Middleware - All cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));
  console.log('Middleware - User-Agent:', request.headers.get('user-agent'));
  console.log('Middleware - Referer:', request.headers.get('referer'));

  if (!token) {
    console.log('Middleware - No token, redirecting to login');
    // Rediriger vers la page de connexion
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pour l'instant, on fait confiance au cookie s'il existe
  // La validation complète se fera côté page/API
  console.log('Middleware - Token present, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
