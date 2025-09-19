import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { requireAdminAuthAPI, requireAdminErrorNextResponse } from '@/lib/admin-auth'
import { sanitizeInsurerData, sanitizeId } from '@/lib/input-sanitization'

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
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const session = authResult.session

    // Récupérer et nettoyer les données du formulaire
    const rawData: CreateInsurerData = await request.json()
    const data = sanitizeInsurerData(rawData)

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Vérifier si le nom d'entreprise existe déjà
    const { data: existingInsurer } = await supabase
      .from('insurers')
      .select('id')
      .eq('nomEntreprise', data.nomEntreprise)
      .maybeSingle()

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
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        password: hashedPassword,
        role: 'ASSUREUR',
        telephone: data.telephone,
        emailVerified: new Date()
      })
      .select()
      .single()

    if (userError) throw userError

    // Créer l'assureur
    const { data: newInsurer, error: insurerError } = await supabase
      .from('insurers')
      .insert({
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
        updatedAt: new Date()
      })
      .select()
      .single()

    if (insurerError) throw insurerError

    // TODO: Implémenter l'envoi d'un email sécurisé avec les identifiants temporaires
    // Le mot de passe temporaire ne doit jamais être exposé dans les logs ou les réponses API

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
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const session = authResult.session

    // Récupérer tous les assureurs
    const { data: insurers, error } = await supabase
      .from('insurers')
      .select('*, user:users(id, email, createdAt)')
      .order('dateCreation', { ascending: false })

    if (error) throw error

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