import supabaseAdmin from '@/lib/supabase-admin'

/**
 * Types d'événements pour les opérations ASSUREUR
 */
export enum AssureurEventType {
  // Authentification
  LOGIN_SUCCESS = 'ASSUREUR_LOGIN_SUCCESS',
  LOGIN_FAILED = 'ASSUREUR_LOGIN_FAILED',
  LOGOUT = 'ASSUREUR_LOGOUT',

  // Offres
  OFFER_CREATED = 'ASSUREUR_OFFER_CREATED',
  OFFER_UPDATED = 'ASSUREUR_OFFER_UPDATED',
  OFFER_DELETED = 'ASSUREUR_OFFER_DELETED',
  OFFER_VIEWED = 'ASSUREUR_OFFER_VIEWED',

  // Devis
  QUOTE_VIEWED = 'ASSUREUR_QUOTE_VIEWED',
  QUOTE_STATUS_UPDATED = 'ASSUREUR_QUOTE_STATUS_UPDATED',
  QUOTE_EXPORTED = 'ASSUREUR_QUOTE_EXPORTED',

  // Profil
  PROFILE_UPDATED = 'ASSUREUR_PROFILE_UPDATED',
  PROFILE_VIEWED = 'ASSUREUR_PROFILE_VIEWED',

  // Statistiques
  STATS_VIEWED = 'ASSUREUR_STATS_VIEWED',
  REPORT_GENERATED = 'ASSUREUR_REPORT_GENERATED',

  // Sécurité
  ACCESS_DENIED = 'ASSUREUR_ACCESS_DENIED',
  SUSPICIOUS_ACTIVITY = 'ASSUREUR_SUSPICIOUS_ACTIVITY',

  // Performances
  API_CALL_SUCCESS = 'ASSUREUR_API_SUCCESS',
  API_CALL_ERROR = 'ASSUREUR_API_ERROR',
  PAGE_LOAD = 'ASSUREUR_PAGE_LOAD'
}

/**
 * Niveaux de log
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Structure d'un événement log
 */
export interface AssureurLogEvent {
  id?: string
  userId: string
  insurerId: string
  eventType: AssureurEventType
  level: LogLevel
  message: string
  details?: any
  metadata?: {
    userAgent?: string
    ipAddress?: string
    referer?: string
    timestamp?: string
  }
  success: boolean
  duration?: number
}

/**
 * Service de logging pour les opérations ASSUREUR
 */
export class AssureurLogger {
  private static instance: AssureurLogger
  private isProduction = process.env.NODE_ENV === 'production'

  static getInstance(): AssureurLogger {
    if (!AssureurLogger.instance) {
      AssureurLogger.instance = new AssureurLogger()
    }
    return AssureurLogger.instance
  }

  /**
   * Crée un événement de log
   */
  async log(event: Omit<AssureurLogEvent, 'id'>): Promise<void> {
    try {
      const logEvent: AssureurLogEvent = {
        ...event,
        metadata: {
          timestamp: new Date().toISOString(),
          ...event.metadata
        }
      }

      // Toujours logger en console pour le développement
      if (!this.isProduction) {
        console.log(`[ASSUREUR LOG] ${event.level}:`, {
          eventType: event.eventType,
          message: event.message,
          userId: event.userId,
          insurerId: event.insurerId,
          success: event.success,
          duration: event.duration,
          details: event.details
        })
      }

      // Logger en base de données
      if (this.isProduction || event.level === LogLevel.ERROR) {
        const { error } = await supabaseAdmin
          .from('UserAnalytics')
          .insert([{
            userId: event.userId,
            eventType: event.eventType,
            eventData: {
              level: event.level,
              message: event.message,
              details: event.details,
              insurerId: event.insurerId,
              success: event.success,
              duration: event.duration,
              metadata: logEvent.metadata
            },
            ipAddress: event.metadata?.ipAddress,
            userAgent: event.metadata?.userAgent
          }])

        if (error) {
          console.error('Erreur lors de l\'enregistrement du log ASSUREUR:', error)
        }
      }

      // Envoyer les erreurs critiques à un service externe en production
      if (this.isProduction && event.level === LogLevel.ERROR) {
        await this.sendAlert(logEvent)
      }

    } catch (error) {
      console.error('Erreur critique dans le logger ASSUREUR:', error)
    }
  }

  /**
   * Loggue les événements d'authentification
   */
  async logAuthEvent(
    userId: string,
    insurerId: string,
    eventType: AssureurEventType.LOGIN_SUCCESS | AssureurEventType.LOGIN_FAILED | AssureurEventType.LOGOUT,
    success: boolean,
    details?: any,
    metadata?: any
  ): Promise<void> {
    await this.log({
      userId,
      insurerId,
      eventType,
      level: success ? LogLevel.INFO : LogLevel.WARN,
      message: success ? 'Authentification réussie' : 'Échec d\'authentification',
      details,
      metadata,
      success
    })
  }

  /**
   * Loggue les événements liés aux offres
   */
  async logOfferEvent(
    userId: string,
    insurerId: string,
    eventType: AssureurEventType,
    offerId?: string,
    success: boolean = true,
    details?: any,
    duration?: number
  ): Promise<void> {
    await this.log({
      userId,
      insurerId,
      eventType,
      level: success ? LogLevel.INFO : LogLevel.ERROR,
      message: this.getEventMessage(eventType, success),
      details: { ...details, offerId },
      success,
      duration
    })
  }

  /**
   * Loggue les événements liés aux devis
   */
  async logQuoteEvent(
    userId: string,
    insurerId: string,
    eventType: AssureurEventType,
    quoteId?: string,
    success: boolean = true,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      insurerId,
      eventType,
      level: success ? LogLevel.INFO : LogLevel.ERROR,
      message: this.getEventMessage(eventType, success),
      details: { ...details, quoteId },
      success
    })
  }

  /**
   * Loggue les événements de sécurité
   */
  async logSecurityEvent(
    userId: string,
    insurerId: string,
    eventType: AssureurEventType.ACCESS_DENIED | AssureurEventType.SUSPICIOUS_ACTIVITY,
    details: any,
    metadata?: any
  ): Promise<void> {
    await this.log({
      userId,
      insurerId,
      eventType,
      level: LogLevel.ERROR,
      message: this.getEventMessage(eventType, false),
      details,
      metadata,
      success: false
    })
  }

  /**
   * Loggue les événements API
   */
  async logApiEvent(
    userId: string,
    insurerId: string,
    endpoint: string,
    method: string,
    success: boolean,
    duration?: number,
    details?: any
  ): Promise<void> {
    const eventType = success ? AssureurEventType.API_CALL_SUCCESS : AssureurEventType.API_CALL_ERROR

    await this.log({
      userId,
      insurerId,
      eventType,
      level: success ? LogLevel.DEBUG : LogLevel.ERROR,
      message: success ? `API ${method} ${endpoint} - Succès` : `API ${method} ${endpoint} - Erreur`,
      details: { endpoint, method, ...details },
      success,
      duration
    })
  }

  /**
   * Loggue les événements de profil
   */
  async logProfileEvent(
    userId: string,
    insurerId: string,
    eventType: AssureurEventType,
    success: boolean = true,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      insurerId,
      eventType,
      level: success ? LogLevel.INFO : LogLevel.ERROR,
      message: this.getEventMessage(eventType, success),
      details,
      success
    })
  }

  /**
   * Génère un message d'événement
   */
  private getEventMessage(eventType: AssureurEventType, success: boolean): string {
    const messages: Record<AssureurEventType, string> = {
      [AssureurEventType.LOGIN_SUCCESS]: 'Connexion réussie',
      [AssureurEventType.LOGIN_FAILED]: 'Échec de connexion',
      [AssureurEventType.LOGOUT]: 'Déconnexion',
      [AssureurEventType.OFFER_CREATED]: 'Création d\'offre',
      [AssureurEventType.OFFER_UPDATED]: 'Mise à jour d\'offre',
      [AssureurEventType.OFFER_DELETED]: 'Suppression d\'offre',
      [AssureurEventType.OFFER_VIEWED]: 'Consultation d\'offre',
      [AssureurEventType.QUOTE_VIEWED]: 'Consultation de devis',
      [AssureurEventType.QUOTE_STATUS_UPDATED]: 'Mise à jour du statut de devis',
      [AssureurEventType.QUOTE_EXPORTED]: 'Export de devis',
      [AssureurEventType.PROFILE_UPDATED]: 'Mise à jour du profil',
      [AssureurEventType.PROFILE_VIEWED]: 'Consultation du profil',
      [AssureurEventType.STATS_VIEWED]: 'Consultation des statistiques',
      [AssureurEventType.REPORT_GENERATED]: 'Génération de rapport',
      [AssureurEventType.ACCESS_DENIED]: 'Accès refusé',
      [AssureurEventType.SUSPICIOUS_ACTIVITY]: 'Activité suspecte',
      [AssureurEventType.API_CALL_SUCCESS]: 'API réussie',
      [AssureurEventType.API_CALL_ERROR]: 'API en erreur',
      [AssureurEventType.PAGE_LOAD]: 'Chargement de page'
    }

    const baseMessage = messages[eventType] || 'Événement inconnu'
    return success ? baseMessage : `${baseMessage} - Échec`
  }

  /**
   * Envoie une alerte pour les événements critiques
   */
  private async sendAlert(event: AssureurLogEvent): Promise<void> {
    // En production, intégrer avec un service comme Sentry, Slack, etc.
    if (process.env.SENTRY_DSN) {
      // Intégration Sentry ici
      console.warn('Alerte critique:', event)
    }
  }
}

/**
 * Hook React pour le logging dans les composants ASSUREUR
 */
export function useAssureurLogger() {
  const logger = AssureurLogger.getInstance()

  const logPageLoad = async (userId: string, insurerId: string, page: string, duration?: number) => {
    await logger.log({
      userId,
      insurerId,
      eventType: AssureurEventType.PAGE_LOAD,
      level: LogLevel.INFO,
      message: `Chargement de la page ${page}`,
      details: { page },
      success: true,
      duration
    })
  }

  const logUserAction = async (userId: string, insurerId: string, action: string, details?: any) => {
    await logger.log({
      userId,
      insurerId,
      eventType: AssureurEventType.STATS_VIEWED, // Generic pour les actions utilisateur
      level: LogLevel.INFO,
      message: `Action utilisateur: ${action}`,
      details,
      success: true
    })
  }

  return {
    logger,
    logPageLoad,
    logUserAction
  }
}

// Export de l'instance singleton
export const assureurLogger = AssureurLogger.getInstance()