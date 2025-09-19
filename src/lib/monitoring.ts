import { createClient } from '@supabase/supabase-js'

/**
 * Système de monitoring pour les performances et la sécurité
 */

interface SecurityEvent {
  eventType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  ipAddress: string
  userAgent: string
  userId?: string
  route: string
  timestamp: string
  metadata?: Record<string, any>
}

interface PerformanceMetric {
  route: string
  method: string
  responseTime: number
  statusCode: number
  timestamp: string
  userId?: string
  cacheHit: boolean
}

interface AuthenticationEvent {
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'SESSION_EXPIRED'
  userId?: string
  email?: string
  role?: string
  ipAddress: string
  userAgent: string
  success: boolean
  timestamp: string
  failureReason?: string
  twoFactorEnabled?: boolean
}

/**
 * Classe de monitoring pour la sécurité et les performances
 */
export class MonitoringService {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }

  /**
   * Enregistre un événement de sécurité
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    try {
      const fullEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString()
      }

      // Enregistrer dans la table security_events si elle existe
      await this.supabase
        .from('security_events')
        .insert({
          event_type: fullEvent.eventType,
          severity: fullEvent.severity,
          description: fullEvent.description,
          ip_address: fullEvent.ipAddress,
          user_agent: fullEvent.userAgent,
          user_id: fullEvent.userId,
          route: fullEvent.route,
          metadata: fullEvent.metadata,
          created_at: fullEvent.timestamp
        })
        .catch(() => {
          // Ignorer si la table n'existe pas
          console.warn('Table security_events non disponible')
        })

      // Logger dans la console pour le développement
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SECURITY] ${fullEvent.severity}: ${fullEvent.description}`, fullEvent)
      }

      // Envoyer une alerte pour les événements critiques
      if (fullEvent.severity === 'HIGH' || fullEvent.severity === 'CRITICAL') {
        await this.sendSecurityAlert(fullEvent)
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement de sécurité:', error)
    }
  }

  /**
   * Enregistre une métrique de performance
   */
  async logPerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp'>): Promise<void> {
    try {
      const fullMetric: PerformanceMetric = {
        ...metric,
        timestamp: new Date().toISOString()
      }

      // Enregistrer dans la table performance_metrics si elle existe
      await this.supabase
        .from('performance_metrics')
        .insert({
          route: fullMetric.route,
          method: fullMetric.method,
          response_time: fullMetric.responseTime,
          status_code: fullMetric.statusCode,
          timestamp: fullMetric.timestamp,
          user_id: fullMetric.userId,
          cache_hit: fullMetric.cacheHit
        })
        .catch(() => {
          // Ignorer si la table n'existe pas
          console.warn('Table performance_metrics non disponible')
        })

      // Logger les requêtes lentes (> 1000ms)
      if (fullMetric.responseTime > 1000) {
        console.warn(`[PERFORMANCE] Requête lente: ${fullMetric.method} ${fullMetric.route} - ${fullMetric.responseTime}ms`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la métrique de performance:', error)
    }
  }

  /**
   * Enregistre un événement d'authentification
   */
  async logAuthenticationEvent(event: Omit<AuthenticationEvent, 'timestamp'>): Promise<void> {
    try {
      const fullEvent: AuthenticationEvent = {
        ...event,
        timestamp: new Date().toISOString()
      }

      // Enregistrer dans la table authentication_events si elle existe
      await this.supabase
        .from('authentication_events')
        .insert({
          event_type: fullEvent.eventType,
          user_id: fullEvent.userId,
          email: fullEvent.email,
          role: fullEvent.role,
          ip_address: fullEvent.ipAddress,
          user_agent: fullEvent.userAgent,
          success: fullEvent.success,
          timestamp: fullEvent.timestamp,
          failure_reason: fullEvent.failureReason,
          two_factor_enabled: fullEvent.twoFactorEnabled
        })
        .catch(() => {
          // Ignorer si la table n'existe pas
          console.warn('Table authentication_events non disponible')
        })

      // Logger dans la console
      console.log(`[AUTH] ${fullEvent.eventType}: ${fullEvent.email || 'Unknown'} - ${fullEvent.success ? 'SUCCESS' : 'FAILURE'}`)

      // Détecter les comportements suspects
      await this.detectSuspiciousBehavior(fullEvent)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement d\'authentification:', error)
    }
  }

  /**
   * Envoie une alerte de sécurité
   */
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // Ici, vous pourriez intégrer avec un service d'alerte comme Sentry, Slack, Email, etc.
      console.error(`[SECURITY ALERT] ${event.severity}: ${event.description}`, {
        ipAddress: event.ipAddress,
        route: event.route,
        timestamp: event.timestamp
      })

      // Exemple d'envoi via webhook (à configurer)
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Security Alert: ${event.severity} - ${event.description}`,
            attachments: [{
              color: event.severity === 'CRITICAL' ? 'danger' : 'warning',
              fields: [
                { title: 'Severity', value: event.severity, short: true },
                { title: 'IP Address', value: event.ipAddress, short: true },
                { title: 'Route', value: event.route, short: true },
                { title: 'Timestamp', value: event.timestamp, short: false }
              ]
            }]
          })
        })
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte de sécurité:', error)
    }
  }

  /**
   * Détecte les comportements suspects
   */
  private async detectSuspiciousBehavior(event: AuthenticationEvent): Promise<void> {
    try {
      // Détecter les échecs de connexion multiples depuis la même IP
      if (event.eventType === 'LOGIN_FAILURE') {
        const { data: recentFailures } = await this.supabase
          .from('authentication_events')
          .select('*')
          .eq('event_type', 'LOGIN_FAILURE')
          .eq('ip_address', event.ipAddress)
          .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // 15 minutes

        if (recentFailures && recentFailures.length >= 5) {
          await this.logSecurityEvent({
            eventType: 'SUSPICIOUS_LOGIN_ATTEMPTS',
            severity: 'HIGH',
            description: `Plusieurs échecs de connexion depuis l'IP ${event.ipAddress}`,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            route: '/api/auth/login',
            metadata: {
              failureCount: recentFailures.length,
              timeWindow: '15 minutes'
            }
          })
        }
      }

      // Détecter les connexions depuis des géolocalisations inhabituelles
      if (event.eventType === 'LOGIN_SUCCESS' && event.userId) {
        const { data: previousLogins } = await this.supabase
          .from('authentication_events')
          .select('ip_address, timestamp')
          .eq('event_type', 'LOGIN_SUCCESS')
          .eq('user_id', event.userId)
          .order('timestamp', { ascending: false })
          .limit(1)

        if (previousLogins && previousLogins.length > 0) {
          const lastLogin = previousLogins[0]
          if (lastLogin.ip_address !== event.ipAddress) {
            await this.logSecurityEvent({
              eventType: 'UNUSUAL_LOGIN_LOCATION',
              severity: 'MEDIUM',
              description: `Connexion depuis une nouvelle IP pour l'utilisateur ${event.email}`,
              ipAddress: event.ipAddress,
              userAgent: event.userAgent,
              route: '/api/auth/login',
              userId: event.userId,
              metadata: {
                previousIP: lastLogin.ip_address,
                lastLoginTime: lastLogin.timestamp
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la détection de comportements suspects:', error)
    }
  }

  /**
   * Récupère les statistiques de sécurité
   */
  async getSecurityStats(): Promise<any> {
    try {
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const [events24h, events7d, authEvents] = await Promise.all([
        this.supabase
          .from('security_events')
          .select('*')
          .gte('created_at', last24h.toISOString()),
        this.supabase
          .from('security_events')
          .select('*')
          .gte('created_at', last7d.toISOString()),
        this.supabase
          .from('authentication_events')
          .select('*')
          .gte('timestamp', last24h.toISOString())
      ])

      return {
        securityEvents24h: events24h?.length || 0,
        securityEvents7d: events7d?.length || 0,
        authEvents24h: authEvents?.length || 0,
        criticalEvents: events24h?.filter((e: any) => e.severity === 'CRITICAL').length || 0,
        failedLogins: authEvents?.filter((e: any) => e.event_type === 'LOGIN_FAILURE').length || 0,
        successfulLogins: authEvents?.filter((e: any) => e.event_type === 'LOGIN_SUCCESS').length || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de sécurité:', error)
      return {}
    }
  }
}

// Instance singleton
export const monitoringService = new MonitoringService()

// Fonctions utilitaires pour un accès facile
export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) =>
  monitoringService.logSecurityEvent(event)

export const logPerformanceMetric = (metric: Omit<PerformanceMetric, 'timestamp'>) =>
  monitoringService.logPerformanceMetric(metric)

export const logAuthenticationEvent = (event: Omit<AuthenticationEvent, 'timestamp'>) =>
  monitoringService.logAuthenticationEvent(event)

export const getSecurityStats = () =>
  monitoringService.getSecurityStats()