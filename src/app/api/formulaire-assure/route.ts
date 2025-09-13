import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAssure } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données avec Zod
    const validatedData = validateAssure(body)
    const { nom, prenom, email, telephone, isWhatsApp } = validatedData

    // Générer un ID unique
    const { v4: uuidv4 } = await import('uuid');
    const assureId = uuidv4();

    console.log('Enregistrement assure avec ID:', assureId);
    
    // Créer ou mettre à jour l'assuré dans la base de données
    const { data: assure, error } = await supabase
      .from('assures')
      .upsert(
        {
          id: assureId,
          nom,
          prenom,
          email,
          telephone,
          isWhatsApp,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (error) {
      throw error
    }

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
    
    // Gestion spécifique des erreurs de validation
    if (error instanceof Error) {
      if (error.message.includes('Validation assuré:')) {
        return NextResponse.json(
          { error: error.message.replace('Validation assuré: ', '') },
          { status: 400 }
        )
      }
    }
    
    // Erreur générique pour éviter de divulguer des informations sensibles
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement' },
      { status: 500 }
    )
  }
}
