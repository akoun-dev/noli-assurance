import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter(supabase) as any,
  secret: process.env.NEXTAUTH_SECRET || "votre-secret-par-defaut-a-changer-en-production",
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
          .select("*")
          .eq("email", credentials.email)
          .single()

        if (error || !user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ""
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
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.prenom = user.prenom
        token.nom = user.nom
        token.telephone = user.telephone
        token.role = user.role
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
      }
      return session
    }
  },
  pages: {
    signIn: "/connexion",
    signUp: "/inscription"
  }
}