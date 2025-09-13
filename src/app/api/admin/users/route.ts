import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { softDeleteManager } from '@/lib/soft-delete'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const result = await softDeleteManager.getActive('users', {
      order: { column: 'createdAt', ascending: false }
    })

    if (!result.success) {
      console.error('Error fetching users:', result.error)
      return NextResponse.json(
        { success: false, error: 'Une erreur est survenue lors de la récupération des utilisateurs' },
        { status: 500 }
      )
    }

    const users = result.data

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users - Soft delete d'un utilisateur
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    const result = await softDeleteManager.softDelete('users', userId)

    if (!result.success) {
      console.error('Error soft deleting user:', result.error)
      return NextResponse.json(
        { success: false, error: 'Une erreur est survenue lors de la suppression de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      user: result.data
    })

  } catch (error) {
    console.error('Error soft deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}
