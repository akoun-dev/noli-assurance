/**
 * Utilitaire de logging pour les activités d'authentification
 * Fournit des logs structurés pour le monitoring et le débogage
 */

export interface AuthLogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  event: string
  userId?: string
  userEmail?: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  success?: boolean
  errorMessage?: string
}

/**
 * Classe pour gérer les logs d'authentification
 */
export class AuthLogger {
  private static instance: AuthLogger
  private logs: AuthLogEntry[] = []
  private maxLogs: number = 1000

  private constructor() {}

  public static getInstance(): AuthLogger {
    if (!AuthLogger.instance) {
      AuthLogger.instance = new AuthLogger()
    }
    return AuthLogger.instance
  }

  /**
   * Log une tentative de connexion
   */
  public logLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string
  ): void {
    this.log({
      level: success ? 'info' : 'warn',
      event: 'login_attempt',
      userEmail: email,
      success,
      ipAddress,
      userAgent,
      errorMessage,
      details: {
        attempt_time: new Date().toISOString(),
        method: 'credentials'
      }
    })
  }

  /**
   * Log une connexion réussie
   */
  public logSuccessfulLogin(
    userId: string,
    userEmail: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string,
    twoFactorEnabled: boolean = false
  ): void {
    this.log({
      level: 'info',
      event: 'login_success',
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      success: true,
      details: {
        login_time: new Date().toISOString(),
        two_factor_enabled: twoFactorEnabled,
        session_duration: 'pending'
      }
    })
  }

  /**
   * Log une déconnexion
   */
  public logLogout(
    userId: string,
    userEmail: string,
    userRole: string,
    sessionDuration?: number
  ): void {
    this.log({
      level: 'info',
      event: 'logout',
      userId,
      userEmail,
      userRole,
      success: true,
      details: {
        logout_time: new Date().toISOString(),
        session_duration: sessionDuration
      }
    })
  }

  /**
   * Log une tentative d'inscription
   */
  public logRegistrationAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string
  ): void {
    this.log({
      level: success ? 'info' : 'warn',
      event: 'registration_attempt',
      userEmail: email,
      success,
      ipAddress,
      userAgent,
      errorMessage,
      details: {
        attempt_time: new Date().toISOString(),
        method: 'email_password'
      }
    })
  }

  /**
   * Log une inscription réussie
   */
  public logSuccessfulRegistration(
    userId: string,
    userEmail: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string
  ): void {
    this.log({
      level: 'info',
      event: 'registration_success',
      userId,
      userEmail,
      userRole,
      success: true,
      details: {
        registration_time: new Date().toISOString(),
        verification_status: 'pending'
      }
    })
  }

  /**
   * Log une activité 2FA
   */
  public log2FAActivity(
    userId: string,
    userEmail: string,
    event: '2fa_setup' | '2fa_verification' | '2fa_disable',
    success: boolean,
    errorMessage?: string
  ): void {
    this.log({
      level: success ? 'info' : 'warn',
      event,
      userId,
      userEmail,
      success,
      errorMessage,
      details: {
        activity_time: new Date().toISOString(),
        event_type: event
      }
    })
  }

  /**
   * Log une activité suspecte
   */
  public logSuspiciousActivity(
    event: string,
    userEmail?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>
  ): void {
    this.log({
      level: 'warn',
      event: `suspicious_${event}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      success: false,
      details: {
        ...details,
        severity: 'medium',
        flagged_at: new Date().toISOString()
      }
    })
  }

  /**
   * Log une erreur d'authentification
   */
  public logError(
    event: string,
    errorMessage: string,
    userId?: string,
    userEmail?: string,
    details?: Record<string, any>
  ): void {
    this.log({
      level: 'error',
      event,
      userId,
      userEmail,
      success: false,
      errorMessage,
      details: {
        ...details,
        error_time: new Date().toISOString(),
        stack_trace: new Error().stack
      }
    })
  }

  /**
   * Méthode privée pour ajouter un log
   */
  private log(entry: Omit<AuthLogEntry, 'timestamp'>): void {
    const logEntry: AuthLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    }

    // Ajouter le log au tableau
    this.logs.push(logEntry)

    // Limiter la taille du tableau
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Afficher dans la console avec formatage
    this.consoleLog(logEntry)

    // Envoyer à un service de monitoring externe si configuré
    this.sendToExternalService(logEntry)
  }

  /**
   * Affiche le log dans la console avec formatage
   */
  private consoleLog(entry: AuthLogEntry): void {
    const { timestamp, level, event, userEmail, success, errorMessage } = entry
    
    const prefix = `[${timestamp}] [AUTH] [${level.toUpperCase()}]`
    const message = `${event} - ${userEmail || 'unknown'} - ${success ? 'SUCCESS' : 'FAILED'}`
    
    const details = errorMessage ? ` - ${errorMessage}` : ''
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}${details}`, entry.details)
        break
      case 'warn':
        console.warn(`${prefix} ${message}${details}`, entry.details)
        break
      case 'debug':
        console.debug(`${prefix} ${message}${details}`, entry.details)
        break
      default:
        console.log(`${prefix} ${message}${details}`, entry.details)
    }
  }

  /**
   * Envoie le log à un service externe (optionnel)
   */
  private sendToExternalService(entry: AuthLogEntry): void {
    // Ici, vous pourriez intégrer avec des services comme:
    // - Sentry
    // - Datadog
    // - LogRocket
    // - Un service de logging personnalisé
    
    // Pour l'instant, on ne fait rien, mais la structure est prête
    if (process.env.NODE_ENV === 'production') {
      // Exemple d'envoi à un service externe
      // this.sendToSentry(entry)
      // this.sendToDatadog(entry)
    }
  }

  /**
   * Récupère tous les logs
   */
  public getLogs(): AuthLogEntry[] {
    return [...this.logs]
  }

  /**
   * Récupère les logs pour un utilisateur spécifique
   */
  public getUserLogs(userId: string): AuthLogEntry[] {
    return this.logs.filter(log => log.userId === userId)
  }

  /**
   * Récupère les logs par niveau
   */
  public getLogsByLevel(level: AuthLogEntry['level']): AuthLogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  /**
   * Récupère les logs récents (dernières 24h)
   */
  public getRecentLogs(hours: number = 24): AuthLogEntry[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.logs.filter(log => new Date(log.timestamp) > cutoff)
  }

  /**
   * Nettoie les anciens logs
   */
  public cleanup(olderThanHours: number = 168): number { // 7 jours par défaut
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    const beforeCount = this.logs.length
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoff)
    return beforeCount - this.logs.length
  }

  /**
   * Exporte les logs au format JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Génère un rapport d'activité
   */
  public generateActivityReport(hours: number = 24): {
    totalAttempts: number
    successfulLogins: number
    failedLogins: number
    registrations: number
    suspiciousActivities: number
    errors: number
    uniqueUsers: number
    timeRange: { start: string; end: string }
  } {
    const recentLogs = this.getRecentLogs(hours)
    
    return {
      totalAttempts: recentLogs.filter(log => 
        log.event.includes('login_attempt') || log.event.includes('registration_attempt')
      ).length,
      successfulLogins: recentLogs.filter(log => 
        log.event === 'login_success' && log.success
      ).length,
      failedLogins: recentLogs.filter(log => 
        (log.event === 'login_attempt' || log.event.includes('login')) && !log.success
      ).length,
      registrations: recentLogs.filter(log => 
        log.event.includes('registration') && log.success
      ).length,
      suspiciousActivities: recentLogs.filter(log => 
        log.event.includes('suspicious')
      ).length,
      errors: recentLogs.filter(log => log.level === 'error').length,
      uniqueUsers: new Set(recentLogs.map(log => log.userId).filter(Boolean)).size,
      timeRange: {
        start: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    }
  }
}

// Instance singleton pour utilisation facile
export const authLogger = AuthLogger.getInstance()

// Fonctions utilitaires pour des opérations courantes
export const logLoginAttempt = (
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
) => authLogger.logLoginAttempt(email, success, ipAddress, userAgent, errorMessage)

export const logSuccessfulLogin = (
  userId: string,
  userEmail: string,
  userRole: string,
  ipAddress?: string,
  userAgent?: string,
  twoFactorEnabled?: boolean
) => authLogger.logSuccessfulLogin(userId, userEmail, userRole, ipAddress, userAgent, twoFactorEnabled)

export const logLogout = (
  userId: string,
  userEmail: string,
  userRole: string,
  sessionDuration?: number
) => authLogger.logLogout(userId, userEmail, userRole, sessionDuration)

export const logRegistrationAttempt = (
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
) => authLogger.logRegistrationAttempt(email, success, ipAddress, userAgent, errorMessage)

export const logSuspiciousActivity = (
  event: string,
  userEmail?: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: Record<string, any>
) => authLogger.logSuspiciousActivity(event, userEmail, userId, ipAddress, userAgent, details)

export const logError = (
  event: string,
  errorMessage: string,
  userId?: string,
  userEmail?: string,
  details?: Record<string, any>
) => authLogger.logError(event, errorMessage, userId, userEmail, details)

export const logSuccessfulRegistration = (
  userId: string,
  userEmail: string,
  userRole: string,
  ipAddress?: string,
  userAgent?: string
) => authLogger.logSuccessfulRegistration(userId, userEmail, userRole, ipAddress, userAgent)
