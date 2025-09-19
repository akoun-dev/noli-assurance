import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { requireAdminAuthAPI, requireAdminErrorNextResponse } from '@/lib/admin-auth'
import { sanitizeId, sanitizeString, sanitizeRole } from '@/lib/input-sanitization'

interface UpdateUserData {
  nom?: string
  prenom?: string
  email?: string
  telephone?: string
  role?: string
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const userId = sanitizeId(context.params.id)

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('deletedAt', null)
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
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'utilisateur' },
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

    const userId = sanitizeId(context.params.id)
    const data: UpdateUserData = await request.json()

    // Vérifier si l'utilisateur existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .eq('deletedAt', null)
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.nom) updateData.nom = sanitizeString(data.nom, { required: true, maxLength: 100, alphanumeric: true })
    if (data.prenom) updateData.prenom = sanitizeString(data.prenom, { required: true, maxLength: 100, alphanumeric: true })
    if (data.email) {
      updateData.email = sanitizeString(data.email, { required: true, email: true })

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', userId)
        .single()

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }
    if (data.telephone) updateData.telephone = sanitizeString(data.telephone, { required: true, phone: true })
    if (data.role) updateData.role = sanitizeRole(data.role)

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
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

    const userId = sanitizeId(context.params.id)

    // Vérifier si l'utilisateur existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .eq('deletedAt', null)
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Soft delete
    const { error } = await supabase
      .from('users')
      .update({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .eq('id', userId)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}