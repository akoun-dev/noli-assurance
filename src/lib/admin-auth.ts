import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Middleware pour vérifier les droits d'accès administrateur
 * @returns {Promise<{ session: any; response: Response | null }>}
 */
export async function requireAdminAuth() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return {
      session: null,
      response: new Response(
        JSON.stringify({
          success: false,
          message: 'Accès non autorisé',
          error: 'Unauthorized access'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return { session, response: null }
}

/**
 * Middleware pour vérifier les droits d'accès administrateur dans les API routes Next.js
 * @returns {Promise<{ session: any; response: NextResponse | null }>}
 */
export async function requireAdminAuthAPI() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return {
      session: null,
      response: requireAdminErrorResponse()
    }
  }

  return { session, response: null }
}

/**
 * Crée une réponse d'erreur standardisée pour l'accès non autorisé
 */
export function requireAdminErrorResponse() {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Accès non autorisé',
      error: 'Unauthorized access'
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Crée une réponse d'erreur NextResponse standardisée pour l'accès non autorisé
 */
export function requireAdminErrorNextResponse() {
  return NextResponse.json(
    {
      success: false,
      message: 'Accès non autorisé',
      error: 'Unauthorized access'
    },
    { status: 401 }
  )
}