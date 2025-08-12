import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
const db: any = supabase
import bcrypt from 'bcryptjs'

interface CreateInsurerData {
  nom: string
  prenom: string
  email: string
  telephone: string
  nomEntreprise: string
  adresseEntreprise: string
  siegeSocial: string
  numeroRegistre: string
  numeroAgrement: string
  domaineActivite: string
  anneeExperience: string
  nombreEmployes: string
  siteWeb: string
  description: string
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier la session et les droits admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les données du formulaire
    const data: CreateInsurerData = await request.json()

    // Valider les données requises
    const requiredFields = [
      'nom', 'prenom', 'email', 'telephone', 'nomEntreprise', 
      'adresseEntreprise', 'siegeSocial', 'numeroRegistre', 'numeroAgrement',
      'domaineActivite', 'anneeExperience', 'nombreEmployes'
    ]

    for (const field of requiredFields) {
      if (!data[field as keyof CreateInsurerData] || data[field as keyof CreateInsurerData].trim() === '') {
        return NextResponse.json(
          { success: false, message: `Le champ ${field} est requis` },
          { status: 400 }
        )
      }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Vérifier si le nom d'entreprise existe déjà
    const existingInsurer = await db.insurer.findUnique({
      where: { nomEntreprise: data.nomEntreprise }
    })

    if (existingInsurer) {
      return NextResponse.json(
        { success: false, message: 'Une compagnie d\'assurance avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Générer un mot de passe temporaire
    const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!'
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12)

    // Créer l'utilisateur assureur
    const newUser = await db.user.create({
      data: {
        email: data.email,
        name: `${data.prenom} ${data.nom}`,
        password: hashedPassword,
        role: 'INSURER',
        telephone: data.telephone,
        emailVerified: new Date(),
      }
    })

    // Créer l'assureur
    const newInsurer = await db.insurer.create({
      data: {
        userId: newUser.id,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        nomEntreprise: data.nomEntreprise,
        adresseEntreprise: data.adresseEntreprise,
        siegeSocial: data.siegeSocial,
        numeroRegistre: data.numeroRegistre,
        numeroAgrement: data.numeroAgrement,
        domaineActivite: data.domaineActivite,
        anneeExperience: data.anneeExperience,
        nombreEmployes: data.nombreEmployes,
        siteWeb: data.siteWeb || null,
        description: data.description || null,
        statut: 'ACTIF',
        dateCreation: new Date(),
      }
    })

    // Ici, vous pourriez ajouter l'envoi d'un email avec les identifiants temporaires
    // Pour l'instant, on retourne le mot de passe temporaire dans la réponse (à enlever en production)
    console.log(`Nouvel assureur créé: ${data.email}, mot de passe temporaire: ${temporaryPassword}`)

    return NextResponse.json({
      success: true,
      message: 'Assureur créé avec succès',
      data: {
        id: newInsurer.id,
        email: newUser.email,
        nomEntreprise: newInsurer.nomEntreprise,
        // En production, ne pas retourner le mot de passe temporaire
        // temporaryPassword: temporaryPassword
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création de l\'assureur:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier la session et les droits admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer tous les assureurs
    const insurers = await db.insurer.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        dateCreation: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: insurers
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des assureurs:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}