import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import supabaseAdmin from '@/lib/supabase-admin'
import { logAdminAction } from '@/lib/auth-logger'
import { requireAssureurAuth, validateAssureurInput } from '@/lib/assureur-security'
import { assureurLogger, AssureurEventType } from '@/lib/assureur-logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // Validation stricte du payload
    const BodySchema = z.object({
      name: z.string().min(2).max(100),
      coverageLevel: z.string().min(2).max(100),
      monthlyPrice: z.number().positive(),
      annualPrice: z.number().positive(),
      franchise: z.number().min(0),
      insurerId: z.string().uuid().optional(), // requis si ADMIN
    })

    const rawData = await request.json()
    const validationResult = validateAssureurInput(rawData, BodySchema)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error, details: validationResult.details },
        { status: 400 }
      )
    }

    const body = validationResult.data

    // Vérifier l'authentification et les permissions
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const role = session.user.role
    if (role !== 'ADMIN' && role !== 'ASSUREUR') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Déterminer l'assureur cible
    let insurerId: string
    if (role === 'ADMIN') {
      if (!body.insurerId) {
        return NextResponse.json({ error: 'insurerId requis pour ADMIN' }, { status: 400 })
      }
      // Vérifier l'existence de l'assureur
      const { data: insurer, error: insurerErr } = await supabaseAdmin
        .from('insurers')
        .select('id')
        .eq('id', body.insurerId)
        .single()
      if (insurerErr || !insurer) {
        return NextResponse.json({ error: "Assureur introuvable" }, { status: 404 })
      }
      insurerId = insurer.id
    } else {
      // ASSUREUR: retrouver son insurerId via userId
      const { data: insurer, error: insurerErr } = await supabaseAdmin
        .from('insurers')
        .select('id')
        .eq('userId', session.user.id)
        .single()
      if (insurerErr || !insurer) {
        return NextResponse.json({ error: "Profil assureur introuvable" }, { status: 403 })
      }
      insurerId = insurer.id
    }

    // Créer l'offre
    const offerData = {
      id: uuidv4(),
      name: body.name,
      coverageLevel: body.coverageLevel,
      monthlyPrice: body.monthlyPrice,
      annualPrice: body.annualPrice,
      franchise: body.franchise,
      isActive: true,
      insurerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('InsuranceOffer')
      .insert([offerData])
      .select()
      .single()

    if (error) {
      console.error('Error creating offer:', error)

      // Logger l'échec
      await assureurLogger.logOfferEvent(
        session.user.id,
        insurerId,
        AssureurEventType.OFFER_CREATED,
        undefined,
        false,
        { error: error.message, requestBody: body }
      )

      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'offre' },
        { status: 500 }
      )
    }

    // Journaliser l'activité (ancien système)
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email || '',
      action: 'OFFER_CREATED',
      target: data?.id,
      details: { insurerId, name: offerData.name },
      success: !error,
      request,
    })

    // Logger l'événement de création d'offre
    const duration = Date.now() - startTime
    await assureurLogger.logOfferEvent(
      session.user.id,
      insurerId,
      AssureurEventType.OFFER_CREATED,
      data?.id,
      true,
      {
        offerName: offerData.name,
        coverageLevel: offerData.coverageLevel,
        monthlyPrice: offerData.monthlyPrice,
        requestBody: body
      },
      duration
    )

    // Logger l'appel API réussi
    await assureurLogger.logApiEvent(
      session.user.id,
      insurerId,
      '/api/insurer/offers/create',
      'POST',
      true,
      duration,
      { offerId: data?.id }
    )

    return NextResponse.json(
      {
        success: true,
        offer: data,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in create offer API:', error)

    // Logger l'erreur critique
    const duration = Date.now() - startTime
    await assureurLogger.log({
      userId: 'unknown',
      insurerId: 'unknown',
      eventType: AssureurEventType.API_CALL_ERROR,
      level: 'ERROR',
      message: 'Erreur critique dans la création d\'offre',
      details: {
        error: error.message,
        stack: error.stack,
        requestBody: await request.json().catch(() => 'unavailable')
      },
      metadata: {
        ipAddress: clientIp,
        userAgent: userAgent
      },
      success: false,
      duration
    })

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
