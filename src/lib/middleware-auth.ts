import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration du rate limiting
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requêtes par fenêtre
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Stockage simple en mémoire (en production, utiliser Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Ignorer les routes statiques et les API de santé
  if (url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/favicon.ico') || 
      url.pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // Appliquer le rate limiting aux routes API
  if (url.pathname.startsWith('/api/')) {
    const now = Date.now();
    const userLimit = rateLimitStore.get(ip);
    
    // Nettoyer les entrées expirées
    if (userLimit && now > userLimit.resetTime) {
      rateLimitStore.delete(ip);
    }
    
    // Vérifier si l'utilisateur a dépassé la limite
    if (userLimit && userLimit.count > RATE_LIMIT_MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': Math.ceil((userLimit.resetTime - now) / 1000).toString(),
          }
        }
      );
    }
    
    // Incrémenter le compteur
    if (!userLimit) {
      rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS
      });
    } else {
      userLimit.count++;
      rateLimitStore.set(ip, userLimit);
    }
  }

  // Ajouter des en-têtes de sécurité globaux
  const response = NextResponse.next();
  
  // En-têtes de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Politique de contenu (CSP) - version basique
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'none'; object-src 'none';"
  );
  
  // Politique de cookies
  response.headers.set('Set-Cookie', 'HttpOnly; Secure; SameSite=strict');
  
  // Prévenir le clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  return response;
}

// Configuration des routes à matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
