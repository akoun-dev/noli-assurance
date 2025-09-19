import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { requireAdminAuthAPI, requireAdminErrorNextResponse } from '@/lib/admin-auth'
import { sanitizeId, sanitizeString } from '@/lib/input-sanitization'
import { auditService } from '@/lib/audit-service'

interface UpdateInsurerData {
  nom?: string
  prenom?: string
  email?: string
  telephone?: string
  nomEntreprise?: string
  adresseEntreprise?: string
  siegeSocial?: string
  numeroRegistre?: string
  numeroAgrement?: string
  domaineActivite?: string
  anneeExperience?: string
  nombreEmployes?: string
  siteWeb?: string
  description?: string
  statut?: string
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const insurerId = sanitizeId(context.params.id)

    const { data: insurer, error } = await supabase
      .from('insurers')
      .select('*, user:users(id, email, createdAt)')
      .eq('id', insurerId)
      .eq('deletedAt', null)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Assureur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: insurer
    })

  } catch (error) {
    console.error('Error fetching insurer:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'assureur' },
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
    const insurerId = sanitizeId(context.params.id)
    const data: UpdateInsurerData = await request.json()

    // Récupérer l'assureur actuel pour le logging
    const { data: currentInsurer, error: fetchError } = await supabase
      .from('insurers')
      .select('*')
      .eq('id', insurerId)
      .eq('deletedAt', null)
      .single()

    if (fetchError || !currentInsurer) {
      return NextResponse.json(
        { success: false, error: 'Assureur non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      updatedAt: new Date()
    }

    // Valider et nettoyer chaque champ
    if (data.nom) updateData.nom = sanitizeString(data.nom, { required: true, maxLength: 100, alphanumeric: true })
    if (data.prenom) updateData.prenom = sanitizeString(data.prenom, { required: true, maxLength: 100, alphanumeric: true })
    if (data.email) {
      updateData.email = sanitizeString(data.email, { required: true, email: true })

      // Vérifier si l'email est déjà utilisé par un autre assureur
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', currentInsurer.userId)
        .single()

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }

      // Mettre à jour aussi l'email dans la table users
      await supabase
        .from('users')
        .update({ email: updateData.email })
        .eq('id', currentInsurer.userId)
    }
    if (data.telephone) updateData.telephone = sanitizeString(data.telephone, { required: true, phone: true })
    if (data.nomEntreprise) updateData.nomEntreprise = sanitizeString(data.nomEntreprise, { required: true, maxLength: 200 })
    if (data.adresseEntreprise) updateData.adresseEntreprise = sanitizeString(data.adresseEntreprise, { required: true, maxLength: 500 })
    if (data.siegeSocial) updateData.siegeSocial = sanitizeString(data.siegeSocial, { required: true, maxLength: 500 })
    if (data.numeroRegistre) updateData.numeroRegistre = sanitizeString(data.numeroRegistre, { required: true, maxLength: 50, alphanumeric: true })
    if (data.numeroAgrement) updateData.numeroAgrement = sanitizeString(data.numeroAgrement, { required: true, maxLength: 50, alphanumeric: true })
    if (data.domaineActivite) updateData.domaineActivite = sanitizeString(data.domaineActivite, { required: true, maxLength: 100 })
    if (data.anneeExperience) updateData.anneeExperience = sanitizeString(data.anneeExperience, { required: true, numeric: true })
    if (data.nombreEmployes) updateData.nombreEmployes = sanitizeString(data.nombreEmployes, { required: true, numeric: true })
    if (data.siteWeb) updateData.siteWeb = sanitizeString(data.siteWeb || '', { maxLength: 200 })
    if (data.description) updateData.description = sanitizeString(data.description || '', { maxLength: 1000 })
    if (data.statut) {
      const validStatus = ['ACTIF', 'INACTIF', 'SUSPENDU']
      if (!validStatus.includes(data.statut)) {
        return NextResponse.json(
          { success: false, error: 'Statut invalide' },
          { status: 400 }
        )
      }
      updateData.statut = data.statut
    }

    const { data: updatedInsurer, error } = await supabase
      .from('insurers')
      .update(updateData)
      .eq('id', insurerId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de l\'assureur' },
        { status: 500 }
      )
    }

    // Logger l'action
    await auditService.logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      action: 'INSURER_UPDATED',
      entityType: 'insurers',
      entityId: insurerId,
      description: `Assureur mis à jour: ${currentInsurer.nomEntreprise}`,
      oldValues: currentInsurer,
      newValues: updatedInsurer,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: 'Assureur mis à jour avec succès',
      data: updatedInsurer
    })

  } catch (error) {
    console.error('Error updating insurer:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'assureur' },
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
    const insurerId = sanitizeId(context.params.id)

    // Récupérer l'assureur avant suppression pour le logging
    const { data: insurer, error: fetchError } = await supabase
      .from('insurers')
      .select('*, user:users(id, email)')
      .eq('id', insurerId)
      .eq('deletedAt', null)
      .single()

    if (fetchError || !insurer) {
      return NextResponse.json(
        { success: false, error: 'Assureur non trouvé' },
        { status: 404 }
      )
    }

    // Soft delete de l'assureur
    const { error: deleteInsurerError } = await supabase
      .from('insurers')
      .update({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .eq('id', insurerId)

    if (deleteInsurerError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de l\'assureur' },
        { status: 500 }
      )
    }

    // Soft delete de l'utilisateur associé
    const { error: deleteUserError } = await supabase
      .from('users')
      .update({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .eq('id', insurer.userId)

    if (deleteUserError) {
      // Log l'erreur mais continuer
      console.error('Error deleting associated user:', deleteUserError)
    }

    // Logger l'action
    await auditService.logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      action: 'INSURER_DELETED',
      entityType: 'insurers',
      entityId: insurerId,
      description: `Assureur supprimé: ${insurer.nomEntreprise}`,
      oldValues: insurer,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: 'Assureur supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting insurer:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'assureur' },
      { status: 500 }
    )
  }
}