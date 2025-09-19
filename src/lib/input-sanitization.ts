/**
 * Utilitaires de validation et de sanitization des entrées pour les opérations administratives
 */

/**
 * Interface pour les options de validation
 */
interface ValidationOptions {
  required?: boolean
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  whitelist?: string[]
  blacklist?: string[]
  email?: boolean
  phone?: boolean
  alphanumeric?: boolean
  numeric?: boolean
}

/**
 * Nettoie et valide une chaîne de caractères
 */
export function sanitizeString(input: any, options: ValidationOptions = {}): string {
  if (input === null || input === undefined) {
    if (options.required) {
      throw new Error('Ce champ est requis')
    }
    return ''
  }

  const stringValue = String(input).trim()

  if (options.required && stringValue === '') {
    throw new Error('Ce champ est requis')
  }

  if (options.minLength && stringValue.length < options.minLength) {
    throw new Error(`Ce champ doit contenir au moins ${options.minLength} caractères`)
  }

  if (options.maxLength && stringValue.length > options.maxLength) {
    throw new Error(`Ce champ ne peut pas dépasser ${options.maxLength} caractères`)
  }

  if (options.pattern && !options.pattern.test(stringValue)) {
    throw new Error('Format invalide')
  }

  if (options.email && !isValidEmail(stringValue)) {
    throw new Error('Email invalide')
  }

  if (options.phone && !isValidPhone(stringValue)) {
    throw new Error('Numéro de téléphone invalide')
  }

  if (options.alphanumeric && !/^[a-zA-Z0-9\s-']+$/.test(stringValue)) {
    throw new Error('Ce champ ne peut contenir que des caractères alphanumériques')
  }

  if (options.numeric && !/^\d+$/.test(stringValue)) {
    throw new Error('Ce champ ne peut contenir que des chiffres')
  }

  // Échapper les caractères potentiellement dangereux
  return stringValue
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un numéro de téléphone
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s-()]{8,20}$/
  return phoneRegex.test(phone)
}

/**
 * Nettoie et valide un identifiant numérique
 */
export function sanitizeId(input: any): number {
  const id = parseInt(input)
  if (isNaN(id) || id <= 0) {
    throw new Error('ID invalide')
  }
  return id
}

/**
 * Nettoie et valide un rôle utilisateur
 */
export function sanitizeRole(input: any): string {
  const validRoles = ['USER', 'ADMIN', 'ASSUREUR']
  const role = String(input).toUpperCase()

  if (!validRoles.includes(role)) {
    throw new Error('Rôle invalide')
  }

  return role
}

/**
 * Nettoie et valide les données d'entreprise assureur
 */
export function sanitizeInsurerData(data: any): any {
  const sanitized = {
    nom: sanitizeString(data.nom, { required: true, maxLength: 100, alphanumeric: true }),
    prenom: sanitizeString(data.prenom, { required: true, maxLength: 100, alphanumeric: true }),
    email: sanitizeString(data.email, { required: true, email: true }),
    telephone: sanitizeString(data.telephone, { required: true, phone: true }),
    nomEntreprise: sanitizeString(data.nomEntreprise, { required: true, maxLength: 200 }),
    adresseEntreprise: sanitizeString(data.adresseEntreprise, { required: true, maxLength: 500 }),
    siegeSocial: sanitizeString(data.siegeSocial, { required: true, maxLength: 500 }),
    numeroRegistre: sanitizeString(data.numeroRegistre, { required: true, maxLength: 50, alphanumeric: true }),
    numeroAgrement: sanitizeString(data.numeroAgrement, { required: true, maxLength: 50, alphanumeric: true }),
    domaineActivite: sanitizeString(data.domaineActivite, { required: true, maxLength: 100 }),
    anneeExperience: sanitizeString(data.anneeExperience, { required: true, numeric: true }),
    nombreEmployes: sanitizeString(data.nombreEmployes, { required: true, numeric: true }),
    siteWeb: sanitizeString(data.siteWeb || '', { maxLength: 200 }),
    description: sanitizeString(data.description || '', { maxLength: 1000 })
  }

  return sanitized
}

/**
 * Nettoie et valide les paramètres de recherche
 */
export function sanitizeSearchParams(params: URLSearchParams): any {
  const sanitized: any = {}

  for (const [key, value] of params.entries()) {
    switch (key) {
      case 'userId':
      case 'id':
        sanitized[key] = sanitizeId(value)
        break
      case 'email':
        sanitized[key] = sanitizeString(value, { email: true })
        break
      case 'status':
        sanitized[key] = sanitizeString(value, { maxLength: 50 })
        break
      case 'limit':
      case 'offset':
        sanitized[key] = sanitizeId(value)
        break
      default:
        sanitized[key] = sanitizeString(value, { maxLength: 100 })
    }
  }

  return sanitized
}

/**
 * Crée une requête Supabase sécurisée avec sanitization automatique
 */
export function createSecureQuery(table: string, columns: string[] = ['*']) {
  // Valider le nom de la table pour éviter l'injection SQL
  const validTables = ['users', 'insurers', 'Quote', 'quoteOffers', 'offers', 'insurer']
  if (!validTables.includes(table)) {
    throw new Error('Table invalide')
  }

  // Valider les colonnes pour éviter l'injection SQL
  const validColumns = ['id', 'email', 'nom', 'prenom', 'role', 'createdAt', 'updatedAt', 'status', 'telephone', 'deletedAt']
  const filteredColumns = columns.filter(col => validColumns.includes(col) || col.startsWith('user.') || col.startsWith('insurer.'))

  if (filteredColumns.length === 0) {
    throw new Error('Colonnes invalides')
  }

  return {
    table,
    columns: filteredColumns,
    // Méthodes pour construire la requête de manière sécurisée
    select: (selectColumns?: string[]) => {
      const finalColumns = selectColumns || filteredColumns
      return { table, columns: finalColumns }
    }
  }
}