import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabaseAdmin from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

/**
 * Vérifie si l'utilisateur courant a le rôle ASSUREUR
 * et retourne les informations de l'assureur
 */
export async function requireAssureurAuth() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
        status: 401
      }
    }

    if (session.user.role !== 'ASSUREUR') {
      return {
        success: false,
        error: 'Accès refusé - rôle ASSUREUR requis',
        status: 403
      }
    }

    // Vérifier si le profil assureur existe
    const { data: insurer, error } = await supabaseAdmin
      .from('insurers')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (error || !insurer) {
      return {
        success: false,
        error: 'Profil assureur introuvable',
        status: 404
      }
    }

    // Vérifier si le profil est actif
    if (insurer.statut !== 'ACTIF') {
      return {
        success: false,
        error: 'Compte assureur inactif',
        status: 403
      }
    }

    return {
      success: true,
      session,
      insurer,
      user: session.user
    }
  } catch (error) {
    console.error('Erreur dans requireAssureurAuth:', error)
    return {
      success: false,
      error: 'Erreur interne du serveur',
      status: 500
    }
  }
}

/**
 * Vérifie si l'ASSUREUR a accès à une offre spécifique
 */
export async function validateAssureurOfferAccess(offerId: string, userId: string) {
  try {
    const { data: offer, error } = await supabaseAdmin
      .from('InsuranceOffer')
      .select('insurerId')
      .eq('id', offerId)
      .single()

    if (error || !offer) {
      return {
        success: false,
        error: 'Offre introuvable',
        status: 404
      }
    }

    // Vérifier que l'offre appartient à l'assureur
    const { data: insurer, error: insurerError } = await supabaseAdmin
      .from('insurers')
      .select('id')
      .eq('userId', userId)
      .single()

    if (insurerError || !insurer || offer.insurerId !== insurer.id) {
      return {
        success: false,
        error: 'Accès non autorisé à cette offre',
        status: 403
      }
    }

    return {
      success: true,
      offer,
      insurer
    }
  } catch (error) {
    console.error('Erreur dans validateAssureurOfferAccess:', error)
    return {
      success: false,
      error: 'Erreur interne du serveur',
      status: 500
    }
  }
}

/**
 * Vérifie si l'ASSUREUR a accès à un devis spécifique
 */
export async function validateAssureurQuoteAccess(quoteId: string, userId: string) {
  try {
    // Récupérer l'ID de l'assureur
    const { data: insurer, error: insurerError } = await supabaseAdmin
      .from('insurers')
      .select('id')
      .eq('userId', userId)
      .single()

    if (insurerError || !insurer) {
      return {
        success: false,
        error: 'Profil assureur introuvable',
        status: 404
      }
    }

    // Vérifier que le devis est lié à une offre de l'assureur
    const { data: quoteOffers, error: quoteError } = await supabaseAdmin
      .from('QuoteOffer')
      .select(`
        *,
        offer(
          insurerId
        )
      `)
      .eq('quoteId', quoteId)

    if (quoteError) {
      return {
        success: false,
        error: 'Erreur lors de la vérification du devis',
        status: 500
      }
    }

    const hasAccess = quoteOffers.some((qo: any) =>
      qo.offer?.insurerId === insurer.id
    )

    if (!hasAccess) {
      return {
        success: false,
        error: 'Accès non autorisé à ce devis',
        status: 403
      }
    }

    return {
      success: true,
      insurer,
      quoteOffers
    }
  } catch (error) {
    console.error('Erreur dans validateAssureurQuoteAccess:', error)
    return {
      success: false,
      error: 'Erreur interne du serveur',
      status: 500
    }
  }
}

/**
 * Middleware helper pour API routes ASSUREUR
 */
export function withAssureurAuth(handler: (request: Request, ...args: any[]) => Promise<Response>) {
  return async (request: Request, ...args: any[]) => {
    const authResult = await requireAssureurAuth()

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    return handler(request, ...args, authResult)
  }
}

/**
 * Validation des entrées pour les opérations ASSUREUR
 */
export function validateAssureurInput(data: unknown, schema: { parse: (data: unknown) => unknown }) {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    return {
      success: false,
      error: 'Données invalides',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Sécurisation des réponses sensibles
 */
export function sanitizeAssureurResponse(data: any) {
  if (!data) return data

  // Supprimer les champs sensibles si présents
  const sanitized = { ...data }
  delete sanitized.password
  delete sanitized.secretKey
  delete sanitized.internalNotes

  return sanitized
}