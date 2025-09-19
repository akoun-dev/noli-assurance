import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import supabaseAdmin from '@/lib/supabase-admin'
import { logAdminAction } from '@/lib/auth-logger'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const role = session.user.role
    if (role !== 'ADMIN' && role !== 'ASSUREUR') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('id')

    if (!offerId) {
      return NextResponse.json({ error: 'ID d\'offre requis' }, { status: 400 })
    }

    const BodySchema = z.object({
      name: z.string().min(2).max(100).optional(),
      coverageLevel: z.string().min(2).max(100).optional(),
      monthlyPrice: z.number().positive().optional(),
      annualPrice: z.number().positive().optional(),
      franchise: z.number().min(0).optional(),
      isActive: z.boolean().optional(),
    })

    const body = BodySchema.parse(await request.json())

    // Vérifier que l'offre existe et appartient à l'assureur
    const { data: existingOffer, error: fetchError } = await supabaseAdmin
      .from('InsuranceOffer')
      .select('*, insurer:insurerId(userId)')
      .eq('id', offerId)
      .single()

    if (fetchError || !existingOffer) {
      return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 })
    }

    // Vérifier les permissions
    if (role === 'ASSUREUR') {
      const { data: insurer, error: insurerError } = await supabaseAdmin
        .from('insurers')
        .select('id')
        .eq('userId', session.user.id)
        .single()

      if (insurerError || !insurer || existingOffer.insurerId !== insurer.id) {
        return NextResponse.json({ error: 'Accès non autorisé à cette offre' }, { status: 403 })
      }
    }

    // Mettre à jour l'offre
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('InsuranceOffer')
      .update(updateData)
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating offer:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'offre' },
        { status: 500 }
      )
    }

    // Journaliser l'activité
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email || '',
      action: 'OFFER_UPDATED',
      target: offerId,
      details: { updateData },
      success: !error,
      request,
    })

    return NextResponse.json({
      success: true,
      offer: data,
    })

  } catch (error) {
    console.error('Error in update offer API:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const role = session.user.role
    if (role !== 'ADMIN' && role !== 'ASSUREUR') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('id')

    if (!offerId) {
      return NextResponse.json({ error: 'ID d\'offre requis' }, { status: 400 })
    }

    // Vérifier que l'offre existe et appartient à l'assureur
    const { data: existingOffer, error: fetchError } = await supabaseAdmin
      .from('InsuranceOffer')
      .select('*, insurer:insurerId(userId)')
      .eq('id', offerId)
      .single()

    if (fetchError || !existingOffer) {
      return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 })
    }

    // Vérifier les permissions
    if (role === 'ASSUREUR') {
      const { data: insurer, error: insurerError } = await supabaseAdmin
        .from('insurers')
        .select('id')
        .eq('userId', session.user.id)
        .single()

      if (insurerError || !insurer || existingOffer.insurerId !== insurer.id) {
        return NextResponse.json({ error: 'Accès non autorisé à cette offre' }, { status: 403 })
      }
    }

    // Supprimer l'offre (soft delete en mettant isActive à false)
    const { data, error } = await supabaseAdmin
      .from('InsuranceOffer')
      .update({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error deleting offer:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'offre' },
        { status: 500 }
      )
    }

    // Journaliser l'activité
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email || '',
      action: 'OFFER_DELETED',
      target: offerId,
      details: { offerName: existingOffer.name },
      success: !error,
      request,
    })

    return NextResponse.json({
      success: true,
      message: 'Offre supprimée avec succès',
    })

  } catch (error) {
    console.error('Error in delete offer API:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}