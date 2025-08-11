import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      prenom: string
      nom: string
      telephone: string
      role: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    prenom: string
    nom: string
    telephone: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string
    prenom: string
    nom: string
    telephone: string
    role: string
  }
}