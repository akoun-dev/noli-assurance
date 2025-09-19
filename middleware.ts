import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { validateLogin, validateRegister, validateTwoFactor } from '@/lib/validation';
import { monitoringService, logSecurityEvent, logPerformanceMetric } from '@/lib/monitoring';

// Configuration du rate limiting
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requêtes par fenêtre
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Stockage simple en mémoire (en production, utiliser Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cache simple pour les validations fréquentes
const validationCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

// Configuration CSRF - secrets pour la génération de tokens
const CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-csrf-secret';

/**
 * Cache pour les résultats de validation
 */
function getValidationCache(key: string): boolean | null {
  const cached = validationCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result
  }
  return null
}

function setValidationCache(key: string, result: boolean): void {
  validationCache.set(key, { result, timestamp: Date.now() })
  // Nettoyer le cache si trop grand
  if (validationCache.size > 1000) {
    const oldestKey = validationCache.keys().next().value
    if (oldestKey) {
      validationCache.delete(oldestKey)
    }
  }
}

/**
 * Validation des requêtes CSRF pour les méthodes sensibles
 */
function validateCSRF(request: NextRequest): boolean {
  const method = request.method
  const csrfToken = request.headers.get('x-csrf-token') ||
                     request.headers.get('csrf-token') ||
                     request.cookies.get('csrf-token')?.value

  // Les méthodes sécurisées n'ont pas besoin de validation CSRF
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(method)) {
    return true
  }

  // Les méthodes de modification de données nécessitent un token CSRF valide
  const sensitiveMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
  if (sensitiveMethods.includes(method)) {
    // Pour l'instant, on accepte les requêtes sans token CSRF en développement
    // En production, il faudrait implémenter une vraie validation CSRF
    return process.env.NODE_ENV === 'development' || !!csrfToken
  }

  return true
}

/**
 * Protection contre les injections SQL dans les paramètres
 */
function validateSQLInjection(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|UNION|EXEC|EXECUTE)(\s|$)/i,
    /(\s|^)(FROM|INTO|WHERE|SET|VALUES)(\s|$)/i,
    /[';"]\s*OR\s*['"1=1']/i,
    /[';"]\s*AND\s*['"1=1']/i,
    /(\s|^)(--|\/\*|\*\/|#{|@@)/i,
  ]

  return !sqlInjectionPatterns.some(pattern => pattern.test(input))
}

/**
 * Protection contre les attaques XSS dans les paramètres
 */
function validateXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<\?php/gi,
    /<\?\s*=/gi,
    /eval\s*\(/gi,
  ]

  return !xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Validation des paramètres de requête
 */
function validateQueryParams(request: NextRequest): boolean {
  const { searchParams } = request.nextUrl

  for (const [key, value] of searchParams) {
    if (!validateSQLInjection(key) || !validateSQLInjection(value)) {
      return false
    }
    if (!validateXSS(key) || !validateXSS(value)) {
      return false
    }
  }

  return true
}

/**
 * Validation du corps de la requête pour les données sensibles
 */
async function validateRequestBody(request: NextRequest): Promise<boolean> {
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return true
  }

  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await request.clone().json()

      // Validation récursive des objets JSON
      const validateObject = (obj: any): boolean => {
        if (typeof obj === 'string') {
          return validateSQLInjection(obj) && validateXSS(obj)
        } else if (Array.isArray(obj)) {
          return obj.every(item => validateObject(item))
        } else if (obj && typeof obj === 'object') {
          return Object.values(obj).every(value => validateObject(value))
        }
        return true
      }

      return validateObject(body)
    }

    return true
  } catch (error) {
    console.error('Erreur lors de la validation du corps de la requête:', error)
    return false
  }
}

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
  const startTime = Date.now()
  const url = request.nextUrl;
  const pathname = url.pathname;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Ignorer les routes statiques et les API de santé
  if (pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // Vérifier le cache pour les validations
  const cacheKey = `${ip}-${pathname}-${request.method}`
  const cachedResult = getValidationCache(cacheKey)

  if (cachedResult === false) {
    // Si la validation a échoué précédemment, bloquer immédiatement
    await logSecurityEvent({
      eventType: 'REQUEST_BLOCKED_CACHE',
      severity: 'MEDIUM',
      description: `Requête bloquée par cache - IP: ${ip}`,
      ipAddress: ip,
      userAgent: userAgent,
      route: pathname,
      metadata: { method: request.method }
    })

    return new NextResponse(
      JSON.stringify({
        error: 'Requête bloquée',
        message: 'La requête a été bloquée pour des raisons de sécurité'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Block': 'cache-denied'
        }
      }
    )
  }

  // Validation de sécurité avec cache
  const csrfValid = validateCSRF(request)
  const queryParamsValid = validateQueryParams(request)
  const requestBodyValid = await validateRequestBody(request)

  const validationPassed = csrfValid && queryParamsValid && requestBodyValid

  // Mettre en cache le résultat
  setValidationCache(cacheKey, validationPassed)

  if (!validationPassed) {
    console.warn(`Sécurité: Requête bloquée - IP: ${ip}, Path: ${pathname}`)

    await logSecurityEvent({
      eventType: 'REQUEST_BLOCKED_VALIDATION',
      severity: 'HIGH',
      description: `Requête bloquée - IP: ${ip}, Path: ${pathname}`,
      ipAddress: ip,
      userAgent: userAgent,
      route: pathname,
      metadata: {
        method: request.method,
        csrfValid,
        queryParamsValid,
        requestBodyValid
      }
    })

    return new NextResponse(
      JSON.stringify({
        error: 'Requête invalide',
        message: 'La requête a été bloquée pour des raisons de sécurité'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Block': 'validation-failed'
        }
      }
    )
  }

  // Rate limiting pour les API
  if (pathname.startsWith('/api/')) {
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
    return addSecurityHeaders(NextResponse.next(), pathname);
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

      return addSecurityHeaders(response, pathname);

    } catch (error) {
      console.error('Erreur middleware:', error);
      return NextResponse.redirect(new URL('/connexion', request.url));
    }
  }

  // Autoriser les autres routes
  const response = addSecurityHeaders(NextResponse.next(), pathname);

  // Logger les métriques de performance
  const responseTime = Date.now() - startTime
  const token = await getToken({ req: request })

  // Logger de manière asynchrone pour ne pas bloquer la réponse
  logPerformanceMetric({
    route: pathname,
    method: request.method,
    responseTime,
    statusCode: response.status,
    cacheHit: false, // À implémenter avec un vrai cache
    userId: token?.sub
  }).catch(error => {
    console.error('Erreur lors du logging de la performance:', error)
  })

  return response;
}

function addSecurityHeaders(response: NextResponse, pathname: string) {
  // En-têtes de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Politique de contenu (CSP) - version renforcée
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
  );

  // Prévenir le clickjacking pour les routes sensibles
  if (pathname.includes('/admin') || pathname.includes('/dashboard')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }

  return response;
}

// Configuration des routes à matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};