import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"
import { logAuthenticationEvent, logSecurityEvent } from "./monitoring"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const authOptions: NextAuthOptions = {
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

        try {
          // Récupérer l'utilisateur depuis la base de données
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            console.error('Erreur lors de la recherche de l\'utilisateur:', error)

            // Logger l'échec de connexion
            await logAuthenticationEvent({
              eventType: 'LOGIN_FAILURE',
              email: credentials.email,
              ipAddress: 'unknown', // Serait récupéré depuis la requête dans une implémentation complète
              userAgent: 'unknown',
              success: false,
              failureReason: 'USER_NOT_FOUND'
            })

            return null
          }

          // Vérifier si l'utilisateur a un mot de passe
          if (!user.password) {
            console.error('L\'utilisateur n\'a pas de mot de passe défini')
            return null
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error('Mot de passe incorrect')

            // Logger l'échec de connexion
            await logAuthenticationEvent({
              eventType: 'LOGIN_FAILURE',
              email: credentials.email,
              ipAddress: 'unknown',
              userAgent: 'unknown',
              success: false,
              failureReason: 'INVALID_PASSWORD'
            })

            return null
          }

          // Vérifier si le 2FA est activé
          const { data: twoFactor } = await supabase
            .from('user_2fa')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_enabled', true)
            .single()

          // Logger la connexion réussie
          await logAuthenticationEvent({
            eventType: 'LOGIN_SUCCESS',
            userId: user.id,
            email: user.email,
            role: user.role,
            ipAddress: 'unknown',
            userAgent: 'unknown',
            success: true,
            twoFactorEnabled: !!twoFactor
          })

          return {
            id: user.id,
            email: user.email,
            name: `${user.prenom} ${user.nom}`,
            prenom: user.prenom,
            nom: user.nom,
            telephone: user.telephone,
            role: user.role,
            twoFactorEnabled: !!twoFactor,
            twoFactorVerified: false,
          }
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.twoFactorEnabled = user.twoFactorEnabled || false
        token.twoFactorVerified = user.twoFactorVerified || false
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean
        session.user.twoFactorVerified = token.twoFactorVerified as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/connexion",
  }
}
