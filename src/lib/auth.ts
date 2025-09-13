import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

const authOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
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
  }
}

export { authOptions }
