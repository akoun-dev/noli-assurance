import { z } from 'zod';

// Fonction de validation et de nettoyage des entrées
export function sanitizeInput(input: string): string {
  // Supprimer les caractères HTML/XML dangereux
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\?php[^>]*\?>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Schéma de validation pour l'inscription avec nettoyage
export const RegisterSchema = z.object({
  email: z.string()
    .transform(sanitizeInput)
    .email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string()
    .min(8, 'La confirmation du mot de passe est requise'),
  nom: z.string()
    .transform(sanitizeInput)
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long'),
  prenom: z.string()
    .transform(sanitizeInput)
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long'),
  telephone: z.string()
    .transform(sanitizeInput)
    .regex(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres'),
  role: z.enum(['USER', 'ADMIN', 'ASSUREUR']).default('USER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Schéma de validation pour la connexion avec nettoyage
export const LoginSchema = z.object({
  email: z.string()
    .transform(sanitizeInput)
    .email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Schéma de validation pour le formulaire d'assuré avec nettoyage
export const AssureSchema = z.object({
  nom: z.string()
    .transform(sanitizeInput)
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long'),
  prenom: z.string()
    .transform(sanitizeInput)
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long'),
  email: z.string()
    .transform(sanitizeInput)
    .email('Email invalide'),
  telephone: z.string()
    .transform(sanitizeInput)
    .regex(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres'),
  isWhatsApp: z.boolean().default(false),
  adresse: z.string()
    .transform(sanitizeInput)
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(200, 'L\'adresse est trop longue'),
  dateNaissance: z.string()
    .transform(sanitizeInput)
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  lieuNaissance: z.string()
    .transform(sanitizeInput)
    .min(2, 'Le lieu de naissance est requis')
    .max(50, 'Le lieu de naissance est trop long'),
  profession: z.string()
    .transform(sanitizeInput)
    .min(2, 'La profession est requise')
    .max(100, 'La profession est trop longue'),
  situationFamiliale: z.enum(['Celibataire', 'Marie(e)', 'Divorce(e)', 'Veuf(ve)', 'Autre']),
  nbEnfants: z.number()
    .min(0, 'Nombre d\'enfants invalide')
    .max(20, 'Nombre d\'enfants trop élevé'),
});

// Validation d'email améliorée
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Validation de téléphone international
export function validatePhone(phone: string): boolean {
  // Accepte les formats internationaux
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

// Fonction de validation CSRF
export function validateCSRFToken(token: string): boolean {
  // À implémenter avec un vrai système de tokens CSRF
  return token && token.length > 0;
}

// Fonction pour générer un token CSRF
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// Exporter les fonctions de validation
export function validateRegister(data: unknown) {
  return RegisterSchema.parse(data);
}

export function validateLogin(data: unknown) {
  return LoginSchema.parse(data);
}

export function validateAssure(data: unknown) {
  return AssureSchema.parse(data);
}

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type AssureData = z.infer<typeof AssureSchema>;