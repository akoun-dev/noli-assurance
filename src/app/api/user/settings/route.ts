import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { sanitizeString } from '@/lib/input-sanitization'
import { auditService } from '@/lib/audit-service'

interface UpdateSettingsData {
  nom?: string
  prenom?: string
  telephone?: string
  notifications?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  preferences?: {
    language: string
    theme: string
    timezone: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, nom, prenom, telephone, role, createdAt, updatedAt')
      .eq('id', session.user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const data: UpdateSettingsData = await request.json()
    const userId = session.user.id

    // Récupérer l'utilisateur actuel pour le logging
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      updatedAt: new Date()
    }

    // Valider et nettoyer chaque champ
    if (data.nom) {
      updateData.nom = sanitizeString(data.nom, { required: true, maxLength: 100, alphanumeric: true })
    }

    if (data.prenom) {
      updateData.prenom = sanitizeString(data.prenom, { required: true, maxLength: 100, alphanumeric: true })
    }

    if (data.telephone) {
      updateData.telephone = sanitizeString(data.telephone, { required: true, phone: true })
    }

    // Pour les assureurs, mettre à jour aussi leur table spécifique
    if (session.user.role === 'ASSUREUR') {
      const insurerUpdateData: any = {}

      if (data.nom) insurerUpdateData.nom = updateData.nom
      if (data.prenom) insurerUpdateData.prenom = updateData.prenom
      if (data.telephone) insurerUpdateData.telephone = updateData.telephone

      if (Object.keys(insurerUpdateData).length > 0) {
        insurerUpdateData.updatedAt = new Date()

        await supabase
          .from('insurers')
          .update(insurerUpdateData)
          .eq('userId', userId)
      }
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour des paramètres' },
        { status: 500 }
      )
    }

    // Logger l'action
    await auditService.logAdminAction({
      userId,
      userEmail: session.user.email,
      userRole: session.user.role,
      action: 'SETTINGS_UPDATED',
      entityType: 'users',
      entityId: userId,
      description: 'User settings updated',
      oldValues: {
        nom: currentUser.nom,
        prenom: currentUser.prenom,
        telephone: currentUser.telephone
      },
      newValues: {
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        telephone: updatedUser.telephone
      },
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      data: updatedUser
    })

  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}