import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { softDeleteManager } from '@/lib/soft-delete'

// GET /api/admin/insurers/soft-delete - Récupérer les assureurs supprimés
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

    const result = await softDeleteManager.getDeleted('insurers', {
      limit,
      range: { from: offset, to: offset + limit - 1 },
      order: { column: 'deleted_at', ascending: false }
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Compter le total pour la pagination
    const countResult = await softDeleteManager.countDeleted('insurers')
    const total = countResult.success ? countResult.data?.count || 0 : 0

    return NextResponse.json({
      insurers: result.data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des assureurs supprimés:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/insurers/soft-delete - Restaurer un assureur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { insurerId } = await request.json()

    if (!insurerId) {
      return NextResponse.json({ error: 'ID assureur requis' }, { status: 400 })
    }

    const result = await softDeleteManager.restore('insurers', insurerId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Assureur restauré avec succès',
      insurer: result.data 
    })
  } catch (error) {
    console.error('Erreur lors de la restauration de l\'assureur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/insurers/soft-delete - Supprimer définitivement des assureurs
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const insurerId = searchParams.get('insurerId')
    const cleanupOld = searchParams.get('cleanupOld') === 'true'
    const daysOld = parseInt(searchParams.get('daysOld') || '30')

    let result

    if (insurerId) {
      // Supprimer un assureur spécifique
      result = await softDeleteManager.hardDelete('insurers', insurerId)
    } else if (cleanupOld) {
      // Nettoyer les anciens assureurs supprimés
      result = await softDeleteManager.cleanupOldDeleted('insurers', daysOld)
    } else {
      // Supprimer tous les assureurs marqués comme supprimés
      result = await softDeleteManager.hardDelete('insurers')
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
