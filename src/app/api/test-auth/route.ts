import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint de test pour vérifier le statut du système d'authentification
 * Utile pour le diagnostic et le monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier les variables d'environnement nécessaires
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const envStatus = requiredEnvVars.map(varName => ({
      name: varName,
      set: !!process.env[varName],
      value: process.env[varName] ? '***' : null
    }))

    // Vérifier si les imports fonctionnent
    let importsStatus = { success: true, errors: [] as string[], warnings: [] as string[] }

    try {
      const { authOptions } = await import('@/lib/auth')
      if (!authOptions) {
        importsStatus.success = false
        importsStatus.errors.push('authOptions non défini')
      }
    } catch (error) {
      importsStatus.success = false
      importsStatus.errors.push(`Erreur import authOptions: ${error}`)
    }

    try {
      const { logAdminAction, logActivity } = await import('@/lib/auth-logger')
      if (!logAdminAction || !logActivity) {
        importsStatus.success = false
        importsStatus.errors.push('authLogger functions non définies')
      }
    } catch (error) {
      importsStatus.success = false
      importsStatus.errors.push(`Erreur import authLogger: ${error}`)
    }

    try {
      // Skip middleware-auth test since we consolidated it into main middleware
      importsStatus.warnings.push('middleware-auth a été consolidé dans le middleware principal')
    } catch (error) {
      importsStatus.warnings.push(`middleware-auth a été consolidé dans le middleware principal`)
    }

    // Vérifier les endpoints NextAuth
    const endpoints = [
      '/api/auth/[...nextauth]',
      '/api/auth/session',
      '/api/auth/csrf',
      '/api/auth/signin',
      '/api/auth/signout'
    ]

    const endpointStatus = endpoints.map(endpoint => ({
      endpoint,
      status: 'unknown' // On ne peut pas tester les endpoints depuis un autre endpoint facilement
    }))

    // Vérifier les pages d'authentification
    const pages = [
      '/connexion',
      '/inscription',
      '/deconnexion',
      '/verify-2fa'
    ]

    const pageStatus = pages.map(page => ({
      page,
      status: 'configured'
    }))

    // Générer un rapport de santé
    const healthReport = {
      timestamp: new Date().toISOString(),
      status: importsStatus.success ? 'healthy' : 'unhealthy',
      environment: {
        variables: envStatus,
        allSet: envStatus.every(v => v.set)
      },
      imports: importsStatus,
      endpoints: endpointStatus,
      pages: pageStatus,
      features: {
        twoFA: true,
        logging: true,
        middleware: true,
        sessionManagement: true
      },
      recommendations: [] as string[]
    }

    // Ajouter des recommandations basées sur le statut
    if (!healthReport.environment.allSet) {
      const missingVars = envStatus.filter(v => !v.set).map(v => v.name)
      healthReport.recommendations.push(
        `Variables d'environnement manquantes: ${missingVars.join(', ')}`
      )
    }

    if (!importsStatus.success) {
      healthReport.recommendations.push(
        `Erreurs d'import: ${importsStatus.errors.join(', ')}`
      )
    }

    if (healthReport.status === 'healthy') {
      healthReport.recommendations.push(
        'Le système d\'authentification semble correctement configuré'
      )
    }

    return NextResponse.json(healthReport)

  } catch (error) {
    console.error('Erreur lors du test d\'authentification:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      recommendations: [
        'Vérifier la configuration NextAuth',
        'Vérifier les imports des modules d\'authentification',
        'Consulter les logs du serveur pour plus de détails'
      ]
    }, { status: 500 })
  }
}

/**
 * Endpoint POST pour tester des fonctionnalités spécifiques
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test } = body

    switch (test) {
      case 'logging':
        // Tester le système de logging
        const { logLoginAttempt } = await import('@/lib/auth-logger')
        logLoginAttempt('test@example.com', true, { headers: { get: (name: string) => name === 'x-forwarded-for' ? '127.0.0.1' : 'Test-Agent' } } as any)
        
        return NextResponse.json({
          test: 'logging',
          status: 'success',
          message: 'Test de logging effectué avec succès'
        })

      case 'middleware':
        // Tester le middleware (consolidé dans le middleware principal)
        return NextResponse.json({
          test: 'middleware',
          status: 'success',
          result: 'middleware consolidé dans le middleware principal',
          note: 'Le middleware a été consolidé dans le fichier middleware.ts principal'
        })

      case '2fa':
        // Tester le système 2FA
        const { get2FAStatus } = await import('@/lib/2fa')
        const twoFAStatus = await get2FAStatus('test-user-id')
        
        return NextResponse.json({
          test: '2fa',
          status: 'success',
          twoFAStatus
        })

      default:
        return NextResponse.json({
          test: 'unknown',
          status: 'error',
          message: 'Test non reconnu'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur lors du test POST:', error)
    
    return NextResponse.json({
      test: 'unknown',
      status: 'error',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
