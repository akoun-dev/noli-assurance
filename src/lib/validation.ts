import { z } from 'zod'

/**
 * Schémas de validation pour les formulaires d'authentification
 */

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .transform((email) => email.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères'),
})

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .transform((email) => email.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise'),
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),
  prenom: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'),
  telephone: z.string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Format de numéro de téléphone invalide'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

// Schéma de validation pour le 2FA
export const twoFactorSchema = z.object({
  token: z.string()
    .min(6, 'Le code 2FA doit contenir 6 chiffres')
    .max(6, 'Le code 2FA doit contenir 6 chiffres')
    .regex(/^[0-9]{6}$/, 'Le code 2FA doit contenir uniquement des chiffres'),
})

// Schéma de validation pour la mise à jour du profil
export const updateProfileSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets')
    .optional(),
  prenom: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets')
    .optional(),
  telephone: z.string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Format de numéro de téléphone invalide')
    .optional(),
})

// Schéma de validation pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le nouveau mot de passe ne peut pas dépasser 128 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
  confirmPassword: z.string()
    .min(1, 'La confirmation du nouveau mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les nouveaux mots de passe ne correspondent pas',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Le nouveau mot de passe doit être différent de l\'actuel',
  path: ['newPassword'],
})

/**
 * Fonctions de validation
 */
export function validateLogin(data: unknown) {
  try {
    const validated = loginSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation échouée',
        details: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      error: 'Erreur de validation inconnue'
    }
  }
}

export function validateRegister(data: unknown) {
  try {
    const validated = registerSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation échouée',
        details: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      error: 'Erreur de validation inconnue'
    }
  }
}

export function validateTwoFactor(data: unknown) {
  try {
    const validated = twoFactorSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Code 2FA invalide',
        details: error.errors.map(err => err.message)
      }
    }
    return {
      success: false,
      error: 'Erreur de validation du code 2FA'
    }
  }
}

export function validateProfileUpdate(data: unknown) {
  try {
    const validated = updateProfileSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation échouée',
        details: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      error: 'Erreur de validation du profil'
    }
  }
}

export function validatePasswordChange(data: unknown) {
  try {
    const validated = changePasswordSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation échouée',
        details: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      error: 'Erreur de validation du changement de mot de passe'
    }
  }
}

/**
 * Fonctions de sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\\'"`]/g, '') // Remove quotes that could be used for injection
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

/**
 * Validation des rôles
 */
export const VALID_ROLES = ['USER', 'ADMIN', 'ASSUREUR'] as const

export function isValidRole(role: string): role is typeof VALID_ROLES[number] {
  return VALID_ROLES.includes(role as any)
}

/**
 * Types exportés
 */
export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type TwoFactorData = z.infer<typeof twoFactorSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>