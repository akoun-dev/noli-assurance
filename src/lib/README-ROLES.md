# Système de Gestion des Rôles - NOLI Assurance

Ce document explique comment implémenter et utiliser le système de gestion des rôles pour sécuriser les routes de l'application NOLI Assurance.

## 🎯 Architecture

Le système de gestion des rôles comprend trois composants principaux :

1. **Middleware de rôles** (`src/lib/middleware-roles.ts`) - Vérification côté serveur
2. **Hook React** (`src/hooks/use-role-access.ts`) - Vérification côté client
3. **Composants de protection** (`src/components/auth/RoleGuard.tsx`) - Protection des routes

## 📋 Rôles Disponibles

| Rôle | Description | Routes Accès |
|------|-------------|--------------|
| `USER` | Utilisateur standard | `/`, `/dashboard`, `/profil`, `/devis`, `/devis-recus`, `/resultats`, `/offres`, `/formulaire-*` |
| `ADMIN` | Administrateur système | `/admin`, `/utilisateurs`, `/devis-admin`, `/offres-admin`, `/logs`, `/statistiques`, `/parametres`, `/creer-assureur` |
| `ASSUREUR` | Partenaire assureur | `/assureur`, `/devis`, `/offres`, `/profil` |

## 🔐 Configuration des Routes

### Routes Publiques
Accessible sans authentification :
```typescript
export const PUBLIC_ROUTES = [
  '/',
  '/connexion',
  '/inscription',
  '/verify-2fa',
  '/api/health',
  '/api/auth',
  '/api/test-auth',
];
```

### Routes Protégées
Nécessitent une authentification :
```typescript
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
```

## 🛡️ Utilisation

### 1. Middleware de Rôles (Côté Serveur)

Le middleware est automatiquement appliqué à toutes les routes protégées :

```typescript
// src/lib/middleware-roles.ts
export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  
  // Vérification des rôles et redirections
  // ...
}
```

**Configuration :**
```typescript
// next.config.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 2. Hook React (Côté Client)

Utilisez le hook `useRoleAccess` pour vérifier les rôles dans les composants :

```typescript
import { useRoleAccess } from '@/hooks/use-role-access';

function MyComponent() {
  const { hasAccess, userRole, isLoading } = useRoleAccess();
  
  if (isLoading) {
    return <div>Chargement...</div>;
  }
  
  if (!hasAccess) {
    return <div>Accès refusé</div>;
  }
  
  return <div>Bienvenue, {userRole}</div>;
}
```

### 3. Composants de Protection

Utilisez les composants `RoleGuard` et `RolesGuard` pour protéger les routes :

#### RoleGuard (pour un rôle spécifique)

```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';

function AdminPage() {
  return (
    <RoleGuard requiredRole="ADMIN">
      <div>Contenu administrateur</div>
    </RoleGuard>
  );
}
```

#### RolesGuard (pour plusieurs rôles)

```typescript
import { RolesGuard } from '@/components/auth/RoleGuard';

function ManagementPage() {
  return (
    <RolesGuard allowedRoles={['ADMIN', 'ASSUREUR']}>
      <div>Contenu de gestion</div>
    </RolesGuard>
  );
}
```

## 📝 Exemples d'Utilisation

### Exemple 1: Page Admin Protégée

```typescript
// src/app/admin/page.tsx
'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="ADMIN">
      <div>
        <h1>Tableau de bord Administrateur</h1>
        {/* Contenu admin */}
      </div>
    </RoleGuard>
  );
}
```

### Exemple 2: Vérification dans un Composant

```typescript
// src/components/Dashboard.tsx
import { useRoleAccess } from '@/hooks/use-role-access';

export function Dashboard() {
  const { userRole, hasAccess } = useRoleAccess();
  
  if (!hasAccess) {
    return <div>Redirection vers la connexion...</div>;
  }
  
  return (
    <div>
      <h1>Tableau de bord</h1>
      <p>Rôle actuel : {userRole}</p>
    </div>
  );
}
```

### Exemple 3: Navigation Conditionnelle

```typescript
// src/components/Navigation.tsx
import { useRoleAccess } from '@/hooks/use-role-access';
import Link from 'next/link';

export function Navigation() {
  const { userRole } = useRoleAccess();
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {userRole === 'ADMIN' && (
        <Link href="/admin">Administration</Link>
      )}
      
      {userRole === 'ASSUREUR' && (
        <Link href="/assureur">Espace Assureur</Link>
      )}
      
      <Link href="/profil">Profil</Link>
    </nav>
  );
}
```

## 🔧 Fonctions Utilitaires

### Vérification d'accès à une route spécifique

```typescript
import { canAccessRoute } from '@/hooks/use-role-access';

function canUserAccess(pathname: string, userRole: string) {
  return canAccessRoute(pathname, userRole);
}
```

### URL de redirection par défaut

```typescript
import { getDefaultRedirectUrl } from '@/hooks/use-role-access';

function getRedirectUrl(userRole: string) {
  return getDefaultRedirectUrl(userRole);
}
```

## 🚨 Bonnes Pratiques

1. **Utilisez toujours le middleware** pour la protection côté serveur
2. **Combinez avec les composants** pour une expérience utilisateur fluide
3. **Vérifiez les rôles** avant d'afficher des éléments sensibles
4. **Gérez le chargement** avec l'état `isLoading`
5. **Redirigez vers des pages appropriées** en cas d'accès refusé

## 📊 Sécurité

- ✅ Protection côté serveur (middleware)
- ✅ Protection côté client (composants)
- ✅ Gestion automatique de la 2FA
- ✅ Redirections appropriées
- ✅ Gestion des erreurs

## 🔄 Mise à Jour des Rôles

Pour ajouter un nouveau rôle :

1. Mettre à jour le type `UserRole`
2. Ajouter les routes dans `ROLE_ROUTES`
3. Mettre à jour les configurations si nécessaire
4. Tester avec les composants existants

## 📚 Documentation Complémentaire

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Middleware](https://nextjs.org/docs/middleware)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
