import * as speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import supabase from './supabase'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorVerification {
  success: boolean
  error?: string
  user?: any
}

export interface TwoFactorStatus {
  isEnabled: boolean
  enabledAt?: string
  lastUsedAt?: string
  backupCodes?: string[]
}

export class TwoFactorManager {
  /**
   * Génère un secret TOTP et un QR code pour la configuration 2FA
   */
  async generateSetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Générer un secret TOTP
      const secret = speakeasy.generateSecret({
        name: `Noli Assurance (${userEmail})`,
        issuer: 'Noli Assurance',
      })

      if (!secret.otpauth_url) {
        throw new Error('Impossible de générer l\'URL OTPAuth')
      }

      // Générer le QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

      // Générer des codes de secours
      const backupCodes = this.generateBackupCodes()

      // Stocker temporairement la configuration dans la base de données
      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          id: uuidv4(),
          user_id: userId,
          secret: secret.base32!,
          backup_codes: backupCodes,
          is_enabled: false,
        })

      if (error) {
        throw new Error(`Erreur lors de la sauvegarde du secret: ${error.message}`)
      }

      return {
        secret: secret.base32!,
        qrCodeUrl,
        backupCodes,
      }
    } catch (error) {
      throw new Error(`Erreur lors de la génération de la configuration 2FA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  /**
   * Vérifie un code TOTP et active le 2FA si valide
   */
  async verifyAndEnable(userId: string, token: string): Promise<TwoFactorVerification> {
    try {
      // Récupérer la configuration 2FA de l'utilisateur
      const { data: user2fa, error } = await supabase
        .from('user_2fa')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !user2fa) {
        return { success: false, error: 'Configuration 2FA non trouvée' }
      }

      // Vérifier le token
      const verified = speakeasy.totp.verify({
        secret: user2fa.secret,
        encoding: 'base32',
        token: token,
        window: 2, // Permet une fenêtre de temps de 2 pas (environ 1 minute)
      })

      if (!verified) {
        return { success: false, error: 'Code 2FA invalide' }
      }

      // Activer le 2FA
      const { error: updateError } = await supabase
        .from('user_2fa')
        .update({
          is_enabled: true,
          enabled_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (updateError) {
        return { success: false, error: 'Erreur lors de l\'activation du 2FA' }
      }

      // Récupérer les informations de l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, nom, prenom, role')
        .eq('id', userId)
        .single()

      if (userError) {
        return { success: false, error: 'Erreur lors de la récupération des informations utilisateur' }
      }

      return {
        success: true,
        user: {
          ...user,
          twoFactorEnabled: true,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
  }

  /**
   * Vérifie un code TOTP pour l'authentification
   */
  async verifyToken(userId: string, token: string): Promise<TwoFactorVerification> {
    try {
      // Récupérer la configuration 2FA de l'utilisateur
      const { data: user2fa, error } = await supabase
        .from('user_2fa')
        .select('*')
        .eq('user_id', userId)
        .eq('is_enabled', true)
        .single()

      if (error || !user2fa) {
        return { success: false, error: '2FA non configuré pour cet utilisateur' }
      }

      // Vérifier si c'est un code de secours
      const isBackupCode = user2fa.backup_codes?.includes(token)
      
      if (isBackupCode) {
        // Supprimer le code de secours utilisé
        const updatedBackupCodes = user2fa.backup_codes.filter(code => code !== token)
        
        await supabase
          .from('user_2fa')
          .update({ backup_codes: updatedBackupCodes })
          .eq('user_id', userId)

        // Mettre à jour la date de dernière utilisation
        await this.updateLastUsed(userId)

        return { success: true }
      }

      // Vérifier le token TOTP
      const verified = speakeasy.totp.verify({
        secret: user2fa.secret,
        encoding: 'base32',
        token: token,
        window: 2,
      })

      if (!verified) {
        return { success: false, error: 'Code 2FA invalide' }
      }

      // Mettre à jour la date de dernière utilisation
      await this.updateLastUsed(userId)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
  }

  /**
   * Désactive le 2FA pour un utilisateur
   */
  async disable(userId: string): Promise<TwoFactorVerification> {
    try {
      const { error } = await supabase
        .from('user_2fa')
        .update({
          is_enabled: false,
          enabled_at: null,
        })
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: 'Erreur lors de la désactivation du 2FA' }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
  }

  /**
   * Récupère le statut 2FA d'un utilisateur
   */
  async getStatus(userId: string): Promise<TwoFactorStatus> {
    try {
      const { data: user2fa, error } = await supabase
        .from('user_2fa')
        .select('is_enabled, enabled_at, last_used_at, backup_codes')
        .eq('user_id', userId)
        .single()

      if (error || !user2fa) {
        return { isEnabled: false }
      }

      return {
        isEnabled: user2fa.is_enabled,
        enabledAt: user2fa.enabled_at,
        lastUsedAt: user2fa.last_used_at,
        backupCodes: user2fa.backup_codes,
      }
    } catch (error) {
      return { isEnabled: false }
    }
  }

  /**
   * Régénère des codes de secours
   */
  async regenerateBackupCodes(userId: string): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
    try {
      const backupCodes = this.generateBackupCodes()

      const { error } = await supabase
        .from('user_2fa')
        .update({ backup_codes: backupCodes })
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: 'Erreur lors de la régénération des codes de secours' }
      }

      return { success: true, backupCodes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
  }

  /**
   * Met à jour la date de dernière utilisation du 2FA
   */
  private async updateLastUsed(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_2fa')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', userId)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de last_used_at:', error)
    }
  }

  /**
   * Génère des codes de secours aléatoires
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      // Générer un code aléatoire de 8 caractères
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }
}

// Instance singleton pour utilisation facile
export const twoFactorManager = new TwoFactorManager()

// Fonctions utilitaires pour des opérations courantes
export const generate2FASetup = (userId: string, userEmail: string) => 
  twoFactorManager.generateSetup(userId, userEmail)

export const verifyAndEnable2FA = (userId: string, token: string) => 
  twoFactorManager.verifyAndEnable(userId, token)

export const verify2FAToken = (userId: string, token: string) => 
  twoFactorManager.verifyToken(userId, token)

export const disable2FA = (userId: string) => 
  twoFactorManager.disable(userId)

export const get2FAStatus = (userId: string) => 
  twoFactorManager.getStatus(userId)

export const regenerateBackupCodes = (userId: string) => 
  twoFactorManager.regenerateBackupCodes(userId)
