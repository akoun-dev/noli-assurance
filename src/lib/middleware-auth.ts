import { NextRequest, NextResponse } from 'next/server'

/**
 * Types pour la session utilisateur
 */
interface UserSession {
  id: string
  email: string
  name: string
  prenom: string
  nom: string
  telephone: string
  role: string
  twoFactorEnabled: boolean
  twoFactorVerified: boolean
}

interface Session {
  user: UserSession
  expires: string
}

/**
 * Récupère la session utilisateur de manière simplifiée
 * Note: Cette version est temporaire et devrait être remplacée par getServerSession
 * quand les problèmes de types seront résolus
 */
async function getUserSession(request: NextRequest): Promise<Session | null> {
  try {
    // Pour l'instant, on vérifie juste le cookie de session
    // Dans une version complète, on utiliserait getServerSession
    const sessionCookie = request.cookies.get('next-auth.session-token') ||
                         request.cookies.get('__Secure-next-auth.session-token')
    
    if (!sessionCookie) {
      return null
    }

    // Simulation - dans la réalité, il faudrait décoder le JWT
    // Pour l'instant, on retourne null pour forcer la ré-authentification
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return null
  }
}

/**
 * Middleware pour vérifier l'authentification de l'utilisateur
 * @param request La requête entrante
 * @param requiredRoles Rôles requis pour accéder à la route (optionnel)
 * @returns NextResponse ou null si l'utilisateur est autorisé
 */
export async function withAuth(
  request: NextRequest,
  requiredRoles?: string[]
): Promise<NextResponse | null> {
  try {
    // Récupérer la session de l'utilisateur
    const session = await getUserSession(request)
    
    // Vérifier si l'utilisateur est authentifié
    if (!session || !session.user) {
      // Rediriger vers la page de connexion avec l'URL de retour
      const loginUrl = new URL('/connexion', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Vérifier si le 2FA est requis et activé
    if (session.user.twoFactorEnabled && !session.user.twoFactorVerified) {
      // Rediriger vers la page de vérification 2FA
      const verify2FAUrl = new URL('/verify-2fa', request.url)
      verify2FAUrl.searchParams.set('userId', session.user.id)
      verify2FAUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(verify2FAUrl)
    }

    // Vérifier les rôles si spécifiés
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = session.user.role
      
      if (!requiredRoles.includes(userRole)) {
        // Rediriger vers la page d'accès non autorisé
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // L'utilisateur est autorisé
    return null
  } catch (error) {
    console.error('Erreur dans le middleware d\'authentification:', error)
    // En cas d'erreur, rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/connexion', request.url))
  }
}

/**
 * Middleware pour vérifier si l'utilisateur a un rôle spécifique
 * @param request La requête entrante
 * @param role Le rôle requis
 * @returns NextResponse ou null si l'utilisateur a le rôle requis
 */
export async function withRole(
  request: NextRequest,
  role: string
): Promise<NextResponse | null> {
  return withAuth(request, [role])
}

/**
 * Middleware pour les routes admin uniquement
 * @param request La requête entrante
 * @returns NextResponse ou null si l'utilisateur est admin
 */
export async function withAdmin(request: NextRequest): Promise<NextResponse | null> {
  return withAuth(request, ['ADMIN'])
}

/**
 * Middleware pour les routes assureur uniquement
 * @param request La requête entrante
 * @returns NextResponse ou null si l'utilisateur est assureur
 */
export async function withInsurer(request: NextRequest): Promise<NextResponse | null> {
  return withAuth(request, ['INSURER', 'ADMIN'])
}

/**
 * Middleware pour les routes utilisateur connecté
 * @param request La requête entrante
 * @returns NextResponse ou null si l'utilisateur est connecté
 */
export async function withUser(request: NextRequest): Promise<NextResponse | null> {
  return withAuth(request, ['USER', 'INSURER', 'ADMIN'])
}

/**
 * Crée un handler de route avec authentification
 * @param handler Le handler de route original
 * @param requiredRoles Rôles requis (optionnel)
 * @returns Le handler avec authentification
 */
export function createAuthHandler(
  handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse,
  requiredRoles?: string[]
) {
  return async (req: NextRequest, context: any) => {
    const authResult = await withAuth(req, requiredRoles)
    if (authResult) {
      return authResult
    }
    return handler(req, context)
  }
}

/**
 * Vérifie si l'utilisateur courant a un rôle spécifique (côté serveur)
 * @param request La requête entrante
 * @param role Le rôle à vérifier
 * @returns true si l'utilisateur a le rôle, false sinon
 */
export async function hasRole(request: NextRequest, role: string): Promise<boolean> {
  const session = await getUserSession(request)
  return session?.user?.role === role
}

/**
 * Vérifie si l'utilisateur courant est authentifié (côté serveur)
 * @param request La requête entrante
 * @returns true si l'utilisateur est authentifié, false sinon
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const session = await getUserSession(request)
  return !!session?.user
}

/**
 * Vérifie si l'utilisateur courant a le 2FA activé et vérifié (côté serveur)
 * @param request La requête entrante
 * @returns true si le 2FA est activé et vérifié, false sinon
 */
export async function is2FAVerified(request: NextRequest): Promise<boolean> {
  const session = await getUserSession(request)
  return !!(session?.user?.twoFactorEnabled && session?.user?.twoFactorVerified)
}
