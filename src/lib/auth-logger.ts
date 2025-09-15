import { NextRequest } from 'next/server'

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

    // Ici, vous pourriez ajouter une logique pour stocker l'activité dans une base de données
    // Par exemple, dans une table d'audit ou de logs de sécurité
    
    // Exemple d'insertion dans Supabase (si configuré) :
    /*
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        action,
        action_type: actionType,
        description,
        ip_address: request.headers.get('x-forwarded-for'),
        user_agent: request.headers.get('user-agent'),
        created_at: new Date().toISOString()
      })
    */

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
    // Optionally persist to DB (Supabase) here if needed.
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}
