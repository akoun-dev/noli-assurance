import { z } from 'zod';

// Schéma de validation pour l'inscription
export const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string().min(8, 'La confirmation du mot de passe est requise'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50, 'Le prénom est trop long'),
  telephone: z.string()
    .regex(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres'),
  role: z.enum(['USER', 'ADMIN', 'ASSUREUR']).default('USER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Schéma de validation pour la connexion
export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Schéma de validation pour le formulaire d'assuré
export const AssureSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50, 'Le prénom est trop long'),
  email: z.string().email('Email invalide'),
  telephone: z.string()
    .regex(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres'),
  adresse: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères').max(200, 'L\'adresse est trop longue'),
  dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  lieuNaissance: z.string().min(2, 'Le lieu de naissance est requis').max(50, 'Le lieu de naissance est trop long'),
  profession: z.string().min(2, 'La profession est requise').max(100, 'La profession est trop longue'),
  situationFamiliale: z.enum(['Celibataire', 'Marie(e)', 'Divorce(e)', 'Veuf(ve)', 'Autre']),
  nbEnfants: z.number().min(0, 'Nombre d\'enfants invalide').max(20, 'Nombre d\'enfants trop élevé'),
});

// Schéma de validation pour le véhicule
export const VehiculeSchema = z.object({
  marque: z.string().min(2, 'La marque est requise').max(50, 'La marque est trop longue'),
  modele: z.string().min(2, 'Le modèle est requis').max(50, 'Le modèle est trop long'),
  annee: z.number().min(1900, 'Année invalide').max(new Date().getFullYear() + 1, 'Année invalide'),
  numeroPlaque: z.string().regex(/^[A-Z0-9]{1,3}-[A-Z0-9]{1,3}-[A-Z0-9]{1,4}$/, 'Format de plaque invalide'),
  puissanceFiscale: z.number().min(1, 'Puissance fiscale invalide').max(20, 'Puissance fiscale invalide'),
  energie: z.enum(['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL', 'GNC']),
  valeur: z.number().min(100000, 'Valeur invalide').max(10000000, 'Valeur invalide'),
  usage: z.enum(['Particulier', 'Professionnel', 'Taxi', 'VTC', 'Location']),
  parking: z.enum(['Garage', 'Parking couvert', 'Parking ouvert', 'Rue']),
});

// Schéma de validation pour l'offre d'assurance
export const InsuranceOfferSchema = z.object({
  nomEntreprise: z.string().min(2, 'Le nom de l\'entreprise est requis').max(100, 'Le nom est trop long'),
  prix: z.number().min(1000, 'Prix invalide').max(1000000, 'Prix invalide'),
  couverture: z.object({
    dommages: z.boolean(),
    vol: z.boolean(),
    incendie: z.boolean(),
    brisDeGlace: z.boolean(),
    responsabiliteCivile: z.boolean(),
    assistance: z.boolean(),
    garantieJuridique: z.boolean(),
  }),
  franchise: z.number().min(0, 'Franchise invalide').max(100000, 'Franchise invalide'),
  duree: z.number().min(1, 'Durée invalide').max(12, 'Durée invalide'),
  conditions: z.string().min(10, 'Conditions requises').max(2000, 'Conditions trop longues'),
});

// Schéma de validation pour le devis
export const QuoteSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur requis'),
  assureId: z.string().min(1, 'ID assuré requis'),
  vehiculeId: z.string().min(1, 'ID véhicule requis'),
  offreId: z.string().min(1, 'ID offre requis'),
  prixTotal: z.number().min(1000, 'Prix total invalide'),
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  dateFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  options: z.array(z.string()).optional(),
});

// Schéma de validation pour les données utilisateur
export const UserSchema = z.object({
  email: z.string().email('Email invalide'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50, 'Le prénom est trop long'),
  telephone: z.string()
    .regex(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres')
    .optional(),
  role: z.enum(['USER', 'ADMIN', 'ASSUREUR']),
  isActive: z.boolean().default(true),
});

// Schéma de validation pour la mise à jour du profil
export const UpdateProfileSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long').optional(),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50, 'Le prénom est trop long').optional(),
  telephone: z.string()
    .regex(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres')
    .optional(),
  email: z.string().email('Email invalide').optional(),
});

// Schéma de validation pour le changement de mot de passe
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string().min(8, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Fonctions de validation utilitaires
export function validateRegister(data: unknown) {
  return RegisterSchema.parse(data);
}

export function validateLogin(data: unknown) {
  return LoginSchema.parse(data);
}

export function validateAssure(data: unknown) {
  return AssureSchema.parse(data);
}

export function validateVehicule(data: unknown) {
  return VehiculeSchema.parse(data);
}

export function validateInsuranceOffer(data: unknown) {
  return InsuranceOfferSchema.parse(data);
}

export function validateQuote(data: unknown) {
  return QuoteSchema.parse(data);
}

export function validateUser(data: unknown) {
  return UserSchema.parse(data);
}

export function validateUpdateProfile(data: unknown) {
  return UpdateProfileSchema.parse(data);
}

export function validateChangePassword(data: unknown) {
  return ChangePasswordSchema.parse(data);
}

// Exporter les types pour une utilisation dans les composants
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type AssureData = z.infer<typeof AssureSchema>;
export type VehiculeData = z.infer<typeof VehiculeSchema>;
export type InsuranceOfferData = z.infer<typeof InsuranceOfferSchema>;
export type QuoteData = z.infer<typeof QuoteSchema>;
export type UserData = z.infer<typeof UserSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
