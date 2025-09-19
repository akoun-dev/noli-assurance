import { NextRequest } from 'next/server'
import { auditService } from './audit-service'

export interface LogActivityParams {
  userId: string
  userEmail: string
  action: string
  actionType: string
  description: string
  request: NextRequest
}

export async function logActivity({
  userId,
  userEmail,
  action,
  actionType,
  description,
  request
}: LogActivityParams): Promise<void> {
  try {
    // Log l'activité dans la console pour le développement
    console.log(`[ACTIVITY LOG]`, {
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      action,
      actionType,
      description,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Log dans la base de données avec le nouveau système d'audit
    await auditService.logAdminAction({
      userId,
      userEmail,
      userRole: 'USER', // Par défaut, peut être surchargé si nécessaire
      action,
      description,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: {
        actionType,
        source: 'auth-logger'
      }
    })

  } catch (error) {
    console.error('Error logging activity:', error)
    // Ne pas lever d'erreur pour ne pas bloquer le flux principal
  }
}

export interface AdminActionLogParams {
  userId: string
  userEmail?: string
  action: string
  target?: string
  success?: boolean
  errorMessage?: string
  details?: Record<string, any>
  request?: NextRequest
}

export async function logAdminAction({
  userId,
  userEmail,
  action,
  target,
  success = true,
  errorMessage,
  details,
  request
}: AdminActionLogParams): Promise<void> {
  try {
    console.log(`[ADMIN ACTION]`, {
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      action,
      target,
      success,
      errorMessage,
      details,
      ip: request?.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown'
    })

    // Log dans la base de données avec le nouveau système d'audit
    await auditService.logAdminAction({
      userId,
      userEmail,
      userRole: 'ADMIN',
      action,
      entityType: target,
      description: `${action}${target ? ` on ${target}` : ''}`,
      status: success ? 'success' : 'error',
      errorMessage,
      metadata: details,
      ipAddress: request?.headers.get('x-forwarded-for') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined
    })
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}

// Add missing functions for authentication logging
export async function logRegistrationAttempt(email: string, request: NextRequest): Promise<void> {
  try {
    console.log(`[REGISTRATION ATTEMPT]`, {
      timestamp: new Date().toISOString(),
      email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Log dans la base de données
    await auditService.logAdminAction({
      action: 'REGISTRATION_ATTEMPT',
      description: `Registration attempt for email: ${email}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
      metadata: { email }
    })
  } catch (error) {
    console.error('Error logging registration attempt:', error)
  }
}

export async function logSuccessfulRegistration(userId: string, email: string, request: NextRequest): Promise<void> {
  try {
    console.log(`[REGISTRATION SUCCESS]`, {
      timestamp: new Date().toISOString(),
      userId,
      email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Log dans la base de données
    await auditService.logUserCreation(userId, email, 'USER', undefined, { email })
  } catch (error) {
    console.error('Error logging successful registration:', error)
  }
}

export async function logSuspiciousActivity(email: string, action: string, request: NextRequest): Promise<void> {
  try {
    console.log(`[SUSPICIOUS ACTIVITY]`, {
      timestamp: new Date().toISOString(),
      email,
      action,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Log dans la base de données comme événement de sécurité
    await auditService.logSecurityEvent(
      'SUSPICIOUS_ACTIVITY',
      `Suspicious activity detected: ${action}`,
      email,
      undefined,
      {
        email,
        action,
        ip: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      }
    )
  } catch (error) {
    console.error('Error logging suspicious activity:', error)
  }
}

export async function logLoginAttempt(email: string, success: boolean, request: NextRequest): Promise<void> {
  try {
    console.log(`[LOGIN ATTEMPT]`, {
      timestamp: new Date().toISOString(),
      email,
      success,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Log dans la base de données
    await auditService.logAdminAction({
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      description: success ? `Successful login for ${email}` : `Failed login attempt for ${email}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      status: success ? 'success' : 'error',
      metadata: { email, success }
    })
  } catch (error) {
    console.error('Error logging login attempt:', error)
  }
}
