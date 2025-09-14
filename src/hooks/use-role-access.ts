'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Types pour les rôles
export type UserRole = 'USER' | 'ADMIN' | 'ASSUREUR';

// Configuration des rôles et des routes autorisées
export const ROLE_ROUTES = {
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
export const PUBLIC_ROUTES = [
  '/',
  '/connexion',
  '/inscription',
  '/verify-2fa',
  '/api/health',
  '/api/auth',
  '/api/test-auth',
];

// Routes protégées (nécessitent une authentification)
export const PROTECTED_ROUTES = [
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

export function useRoleAccess() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      return; // Ne rien faire pendant le chargement
    }

    const pathname = window.location.pathname;
    
    // Vérifier si la route est publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname.startsWith(route) || pathname === route
    );

    // Routes publiques - autoriser l'accès
    if (isPublicRoute) {
      setHasAccess(true);
      return;
    }

    // Vérifier si la route est protégée
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route) || pathname === route
    );

    if (!isProtectedRoute) {
      setHasAccess(true);
      return;
    }

    // Routes protégées - vérifier l'authentification et les rôles
    if (status === 'unauthenticated') {
      setHasAccess(false);
      // Rediriger vers la page de connexion
      const loginUrl = new URL('/connexion', window.location.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      router.push(loginUrl.toString());
      return;
    }

    if (session?.user?.role) {
      const role = session.user.role as UserRole;
      setUserRole(role);
      
      // Vérifier si l'utilisateur a le rôle approprié pour la route
      const access = ROLE_ROUTES[role]?.some(route => 
        pathname.startsWith(route) || pathname === route
      );

      if (!access) {
        // Rediriger vers le tableau de bord approprié
        let redirectUrl = '/dashboard';
        
        if (role === 'ADMIN') {
          redirectUrl = '/admin';
        } else if (role === 'ASSUREUR') {
          redirectUrl = '/assureur';
        }
        
        router.push(redirectUrl);
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    } else {
      setHasAccess(false);
    }
  }, [session, status, router]);

  // Vérifier la 2FA
  useEffect(() => {
    if (status === 'loading' || !session) {
      return;
    }

    const pathname = window.location.pathname;
    
    // Vérifier si la 2FA est requise mais non vérifiée
    if (session.user.twoFactorEnabled && 
        !session.user.twoFactorVerified && 
        pathname !== '/verify-2fa') {
      router.push('/verify-2fa');
    }
  }, [session, status, router]);

  return {
    hasAccess,
    userRole,
    isLoading: status === 'loading',
    session,
  };
}

// Hook pour vérifier si l'utilisateur a un rôle spécifique
export function useRole(role: UserRole) {
  const { userRole } = useRoleAccess();
  
  return {
    hasRole: userRole === role,
    userRole,
  };
}

// Hook pour vérifier si l'est administrateur
export function useAdmin() {
  return useRole('ADMIN');
}

// Hook pour vérifier si l'utilisateur est un assureur
export function useAssureur() {
  return useRole('ASSUREUR');
}

// Hook pour vérifier si l'utilisateur est un utilisateur standard
export function useUser() {
  return useRole('USER');
}

// Fonction utilitaire pour vérifier l'accès à une route
export function canAccessRoute(pathname: string, userRole: UserRole | null): boolean {
  if (!userRole) return false;
  
  return ROLE_ROUTES[userRole]?.some(route => 
    pathname.startsWith(route) || pathname === route
  ) || false;
}

// Fonction utilitaire pour obtenir l'URL de redirection par défaut
export function getDefaultRedirectUrl(userRole: UserRole): string {
  switch (userRole) {
    case 'ADMIN':
      return '/admin';
    case 'ASSUREUR':
      return '/assureur';
    case 'USER':
    default:
      return '/dashboard';
  }
}
