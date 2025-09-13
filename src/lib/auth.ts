import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { logLoginAttempt, logSuccessfulLogin, logError } from './auth-logger'

export const authOptions = {
  // ✅ Adapter Supabase activé
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  secret: process.env.NEXTAUTH_SECRET || "votre-secret-par-defaut-a-changer-en-production",
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        console.log('Tentative de connexion avec:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Email ou mot de passe manquant');
          return null;
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password, role, prenom, nom, telephone")
          .eq("email", credentials.email)
          .maybeSingle()

        if (error) {
          console.error('Erreur Supabase:', error);
          return null;
        }

        if (!user) {
          console.log('Utilisateur non trouvé');
          return null;
        }

        console.log('Utilisateur trouvé:', user.email);

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        )

        if (!isPasswordValid) {
          console.log('Mot de passe invalide');
          return null;
        }

        console.log('Authentification réussie pour:', user.email);

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
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account }) {
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
    },
    async signIn({ user, account, credentials }) {
      // Vérifier si l'utilisateur a le 2FA activé
      if (user && credentials) {
        const { get2FAStatus } = await import('./2fa')
        const twoFactorStatus = await get2FAStatus(user.id)
        
        if (twoFactorStatus.isEnabled) {
          // Rediriger vers la page de vérification 2FA
          return '/verify-2fa?userId=' + user.id
        }
      }
      return true
    }
  },
  pages: {
    signIn: "/connexion",
    newUser: "/inscription"
  },
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth debug:', code, metadata);
    }
  }
}
