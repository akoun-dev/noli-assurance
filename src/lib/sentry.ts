import * as Sentry from '@sentry/nextjs'

// Initialisation de Sentry pour le monitoring des erreurs et des performances
Sentry.init({
  dsn: process.env.SENTRY_DSN || '', // Sera configuré via les variables d'environnement
  environment: process.env.NODE_ENV || 'development',
  
  // Définir le taux d'échantillonnage des erreurs
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuration simple sans Replay pour éviter les erreurs de compatibilité
  // Le Replay peut être activé plus tard si nécessaire
  
  // Configuration des filtres pour ignorer certaines erreurs
  beforeSend(event) {
    // Ignorer les erreurs de développement en production
    if (process.env.NODE_ENV === 'production' && event.request?.url?.includes('localhost')) {
      return null
    }
    
    // Ignorer les erreurs de console
    if (event.request?.url?.includes('console')) {
      return null
    }
    
    return event
  },
})

// Fonction utilitaire pour capturer les erreurs manuellement
export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      page: typeof window !== 'undefined' ? window.location.pathname : 'server',
    },
  })
}

// Fonction utilitaire pour capturer les messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level)
}

// Fonction utilitaire pour définir le contexte utilisateur
export const setUserContext = (user: any) => {
  Sentry.withScope((scope) => {
    scope.setUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  })
}

// Fonction utilitaire pour effacer le contexte utilisateur
export const clearUserContext = () => {
  Sentry.withScope((scope) => {
    scope.setUser(null)
  })
}

// Fonction utilitaire pour ajouter des tags
export const addTags = (tags: Record<string, string>) => {
  Sentry.withScope((scope) => {
    scope.setTags(tags)
  })
}

// Fonction utilitaire pour ajouter des extra context
export const addExtraContext = (context: Record<string, any>) => {
  Sentry.withScope((scope) => {
    scope.setExtras(context)
  })
}

export default Sentry
