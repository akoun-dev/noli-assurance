import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { softDeleteManager } from '@/lib/soft-delete'

// GET /api/admin/users/soft-delete - Récupérer les utilisateurs supprimés
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const result = await softDeleteManager.getDeleted('users', {
      limit,
      range: { from: offset, to: offset + limit - 1 },
      order: { column: 'deleted_at', ascending: false }
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Compter le total pour la pagination
    const countResult = await softDeleteManager.countDeleted('users')
    const total = countResult.success ? countResult.data?.count || 0 : 0

    return NextResponse.json({
      users: result.data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs supprimés:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/soft-delete - Restaurer un utilisateur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    const result = await softDeleteManager.restore('users', userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Utilisateur restauré avec succès',
      user: result.data 
    })
  } catch (error) {
    console.error('Erreur lors de la restauration de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/soft-delete - Supprimer définitivement des utilisateurs
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const cleanupOld = searchParams.get('cleanupOld') === 'true'
    const daysOld = parseInt(searchParams.get('daysOld') || '30')

    let result

    if (userId) {
      // Supprimer un utilisateur spécifique
      result = await softDeleteManager.hardDelete('users', userId)
    } else if (cleanupOld) {
      // Nettoyer les anciens utilisateurs supprimés
      result = await softDeleteManager.cleanupOldDeleted('users', daysOld)
    } else {
      // Supprimer tous les utilisateurs marqués comme supprimés
      result = await softDeleteManager.hardDelete('users')
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Suppression définitive effectuée avec succès',
      data: result.data 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression définitive:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
