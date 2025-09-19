/**
 * Gestion centralisée des erreurs pour les composants ASSUREUR
 */

export interface AssureurError {
  code: string
  message: string
  details?: any
  timestamp: string
  userFriendly: boolean
}

export class AssureurErrorManager {
  private static instance: AssureurErrorManager
  private errors: AssureurError[] = []

  static getInstance(): AssureurErrorManager {
    if (!AssureurErrorManager.instance) {
      AssureurErrorManager.instance = new AssureurErrorManager()
    }
    return AssureurErrorManager.instance
  }

  /**
   * Crée une erreur structurée
   */
  createError(
    code: string,
    message: string,
    details?: any,
    userFriendly: boolean = false
  ): AssureurError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      userFriendly
    }
  }

  /**
   * Gère les erreurs API
   */
  handleApiError(error: any): AssureurError {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401:
          return this.createError(
            'AUTH_UNAUTHORIZED',
            'Session expirée, veuillez vous reconnecter',
            data,
            true
          )
        case 403:
          return this.createError(
            'AUTH_FORBIDDEN',
            'Accès non autorisé à cette ressource',
            data,
            true
          )
        case 404:
          return this.createError(
            'RESOURCE_NOT_FOUND',
            'Ressource introuvable',
            data,
            true
          )
        case 422:
          return this.createError(
            'VALIDATION_ERROR',
            'Données invalides',
            data,
            true
          )
        case 429:
          return this.createError(
            'RATE_LIMIT_EXCEEDED',
            'Trop de requêtes, veuillez réessayer plus tard',
            data,
            true
          )
        case 500:
          return this.createError(
            'SERVER_ERROR',
            'Erreur interne du serveur',
            data,
            false
          )
        default:
          return this.createError(
            'API_ERROR',
            `Erreur API (${status})`,
            data,
            false
          )
      }
    } else if (error.request) {
      return this.createError(
        'NETWORK_ERROR',
        'Erreur de connexion au serveur',
        error,
        true
      )
    } else {
      return this.createError(
        'UNKNOWN_ERROR',
        error.message || 'Erreur inconnue',
        error,
        false
      )
    }
  }

  /**
   * Gère les erreurs de validation
   */
  handleValidationError(error: any): AssureurError {
    if (error.issues) {
      // Erreur Zod
      const fieldErrors = error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))

      return this.createError(
        'FORM_VALIDATION_ERROR',
        'Certains champs sont invalides',
        { fieldErrors },
        true
      )
    }

    return this.createError(
      'VALIDATION_ERROR',
      'Erreur de validation des données',
      error,
      true
    )
  }

  /**
   * Gère les erreurs de base de données
   */
  handleDatabaseError(error: any): AssureurError {
    const code = error.code || 'DB_UNKNOWN_ERROR'

    switch (code) {
      case 'PGRST116':
        return this.createError(
          'DB_NOT_FOUND',
          'Enregistrement non trouvé',
          error,
          true
        )
      case 'PGRST301':
        return this.createError(
          'DB_ROW_LEVEL_SECURITY',
          'Accès non autorisé',
          error,
          true
        )
      case '23505':
        return this.createError(
          'DB_DUPLICATE_KEY',
          'Un enregistrement avec ces informations existe déjà',
          error,
          true
        )
      case '23503':
        return this.createError(
          'DB_FOREIGN_KEY',
          'Référence invalide',
          error,
          true
        )
      default:
        return this.createError(
          'DB_ERROR',
          'Erreur de base de données',
          error,
          false
        )
    }
  }

  /**
   * Enregistre une erreur pour le débogage
   */
  logError(error: AssureurError) {
    this.errors.push(error)

    // Garder seulement les 100 dernières erreurs
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100)
    }

    // Envoyer à un service de monitoring en production
    if (process.env.NODE_ENV === 'production') {
      console.error('Assureur Error:', error)
    }
  }

  /**
   * Récupère les erreurs récentes
   */
  getRecentErrors(limit: number = 10): AssureurError[] {
    return this.errors.slice(-limit)
  }

  /**
   * Efface les erreurs enregistrées
   */
  clearErrors() {
    this.errors = []
  }
}

/**
 * Hook React pour la gestion des erreurs dans les composants ASSUREUR
 */
export function useAssureurError() {
  const errorManager = AssureurErrorManager.getInstance()

  const handleError = (error: any, onError?: (error: AssureurError) => void) => {
    let assureurError: AssureurError

    if (error.isAxios || error.response) {
      assureurError = errorManager.handleApiError(error)
    } else if (error.issues) {
      assureurError = errorManager.handleValidationError(error)
    } else if (error.code && error.code.startsWith('PGRST')) {
      assureurError = errorManager.handleDatabaseError(error)
    } else {
      assureurError = errorManager.createError(
        'UNKNOWN_ERROR',
        error.message || 'Erreur inconnue',
        error,
        false
      )
    }

    errorManager.logError(assureurError)

    if (onError) {
      onError(assureurError)
    }

    return assureurError
  }

  const getUserFriendlyMessage = (error: AssureurError) => {
    if (error.userFriendly) {
      return error.message
    }

    return 'Une erreur est survenue. Veuillez réessayer plus tard.'
  }

  const getErrorMessage = (error: any) => {
    const assureurError = handleError(error)
    return getUserFriendlyMessage(assureurError)
  }

  return {
    handleError,
    getUserFriendlyMessage,
    getErrorMessage,
    errorManager
  }
}

/**
 * Composant d'affichage d'erreur pour ASSUREUR
 */
export function AssureurErrorDisplay({ error, onRetry }: {
  error: AssureurError | string
  onRetry?: () => void
}) {
  const errorMessage = typeof error === 'string' ? error : error.message
  const isUserFriendly = typeof error === 'string' ? true : error.userFriendly

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {isUserFriendly ? 'Erreur' : 'Erreur technique'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}