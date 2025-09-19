import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { auditService } from '@/lib/audit-service'

interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
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

    const data: UpdatePasswordData = await request.json()
    const { currentPassword, newPassword, confirmPassword } = data

    // Validation des mots de passe
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Les nouveaux mots de passe ne correspondent pas' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur avec le mot de passe actuel
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', session.user.id)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      // Logger la tentative échouée
      await auditService.logSecurityEvent(
        'PASSWORD_CHANGE_FAILED',
        'Incorrect current password provided',
        session.user.email,
        session.user.id,
        { ip: request.headers.get('x-forwarded-for') }
      )

      return NextResponse.json(
        { success: false, error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du mot de passe' },
        { status: 500 }
      )
    }

    // Logger le changement de mot de passe réussi
    await auditService.logSecurityEvent(
      'PASSWORD_CHANGED',
      'User password changed successfully',
      session.user.email,
      session.user.id,
      { ip: request.headers.get('x-forwarded-for') }
    )

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    })

  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du mot de passe' },
      { status: 500 }
    )
  }
}