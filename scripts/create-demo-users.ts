import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDemoUsers() {
  try {
    // Hasher le mot de passe pour les comptes de démo
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Créer l'utilisateur de démo
    const demoUser = await prisma.user.upsert({
      where: { email: 'user@demo.com' },
      update: {},
      create: {
        email: 'user@demo.com',
        telephone: '+22501020304',
        nom: 'Demo',
        prenom: 'User',
        password: hashedPassword,
        role: 'USER'
      }
    })

    // Créer l'assureur de démo
    const demoInsurer = await prisma.user.upsert({
      where: { email: 'assureur@demo.com' },
      update: {},
      create: {
        email: 'assureur@demo.com',
        telephone: '+22501020305',
        nom: 'Demo',
        prenom: 'Assureur',
        password: hashedPassword,
        role: 'INSURER'
      }
    })

    // Créer l'administrateur de démo
    const demoAdmin = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        email: 'admin@demo.com',
        telephone: '+22501020306',
        nom: 'Demo',
        prenom: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Utilisateurs de démo créés avec succès :')
    console.log('Utilisateur:', demoUser.email, 'Rôle:', demoUser.role)
    console.log('Assureur:', demoInsurer.email, 'Rôle:', demoInsurer.role)
    console.log('Administrateur:', demoAdmin.email, 'Rôle:', demoAdmin.role)
    console.log('Mot de passe pour tous: password123')

  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs de démo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUsers()