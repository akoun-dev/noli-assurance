import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configuration des rôles et des routes autorisées
const ROLE_ROUTES = {
  USER: [
    '/',
    '/dashboard',
    '/profil',
    '/devis',
    '/devis-recus',
    '/resultats',
    '/offres',
    '/formulaire-assure',
    '/formulaire-vehicule',
    '/formulaire-options',
    '/deconnexion',
  ],
  ADMIN: [
    '/admin',
    '/utilisateurs',
    '/devis-admin',
    '/offres-admin',
    '/logs',
    '/statistiques',
    '/parametres',
    '/creer-assureur',
    '/deconnexion',
  ],
  ASSUREUR: [
    '/assureur',
    '/devis',
    '/offres',
    '/profil',
    '/deconnexion',
  ],
} as const;

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = [
  '/',
  '/connexion',
  '/inscription',
  '/verify-2fa',
  '/api/health',
  '/api/auth',
  '/api/test-auth',
];

// Routes protégées (nécessitent une authentification)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profil',
  '/admin',
  '/utilisateurs',
  '/devis-admin',
  '/offres-admin',
  '/logs',
  '/statistiques',
  '/parametres',
  '/creer-assureur',
  '/assureur',
  '/devis',
  '/devis-recus',
  '/resultats',
  '/offres',
  '/formulaire-assure',
  '/formulaire-vehicule',
  '/formulaire-options',
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  
  // Ignorer les routes statiques et les API de santé
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon.ico') || 
      pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // Vérifier si la route est publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Vérifier si la route est protégée
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Routes publiques - autoriser l'accès
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Routes protégées - vérifier l'authentification et les rôles
  if (isProtectedRoute) {
    try {
      // Récupérer le token JWT
      const token = await getToken({ req: request });
      
      if (!token) {
        // Rediriger vers la page de connexion si non authentifié
        const loginUrl = new URL('/connexion', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const userRole = token.role as string;
      
      // Vérifier si l'utilisateur a le rôle approprié pour la route
      const hasAccess = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES]?.some(route => 
        pathname.startsWith(route) || pathname === route
      );

      if (!hasAccess) {
        // Rediriger vers le tableau de bord approprié
        let redirectUrl = '/dashboard';
        
        if (userRole === 'ADMIN') {
          redirectUrl = '/admin';
        } else if (userRole === 'ASSUREUR') {
          redirectUrl = '/assureur';
        }
        
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // Vérifier la 2FA si nécessaire
      if (pathname !== '/verify-2fa' && token.twoFactorEnabled && !token.twoFactorVerified) {
        return NextResponse.redirect(new URL('/verify-2fa', request.url));
      }

      // Ajouter les informations utilisateur à l'en-tête pour les composants
      const response = NextResponse.next();
      response.headers.set('x-user-role', userRole);
      response.headers.set('x-user-id', token.sub!);
      
      return response;
      
    } catch (error) {
      console.error('Erreur middleware:', error);
      return NextResponse.redirect(new URL('/connexion', request.url));
    }
  }

  // Autoriser les autres routes
  return NextResponse.next();
}

// Configuration des routes à matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
