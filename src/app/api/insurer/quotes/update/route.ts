import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import supabaseAdmin from '@/lib/supabase-admin'
import { logAdminAction } from '@/lib/auth-logger'

const validStatuses = ['pending', 'sent', 'contacted', 'converted', 'cancelled']

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
    const quoteId = searchParams.get('id')

    if (!quoteId) {
      return NextResponse.json({ error: 'ID de devis requis' }, { status: 400 })
    }

    const BodySchema = z.object({
      status: z.enum(['pending', 'sent', 'contacted', 'converted', 'cancelled']),
      notes: z.string().optional(),
    })

    const body = BodySchema.parse(await request.json())

    // Vérifier que le devis existe
    const { data: existingQuote, error: fetchError } = await supabaseAdmin
      .from('Quote')
      .select(`
        *,
        quoteOffers(
          *,
          offer(
            insurerId
          )
        )
      `)
      .eq('id', quoteId)
      .single()

    if (fetchError || !existingQuote) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    // Vérifier que le devis est lié à une offre de l'assureur
    if (role === 'ASSUREUR') {
      const { data: insurer, error: insurerError } = await supabaseAdmin
        .from('insurers')
        .select('id')
        .eq('userId', session.user.id)
        .single()

      if (insurerError || !insurer) {
        return NextResponse.json({ error: 'Profil assureur introuvable' }, { status: 403 })
      }

      const hasAccess = existingQuote.quoteOffers?.some((qo: any) =>
        qo.offer?.insurerId === insurer.id
      )

      if (!hasAccess) {
        return NextResponse.json({ error: 'Accès non autorisé à ce devis' }, { status: 403 })
      }
    }

    // Mettre à jour le statut du devis
    const updateData = {
      status: body.status,
      updatedAt: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('Quote')
      .update(updateData)
      .eq('id', quoteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating quote status:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du devis' },
        { status: 500 }
      )
    }

    // Journaliser l'activité
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email || '',
      action: 'QUOTE_STATUS_UPDATED',
      target: quoteId,
      details: {
        oldStatus: existingQuote.status,
        newStatus: body.status,
        notes: body.notes
      },
      success: !error,
      request,
    })

    return NextResponse.json({
      success: true,
      quote: data,
    })

  } catch (error) {
    console.error('Error in update quote status API:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}