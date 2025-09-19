import { supabase } from '@/lib/supabase'

export interface AuditLogData {
  userId?: string
  userEmail?: string
  userRole?: string
  action: string
  entityType?: string
  entityId?: string
  description?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  status?: 'success' | 'error' | 'warning'
  errorMessage?: string
  metadata?: any
}

export interface SystemLogData {
  level: 'info' | 'warning' | 'error' | 'debug'
  category: string
  message: string
  context?: any
  stackTrace?: string
  sourceFile?: string
  lineNumber?: number
  functionName?: string
}

class AuditService {
  /**
   * Log une action administrative
   */
  async logAdminAction(data: AuditLogData) {
    try {
      const { data: result, error } = await supabase.rpc('log_admin_action', {
        p_user_id: data.userId,
        p_user_email: data.userEmail,
        p_user_role: data.userRole,
        p_action: data.action,
        p_entity_type: data.entityType,
        p_entity_id: data.entityId,
        p_description: data.description,
        p_old_values: data.oldValues,
        p_new_values: data.newValues,
        p_ip_address: data.ipAddress,
        p_user_agent: data.userAgent,
        p_status: data.status || 'success',
        p_error_message: data.errorMessage,
        p_metadata: data.metadata
      })

      if (error) {
        console.error('Failed to log admin action:', error)
        // Fallback to console logging if database logging fails
        this.fallbackLog(data)
      }

      return result
    } catch (error) {
      console.error('Exception in logAdminAction:', error)
      this.fallbackLog(data)
      return null
    }
  }

  /**
   * Log un événement système
   */
  async logSystemEvent(data: SystemLogData) {
    try {
      const { data: result, error } = await supabase.rpc('log_system_event', {
        p_level: data.level,
        p_category: data.category,
        p_message: data.message,
        p_context: data.context,
        p_stack_trace: data.stackTrace,
        p_source_file: data.sourceFile,
        p_line_number: data.lineNumber,
        p_function_name: data.functionName
      })

      if (error) {
        console.error('Failed to log system event:', error)
        this.fallbackSystemLog(data)
      }

      return result
    } catch (error) {
      console.error('Exception in logSystemEvent:', error)
      this.fallbackSystemLog(data)
      return null
    }
  }

  /**
   * Récupère les logs d'audit avec pagination et filtres
   */
  async getAuditLogs(options: {
    page?: number
    limit?: number
    userId?: string
    action?: string
    entityType?: string
    status?: string
    startDate?: string
    endDate?: string
  } = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        action,
        entityType,
        status,
        startDate,
        endDate
      } = options

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (userId) query = query.eq('user_id', userId)
      if (action) query = query.eq('action', action)
      if (entityType) query = query.eq('entity_type', entityType)
      if (status) query = query.eq('status', status)
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)

      const offset = (page - 1) * limit
      const { data, error, count } = await query.range(offset, offset + limit - 1)

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      }
    }
  }

  /**
   * Récupère les logs système avec pagination et filtres
   */
  async getSystemLogs(options: {
    page?: number
    limit?: number
    level?: string
    category?: string
    startDate?: string
    endDate?: string
  } = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        level,
        category,
        startDate,
        endDate
      } = options

      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (level) query = query.eq('level', level)
      if (category) query = query.eq('category', category)
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)

      const offset = (page - 1) * limit
      const { data, error, count } = await query.range(offset, offset + limit - 1)

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Error fetching system logs:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      }
    }
  }

  /**
   * Configure le contexte utilisateur pour les logs
   */
  async setUserContext(userId: string, userEmail: string, userRole: string) {
    try {
      // Utiliser les variables de session Supabase pour stocker le contexte utilisateur
      await supabase.rpc('set_config', {
        name: 'app.current_user_id',
        value: userId
      })
      await supabase.rpc('set_config', {
        name: 'app.current_user_email',
        value: userEmail
      })
      await supabase.rpc('set_config', {
        name: 'app.current_user_role',
        value: userRole
      })
    } catch (error) {
      console.error('Error setting user context:', error)
    }
  }

  /**
   * Fallback logging en cas d'échec de la base de données
   */
  private fallbackLog(data: AuditLogData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'AUDIT',
      ...data
    }
    console.log('FALLBACK AUDIT LOG:', JSON.stringify(logEntry, null, 2))
  }

  /**
   * Fallback logging système en cas d'échec
   */
  private fallbackSystemLog(data: SystemLogData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'SYSTEM',
      ...data
    }
    console.log('FALLBACK SYSTEM LOG:', JSON.stringify(logEntry, null, 2))
  }

  /**
   * Méthodes pratiques pour les actions courantes
   */
  async logUserLogin(userId: string, userEmail: string, userRole: string, ipAddress?: string, userAgent?: string) {
    return this.logAdminAction({
      userId,
      userEmail,
      userRole,
      action: 'USER_LOGIN',
      description: 'User logged in successfully',
      ipAddress,
      userAgent,
      status: 'success'
    })
  }

  async logUserLogout(userId: string, userEmail: string, userRole: string) {
    return this.logAdminAction({
      userId,
      userEmail,
      userRole,
      action: 'USER_LOGOUT',
      description: 'User logged out'
    })
  }

  async logUserCreation(userId: string, userEmail: string, userRole: string, createdBy?: string, userData?: any) {
    return this.logAdminAction({
      userId: createdBy,
      userEmail,
      userRole,
      action: 'USER_CREATED',
      entityType: 'users',
      entityId: userId,
      description: `New user created: ${userEmail}`,
      newValues: userData,
      status: 'success'
    })
  }

  async logUserUpdate(userId: string, userEmail: string, userRole: string, oldData: any, newData: any) {
    return this.logAdminAction({
      userId,
      userEmail,
      userRole,
      action: 'USER_UPDATED',
      entityType: 'users',
      entityId: userId,
      description: `User information updated: ${userEmail}`,
      oldValues: oldData,
      newValues: newData,
      status: 'success'
    })
  }

  async logUserDeletion(userId: string, userEmail: string, userRole: string, deletedBy?: string) {
    return this.logAdminAction({
      userId: deletedBy,
      userEmail,
      userRole,
      action: 'USER_DELETED',
      entityType: 'users',
      entityId: userId,
      description: `User deleted: ${userEmail}`,
      oldValues: { email: userEmail, role: userRole },
      status: 'success'
    })
  }

  async logSecurityEvent(eventType: string, description: string, userEmail?: string, userId?: string, metadata?: any) {
    return this.logAdminAction({
      userId,
      userEmail,
      userRole: 'SYSTEM',
      action: `SECURITY_${eventType}`,
      description,
      status: 'warning',
      metadata
    })
  }
}

export const auditService = new AuditService()