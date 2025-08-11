import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { nom, prenom, email, telephone, password, role = 'USER' } = await request.json()

    // Validation des champs requis
    if (!nom || !prenom || !email || !telephone || !password) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Vérifier si le téléphone existe déjà
    const existingUserByPhone = await prisma.user.findUnique({
      where: { telephone }
    })

    if (existingUserByPhone) {
      return NextResponse.json(
        { success: false, error: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        password: hashedPassword,
        role
      }
    })

    // Retourner une réponse sans le mot de passe
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Compte créé avec succès'
    })

  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    )
  }
}