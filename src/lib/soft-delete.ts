import supabase from './supabase'

// Types pour le soft delete
export interface SoftDeleteEntity {
  deleted_at: string | null
  is_deleted: boolean
}

export interface SoftDeleteResult {
  success: boolean
  error?: string
  data?: any
}

// Classe utilitaire pour le soft delete
export class SoftDeleteManager {
  private supabase = supabase

  /**
   * Effectue un soft delete sur un enregistrement
   */
  async softDelete(table: string, id: string): Promise<SoftDeleteResult> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }

  /**
   * Restaure un enregistrement supprimé
   */
  async restore(table: string, id: string): Promise<SoftDeleteResult> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .update({ 
          is_deleted: false, 
          deleted_at: null 
        })
        .eq('id', id)
        .select()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }

  /**
   * Récupère les enregistrements actifs (non supprimés)
   */
  async getActive(table: string, query?: any): Promise<SoftDeleteResult> {
    try {
      let supabaseQuery = this.supabase
        .from(table)
        .select('*')
        .eq('is_deleted', false)

      // Appliquer les filtres supplémentaires si fournis
      if (query) {
        if (query.order) {
          supabaseQuery = supabaseQuery.order(query.order.column, { 
            ascending: query.order.ascending 
          })
        }
        if (query.limit) {
          supabaseQuery = supabaseQuery.limit(query.limit)
        }
        if (query.range) {
          supabaseQuery = supabaseQuery.range(query.range.from, query.range.to)
        }
      }

      const { data, error } = await supabaseQuery

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }

  /**
   * Récupère les enregistrements supprimés
   */
  async getDeleted(table: string, query?: any): Promise<SoftDeleteResult> {
    try {
      let supabaseQuery = this.supabase
        .from(table)
        .select('*')
        .eq('is_deleted', true)

      // Appliquer les filtres supplémentaires si fournis
      if (query) {
        if (query.order) {
          supabaseQuery = supabaseQuery.order(query.order.column, { 
            ascending: query.order.ascending 
          })
        }
        if (query.limit) {
          supabaseQuery = supabaseQuery.limit(query.limit)
        }
        if (query.range) {
          supabaseQuery = supabaseQuery.range(query.range.from, query.range.to)
        }
      }

      const { data, error } = await supabaseQuery

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }

  /**
   * Compte les enregistrements actifs
   */
  async countActive(table: string): Promise<SoftDeleteResult> {
    try {
      const { count, error } = await this.supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: { count } }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }

  /**
   * Compte les enregistrements supprimés
   */
  async countDeleted(table: string): Promise<SoftDeleteResult> {
    try {
      const { count, error } = await this.supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', true)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: { count } }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }

  /**
   * Supprime définitivement les enregistrements marqués comme supprimés (hard delete)
   */
  async hardDelete(table: string, id?: string): Promise<SoftDeleteResult> {
    try {
      let query = this.supabase
        .from(table)
        .delete()

      if (id) {
        query = query.eq('id', id)
      } else {
        query = query.eq('is_deleted', true)
      }

      const { data, error } = await query

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }

  /**
   * Nettoie les anciens enregistrements supprimés (plus de X jours)
   */
  async cleanupOldDeleted(table: string, daysOld: number = 30): Promise<SoftDeleteResult> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data, error } = await this.supabase
        .from(table)
        .delete()
        .eq('is_deleted', true)
        .lt('deleted_at', cutoffDate.toISOString())

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }
}

// Instance singleton pour utilisation facile
export const softDeleteManager = new SoftDeleteManager()

// Fonctions utilitaires pour des opérations courantes
export const softDeleteUser = (id: string) => softDeleteManager.softDelete('users', id)
export const restoreUser = (id: string) => softDeleteManager.restore('users', id)
export const getActiveUsers = (query?: any) => softDeleteManager.getActive('users', query)
export const getDeletedUsers = (query?: any) => softDeleteManager.getDeleted('users', query)

export const softDeleteInsurer = (id: string) => softDeleteManager.softDelete('insurers', id)
export const restoreInsurer = (id: string) => softDeleteManager.restore('insurers', id)
export const getActiveInsurers = (query?: any) => softDeleteManager.getActive('insurers', query)
export const getDeletedInsurers = (query?: any) => softDeleteManager.getDeleted('insurers', query)

export const softDeleteAssure = (id: string) => softDeleteManager.softDelete('assures', id)
export const restoreAssure = (id: string) => softDeleteManager.restore('assures', id)
export const getActiveAssures = (query?: any) => softDeleteManager.getActive('assures', query)
export const getDeletedAssures = (query?: any) => softDeleteManager.getDeleted('assures', query)

export const softDeleteQuote = (id: string) => softDeleteManager.softDelete('Quote', id)
export const restoreQuote = (id: string) => softDeleteManager.restore('Quote', id)
export const getActiveQuotes = (query?: any) => softDeleteManager.getActive('Quote', query)
export const getDeletedQuotes = (query?: any) => softDeleteManager.getDeleted('Quote', query)

export const softDeleteInsuranceOffer = (id: string) => softDeleteManager.softDelete('InsuranceOffer', id)
export const restoreInsuranceOffer = (id: string) => softDeleteManager.restore('InsuranceOffer', id)
export const getActiveInsuranceOffers = (query?: any) => softDeleteManager.getActive('InsuranceOffer', query)
export const getDeletedInsuranceOffers = (query?: any) => softDeleteManager.getDeleted('InsuranceOffer', query)
