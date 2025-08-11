import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { nom, prenom, email, telephone, isWhatsApp } = body

    // Validation des données
    if (!nom || !prenom || !email || !telephone) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'L\'email n\'est pas valide' },
        { status: 400 }
      )
    }

    // Validation du numéro de téléphone
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(telephone)) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone n\'est pas valide' },
        { status: 400 }
      )
    }

    // Créer ou mettre à jour l'assuré dans la base de données
    const assure = await db.assure.upsert({
      where: { email },
      update: {
        nom,
        prenom,
        telephone,
        isWhatsApp,
        updatedAt: new Date()
      },
      create: {
        nom,
        prenom,
        email,
        telephone,
        isWhatsApp,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Informations de l\'assuré enregistrées avec succès',
      assure: {
        id: assure.id,
        nom: assure.nom,
        prenom: assure.prenom,
        email: assure.email,
        telephone: assure.telephone,
        isWhatsApp: assure.isWhatsApp
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'assuré:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement' },
      { status: 500 }
    )
  }
}