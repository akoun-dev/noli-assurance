import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { requireAdminAuthAPI, requireAdminErrorNextResponse } from '@/lib/admin-auth'
import { sanitizeId, sanitizeString } from '@/lib/input-sanitization'
import { auditService } from '@/lib/audit-service'

interface UpdateQuoteData {
  status?: string
  assignedInsurerId?: string
  notes?: string
}

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'REVIEW', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED']

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const quoteId = sanitizeId(context.params.id)

    const { data: quote, error } = await supabase
      .from('Quote')
      .select(`
        *,
        user:users(id, email, nom, prenom),
        assure:assures(id, email, nom, prenom),
        quoteOffers(
          id,
          selected,
          priceAtQuote,
          offer:offers(id, name, description, insurer:insurers(id, nomEntreprise))
        )
      `)
      .eq('id', quoteId)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: quote
    })

  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du devis' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const session = authResult.session
    const quoteId = sanitizeId(context.params.id)
    const data: UpdateQuoteData = await request.json()

    // Récupérer le devis actuel pour le logging
    const { data: currentQuote, error: fetchError } = await supabase
      .from('Quote')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (fetchError || !currentQuote) {
      return NextResponse.json(
        { success: false, error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.status) {
      if (!VALID_STATUSES.includes(data.status)) {
        return NextResponse.json(
          { success: false, error: 'Statut invalide' },
          { status: 400 }
        )
      }
      updateData.status = data.status
    }

    if (data.assignedInsurerId) {
      // Vérifier si l'assureur existe et est actif
      const { data: insurer } = await supabase
        .from('insurers')
        .select('id')
        .eq('id', data.assignedInsurerId)
        .eq('statut', 'ACTIF')
        .single()

      if (!insurer) {
        return NextResponse.json(
          { success: false, error: 'Assureur invalide ou inactif' },
          { status: 400 }
        )
      }
      updateData.assignedInsurerId = data.assignedInsurerId
    }

    if (data.notes !== undefined) {
      updateData.notes = sanitizeString(data.notes, { maxLength: 1000 })
    }

    const { data: updatedQuote, error } = await supabase
      .from('Quote')
      .update(updateData)
      .eq('id', quoteId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du devis' },
        { status: 500 }
      )
    }

    // Logger l'action
    await auditService.logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      action: 'QUOTE_UPDATED',
      entityType: 'quotes',
      entityId: quoteId,
      description: `Devis mis à jour: ${currentQuote.quoteReference}`,
      oldValues: { status: currentQuote.status, assignedInsurerId: currentQuote.assignedInsurerId },
      newValues: { status: updatedQuote.status, assignedInsurerId: updatedQuote.assignedInsurerId },
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: 'Devis mis à jour avec succès',
      data: updatedQuote
    })

  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du devis' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const session = authResult.session
    const quoteId = sanitizeId(context.params.id)

    // Récupérer le devis avant suppression pour le logging
    const { data: quote, error: fetchError } = await supabase
      .from('Quote')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { success: false, error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    // Soft delete du devis
    const { error } = await supabase
      .from('Quote')
      .update({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .eq('id', quoteId)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du devis' },
        { status: 500 }
      )
    }

    // Logger l'action
    await auditService.logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      action: 'QUOTE_DELETED',
      entityType: 'quotes',
      entityId: quoteId,
      description: `Devis supprimé: ${quote.quoteReference}`,
      oldValues: quote,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: 'Devis supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    )
  }
}