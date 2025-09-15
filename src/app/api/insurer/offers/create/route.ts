import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { logActivity } from '@/lib/auth-logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'INSURER') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, coverageLevel, monthlyPrice, annualPrice, franchise } = body

    // Validation des données
    if (!name || !coverageLevel || !monthlyPrice || !annualPrice || !franchise) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (typeof monthlyPrice !== 'number' || typeof annualPrice !== 'number' || typeof franchise !== 'number') {
      return NextResponse.json(
        { error: 'Les prix doivent être des nombres' },
        { status: 400 }
      )
    }

    if (monthlyPrice <= 0 || annualPrice <= 0 || franchise < 0) {
      return NextResponse.json(
        { error: 'Les prix doivent être positifs' },
        { status: 400 }
      )
    }

    // Créer l'offre
    const offerData = {
      id: uuidv4(),
      name,
      coverageLevel,
      monthlyPrice,
      annualPrice,
      franchise,
      isActive: true,
      insurerId: session.user.id,
      insurer: {
        name: session.user.name || 'Assureur'
      },
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('insurance_offers')
      .insert([offerData])
      .select()
      .single()

    if (error) {
      console.error('Error creating offer:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'offre' },
        { status: 500 }
      )
    }

    // Journaliser l'activité
    await logActivity({
      userId: session.user.id,
      userEmail: session.user.email || '',
      action: 'OFFER_CREATED',
      actionType: 'INSURER',
      description: `Nouvelle offre créée: ${name}`,
      request: request
    })

    return NextResponse.json({
      success: true,
      offer: data
    })

  } catch (error) {
    console.error('Error in create offer API:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
