import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

// Créer un adaptateur personnalisé pour gérer uniquement la table users existante
const customAdapter = {
  createUser: async (user) => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: user.email,
        prenom: user.name?.split(' ')[0] || '',
        nom: user.name?.split(' ')[1] || '',
        password: await bcrypt.hash(user.password || 'default', 12),
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  getUser: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },
  
  getUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) return null
    return data
  },
  
  getUserByAccount: async ({ providerAccountId, provider }) => {
    // Cette méthode n'est pas nécessaire pour l'authentification par credentials
    return null
  },
  
  updateUser: async (user) => {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...user,
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  deleteUser: async (userId) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    
    if (error) throw error
  },
  
  linkAccount: async (account) => {
    // Cette méthode n'est pas nécessaire pour l'authentification par credentials
    return null
  },
  
  unlinkAccount: async ({ providerAccountId, provider }) => {
    // Cette méthode n'est pas nécessaire pour l'authentification par credentials
  },
  
  createSession: async ({ sessionToken, userId, expires }) => {
    // Stocker la session dans la table users en utilisant email comme identifiant unique
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    // Créer un enregistrement de session simple
    const sessionData = {
      id: sessionToken,
      userId,
      sessionToken,
      expires,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Stocker la session dans un format JSON dans la colonne emailVerified (temporaire)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        emailVerified: JSON.stringify(sessionData),
        updatedAt: new Date().toISOString()
      })
      .eq('email', user.email)
    
    if (updateError) throw updateError
    return sessionData
  },
  
  getSessionAndUser: async (sessionToken) => {
    // Chercher la session dans la table users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('emailVerified', sessionToken)
      .single()
    
    if (error) return null
    
    // Si on trouve un utilisateur avec ce token, créer l'objet session
    const session = {
      id: sessionToken,
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
    }
    
    return { session, user }
  },
  
  updateSession: async ({ sessionToken, ...session }) => {
    // Mettre à jour la session
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('id', session.userId)
      .single()
    
    if (error) throw error
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        emailVerified: JSON.stringify(session),
        updatedAt: new Date().toISOString()
      })
      .eq('email', user.email)
    
    if (updateError) throw updateError
    return session
  },
  
  deleteSession: async (sessionToken) => {
    const { error } = await supabase
      .from('users')
      .update({
        emailVerified: null,
        updatedAt: new Date().toISOString()
      })
      .eq('emailVerified', sessionToken)
    
    if (error) throw error
  },
  
  createVerificationToken: async ({ identifier, expires, token }) => {
    // Stocker le token de vérification dans la colonne emailVerified
    const { error } = await supabase
      .from('users')
      .update({
        emailVerified: JSON.stringify({ identifier, expires, token }),
        updatedAt: new Date().toISOString()
      })
      .eq('email', identifier)
    
    if (error) throw error
    return { identifier, expires, token }
  },
  
  useVerificationToken: async ({ identifier, token }) => {
    const { data, error } = await supabase
      .from('users')
      .select('emailVerified')
      .eq('email', identifier)
      .single()
    
    if (error) return null
    
    try {
      const verificationData = JSON.parse(data.emailVerified || '{}')
      if (verificationData.token === token) {
        return verificationData
      }
    } catch (e) {
      console.error('Error parsing verification token:', e)
    }
    
    return null
  }
}

const authOptions = {
  adapter: customAdapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password, role, prenom, nom, telephone")
          .eq("email", credentials.email)
          .maybeSingle()

        if (error || !user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          prenom: user.prenom,
          nom: user.nom,
          telephone: user.telephone,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.prenom = user.prenom
        token.nom = user.nom
        token.telephone = user.telephone
        token.role = user.role
        token.twoFactorEnabled = user.twoFactorEnabled || false
        token.twoFactorVerified = false
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.prenom = token.prenom as string
        session.user.nom = token.nom as string
        session.user.telephone = token.telephone as string
        session.user.role = token.role as string
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean
        session.user.twoFactorVerified = token.twoFactorVerified as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/connexion",
    newUser: "/inscription"
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here"
}

export { authOptions }
