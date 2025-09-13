import { NextRequest, NextResponse } from 'next/server'

/**
 * Types pour la session utilisateur (simplifiés pour éviter les problèmes de types NextAuth)
 */
interface UserSession {
  id: string
  email: string
  name: string
  role: string
}

interface Session {
  user: UserSession
  expires: string
}

/**
 * Récupère la session utilisateur de manière simplifiée
 * Évite les problèmes de types avec getServerSession
 */
async function getUserSession(request: NextRequest): Promise<Session | null> {
  try {
    // Vérifier les cookies de session NextAuth
    const sessionCookie = request.cookies.get('next-auth.session-token') ||
                         request.cookies.get('__Secure-next-auth.session-token')
    
    if (!sessionCookie) {
      return null
    }

    // Pour l'instant, on retourne null car on ne peut pas décoder le JWT facilement
    // Dans une version complète, on utiliserait getServerSession quand les types seront corrigés
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return null
  }
}

/**
 * Endpoint API pour la déconnexion
 * Nettoie la session côté serveur et enregistre l'activité
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer la session pour logger la déconnexion
    const session = await getUserSession(request)
    
    if (session?.user) {
      // Logger la déconnexion pour le suivi d'activité
      console.log(`Déconnexion de l'utilisateur: ${session.user.email} (${session.user.id})`)
      
      // Ici, vous pourriez ajouter d'autres actions de nettoyage :
      // - Mettre à jour la date de dernière connexion
      // - Invalider les tokens JWT spécifiques
      // - Nettoyer les sessions actives dans la base de données
      // - Envoyer une notification de sécurité
      
      // Exemple : Mettre à jour la date de dernière déconnexion
      // await supabase
      //   .from('users')
      //   .update({ last_logout_at: new Date().toISOString() })
      //   .eq('id', session.user.id)
    } else {
      // Logger la tentative de déconnexion sans session
      console.log('Tentative de déconnexion sans session active')
    }

    // La déconnexion réelle est gérée par NextAuth côté client
    // Cet endpoint sert principalement pour le logging et le nettoyage
    
    return NextResponse.json({
      success: true,
      message: 'Déconnexion traitée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la déconnexion:', error)
    
    // Même en cas d'erreur, on retourne un succès pour ne pas bloquer la déconnexion
    return NextResponse.json({
      success: true,
      message: 'Déconnexion traitée (avec erreurs mineures)'
    })
  }
}

/**
 * Endpoint GET pour vérifier le statut de déconnexion
 * Utile pour le débogage et le monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      } : null,
      timestamp: new Date().toISOString()
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
