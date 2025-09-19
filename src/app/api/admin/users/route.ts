import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { softDeleteManager } from '@/lib/soft-delete'
import { requireAdminAuthAPI, requireAdminErrorNextResponse } from '@/lib/admin-auth'
import { sanitizeId } from '@/lib/input-sanitization'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const session = authResult.session

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
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const session = authResult.session

    const { searchParams } = new URL(request.url)
    const userId = sanitizeId(searchParams.get('userId'))

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
