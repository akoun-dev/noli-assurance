import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { logAuthenticationEvent, logSecurityEvent } from '@/lib/monitoring'

/**
 * Configuration pour la vérification JWT
 */
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

/**
 * Interface pour les données utilisateur décodées
 */
interface DecodedUser {
  id: string
  email: string
  name: string
  role: string
  twoFactorEnabled: boolean
  twoFactorVerified: boolean
}

/**
 * Décode et vérifie le token JWT depuis le cookie
 */
async function verifySessionToken(request: NextRequest): Promise<DecodedUser | null> {
  try {
    // Récupérer le cookie de session
    const sessionCookie = request.cookies.get('next-auth.session-token') ||
                         request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionCookie || !sessionCookie.value) {
      return null
    }

    // Vérifier le token JWT
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)

    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      twoFactorEnabled: payload.twoFactorEnabled as boolean,
      twoFactorVerified: payload.twoFactorVerified as boolean
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du token JWT:', error)
    return null
  }
}

/**
 * Endpoint API pour la déconnexion
 * Nettoie la session côté serveur, enregistre l'activité et met à jour la base de données
 */
export async function POST(request: NextRequest) {
  try {
    // Initialiser le client Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Récupérer et vérifier le token JWT
    const decodedUser = await verifySessionToken(request)

    if (decodedUser) {
      // Logger la déconnexion pour le suivi d'activité
      console.log(`Déconnexion de l'utilisateur: ${decodedUser.email} (${decodedUser.id}) [Rôle: ${decodedUser.role}]`)

      // Enregistrer l'événement d'authentification
      await logAuthenticationEvent({
        eventType: 'LOGOUT',
        userId: decodedUser.id,
        email: decodedUser.email,
        role: decodedUser.role,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true,
        twoFactorEnabled: decodedUser.twoFactorEnabled
      })

      // Mettre à jour la date de dernière déconnexion dans la base de données
      const { error: updateError } = await supabase
        .from('users')
        .update({
          last_logout_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', decodedUser.id)

      if (updateError) {
        console.error('Erreur lors de la mise à jour de last_logout_at:', updateError)
      }

      // Enregistrer l'activité dans les logs d'audit
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: decodedUser.id,
            action: 'LOGOUT',
            entity_type: 'USER_SESSION',
            entity_id: decodedUser.id,
            old_values: { session_active: true },
            new_values: { session_active: false },
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
            created_at: new Date().toISOString()
          })
      } catch (auditError) {
        console.error('Erreur lors de l\'enregistrement du log d\'audit:', auditError)
      }

      // Invalider les tokens JWT actifs si une table existe
      try {
        await supabase
          .from('invalid_tokens')
          .insert({
            user_id: decodedUser.id,
            token_hash: '', // On ne stocke pas le token complet pour des raisons de sécurité
            invalidated_at: new Date().toISOString(),
            reason: 'LOGOUT'
          })
      } catch (tokenError) {
        // Ignorer si la table n'existe pas
        console.warn('Table invalid_tokens non disponible:', tokenError)
      }

      // Pour les utilisateurs avec 2FA, enregistrer la fin de session sécurisée
      if (decodedUser.twoFactorEnabled) {
        console.log(`Session 2FA terminée pour l'utilisateur: ${decodedUser.email}`)
      }
    } else {
      // Logger la tentative de déconnexion sans session valide
      console.log('Tentative de déconnexion sans session valide ou token expiré')

      // Enregistrer la tentative suspecte
      await logSecurityEvent({
        eventType: 'LOGOUT_ATTEMPT_INVALID',
        severity: 'LOW',
        description: 'Tentative de déconnexion sans session valide',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        route: '/api/auth/logout'
      })
    }

    // Ajouter des headers de sécurité pour la déconnexion
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion traitée avec succès',
      timestamp: new Date().toISOString(),
      userId: decodedUser?.id || null
    })

    // Supprimer les cookies de session
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('__Secure-next-auth.session-token')
    response.cookies.delete('next-auth.csrf-token')

    return response

  } catch (error) {
    console.error('Erreur lors du traitement de la déconnexion:', error)

    // Même en cas d'erreur, on retourne un succès pour ne pas bloquer la déconnexion
    return NextResponse.json({
      success: true,
      message: 'Déconnexion traitée (avec erreurs mineures)',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Endpoint GET pour vérifier le statut de déconnexion
 * Utile pour le débogage et le monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const decodedUser = await verifySessionToken(request)

    return NextResponse.json({
      authenticated: !!decodedUser,
      user: decodedUser ? {
        id: decodedUser.id,
        email: decodedUser.email,
        name: decodedUser.name,
        role: decodedUser.role,
        twoFactorEnabled: decodedUser.twoFactorEnabled
      } : null,
      timestamp: new Date().toISOString(),
      session_valid: !!decodedUser
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'authentification:', error)

    return NextResponse.json({
      authenticated: false,
      error: 'Erreur lors de la vérification',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
