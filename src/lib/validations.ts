import { z } from 'zod'

// Schéma de base pour le soft delete
export const SoftDeleteSchema = z.object({
  deleted_at: z.date().nullable().optional(),
  is_deleted: z.boolean().default(false),
})

// Schémas de validation pour les formulaires
export const UserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  telephone: z.string().min(10, 'Le numéro de téléphone est invalide'),
  dateNaissance: z.string().optional(),
  datePermis: z.string().optional(),
}).merge(SoftDeleteSchema)

export const InsurerSchema = z.object({
  userId: z.string().min(1, 'L\'ID utilisateur est requis'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Le numéro de téléphone est invalide'),
  nomEntreprise: z.string().min(2, 'Le nom de l\'entreprise est requis'),
  adresseEntreprise: z.string().min(5, 'L\'adresse de l\'entreprise est requise'),
  siegeSocial: z.string().min(5, 'Le siège social est requis'),
  numeroRegistre: z.string().min(5, 'Le numéro de registre est requis'),
  numeroAgrement: z.string().min(5, 'Le numéro d\'agrément est requis'),
  domaineActivite: z.string().min(2, 'Le domaine d\'activité est requis'),
  anneeExperience: z.string().min(1, 'L\'année d\'expérience est requise'),
  nombreEmployes: z.string().min(1, 'Le nombre d\'employés est requis'),
  siteWeb: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().max(1000, 'La description ne doit pas dépasser 1000 caractères').optional(),
}).merge(SoftDeleteSchema)

export const QuoteSchema = z.object({
  userId: z.string().optional(),
  assureId: z.string().optional(),
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().min(10, 'Le numéro de téléphone est requis'),
  dateNaissance: z.string().optional(),
  datePermis: z.string().optional(),
  antecedentsSinistres: z.boolean().optional(),
  nombreSinistres: z.number().min(0).optional(),
  typeSinistres: z.string().optional(),
  usagePrincipal: z.string().optional(),
  kilometrageAnnuel: z.string().optional(),
  energie: z.string().optional(),
  puissanceFiscale: z.string().optional(),
  nombrePlaces: z.string().optional(),
  dateMiseCirculation: z.string().optional(),
  valeurNeuve: z.number().min(0).optional(),
  valeurVenale: z.number().min(0).optional(),
  usageVehicule: z.string().optional(),
  typeCouverture: z.string().optional(),
  dateEffet: z.string().optional(),
  dureeContrat: z.number().min(1).max(60).optional(),
  options: z.string().optional(),
  niveauFranchise: z.string().optional(),
  preferenceContact: z.string().optional(),
}).merge(SoftDeleteSchema)

export const InsuranceOfferSchema = z.object({
  insurerId: z.string().min(1, 'L\'ID assureur est requis'),
  name: z.string().min(2, 'Le nom de l\'offre est requis'),
  coverageLevel: z.string().min(2, 'Le niveau de couverture est requis'),
  monthlyPrice: z.number().min(0, 'Le prix mensuel doit être positif'),
  annualPrice: z.number().min(0, 'Le prix annuel doit être positif'),
  franchise: z.number().min(0, 'La franchise doit être positive'),
  description: z.string().max(2000, 'La description ne doit pas dépasser 2000 caractères').optional(),
  isActive: z.boolean().default(true),
}).merge(SoftDeleteSchema)

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export const AssureSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Le numéro de téléphone est invalide'),
  isWhatsApp: z.boolean().default(false),
}).merge(SoftDeleteSchema)

export const RegisterSchema = UserSchema.extend({
  confirmPassword: z.string().min(8, 'La confirmation du mot de passe est requise'),
  role: z.enum(['USER', 'ADMIN', 'ASSUREUR']).default('USER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

// Types TypeScript dérivés des schémas
export type UserInput = z.infer<typeof UserSchema>
export type InsurerInput = z.infer<typeof InsurerSchema>
export type QuoteInput = z.infer<typeof QuoteSchema>
export type InsuranceOfferInput = z.infer<typeof InsuranceOfferSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>

// Fonctions de validation
export const validateUser = (data: unknown) => {
  try {
    return UserSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation utilisateur: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateInsurer = (data: unknown) => {
  try {
    return InsurerSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation assureur: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateQuote = (data: unknown) => {
  try {
    return QuoteSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation devis: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateInsuranceOffer = (data: unknown) => {
  try {
    return InsuranceOfferSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation offre d\'assurance: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateLogin = (data: unknown) => {
  try {
    return LoginSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation connexion: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateAssure = (data: unknown) => {
  try {
    return AssureSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation assuré: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateRegister = (data: unknown) => {
  try {
    return RegisterSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation inscription: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}
