import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Si l'utilisateur est connecté et essaie d'accéder aux pages d'authentification
    if (token && (pathname === '/connexion' || pathname === '/inscription')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Vérifier les accès selon les rôles
    if (token) {
      const userRole = token.role as string
      
      // Pages administrateur - uniquement accessible par les admins
      if (pathname.startsWith('/admin') || pathname === '/utilisateurs' || pathname === '/assureurs' || pathname === '/offres-admin' || pathname === '/devis-admin' || pathname === '/logs') {
        if (userRole !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
      
      // Pages assureur - accessible par les assureurs et les admins
      if (pathname.startsWith('/assureur') || pathname === '/offres' || pathname === '/devis-recus' || pathname === '/statistiques') {
        if (userRole !== 'INSURER' && userRole !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
      
      // Pages utilisateur - accessibles par tous les utilisateurs connectés
      if (pathname === '/comparateur' || pathname === '/devis' || pathname === '/profil') {
        // Tous les rôles peuvent accéder à ces pages
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Pages publiques (accessibles sans authentification)
        const publicPaths = ['/', '/connexion', '/inscription', '/api/auth', '/resultats', '/formulaire-assure', '/formulaire-vehicule', '/formulaire-options']
        
        // Vérifier si le chemin actuel est public
        const isPublicPath = publicPaths.some(path => 
          pathname === path || pathname.startsWith(path)
        )
        
        // Si c'est une page publique, autoriser l'accès
        if (isPublicPath) {
          return true
        }
        
        // Le dashboard et ses sous-pages nécessitent une authentification
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Pages protégées qui nécessitent une authentification
        const protectedPaths = [
          '/comparateur', '/devis', '/profil', '/parametres',
          '/offres', '/devis-recus', '/statistiques',
          '/utilisateurs', '/assureurs', '/offres-admin', '/devis-admin', '/logs',
          '/admin', '/assureur'
        ]
        
        const isProtectedPath = protectedPaths.some(path => 
          pathname === path || pathname.startsWith(path)
        )
        
        if (isProtectedPath) {
          return !!token
        }
        
        // Pour les autres pages, autoriser l'accès
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}