import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { validateRegister } from '@/lib/validations'
import { logRegistrationAttempt, logSuccessfulRegistration, logSuspiciousActivity } from '@/lib/auth-logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données d'entrée avec Zod
    const validatedData = validateRegister(body)
    const { nom, prenom, email, telephone, password, role = 'USER' } = validatedData

    const { data: existingUserByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    const { data: existingUserByPhone } = await supabase
      .from('users')
      .select('id')
      .eq('telephone', telephone)
      .single()

    if (existingUserByPhone) {
      return NextResponse.json(
        { success: false, error: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        nom,
        prenom,
        email,
        telephone,
        password: hashedPassword,
        role
      })
      .select('id, nom, prenom, email, telephone, role')
      .single()

    if (error) {
      console.error('Error during registration:', error)
      return NextResponse.json(
        { success: false, error: "Une erreur est survenue lors de l'inscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Compte créé avec succès'
    })
  } catch (error) {
    console.error('Error during registration:', error)
    
    // Gestion des erreurs de validation
    if (error instanceof Error) {
      if (error.message.includes('Validation inscription:')) {
        return NextResponse.json(
          { success: false, error: error.message.replace('Validation inscription: ', '') },
          { status: 400 }
        )
      }
    }
    
    // Erreur générique pour éviter de divulguer des informations sensibles
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    )
  }
}
