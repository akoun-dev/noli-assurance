import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { softDeleteManager } from '@/lib/soft-delete'

// GET /api/admin/quotes/soft-delete - Récupérer les devis supprimés
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

    const result = await softDeleteManager.getDeleted('Quote', {
      limit,
      range: { from: offset, to: offset + limit - 1 },
      order: { column: 'deleted_at', ascending: false }
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Compter le total pour la pagination
    const countResult = await softDeleteManager.countDeleted('Quote')
    const total = countResult.success ? countResult.data?.count || 0 : 0

    return NextResponse.json({
      quotes: result.data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des devis supprimés:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/quotes/soft-delete - Restaurer un devis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { quoteId } = await request.json()

    if (!quoteId) {
      return NextResponse.json({ error: 'ID devis requis' }, { status: 400 })
    }

    const result = await softDeleteManager.restore('Quote', quoteId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Devis restauré avec succès',
      quote: result.data 
    })
  } catch (error) {
    console.error('Erreur lors de la restauration du devis:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/quotes/soft-delete - Supprimer définitivement des devis
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const quoteId = searchParams.get('quoteId')
    const cleanupOld = searchParams.get('cleanupOld') === 'true'
    const daysOld = parseInt(searchParams.get('daysOld') || '30')

    let result

    if (quoteId) {
      // Supprimer un devis spécifique
      result = await softDeleteManager.hardDelete('Quote', quoteId)
    } else if (cleanupOld) {
      // Nettoyer les anciens devis supprimés
      result = await softDeleteManager.cleanupOldDeleted('Quote', daysOld)
    } else {
      // Supprimer tous les devis marqués comme supprimés
      result = await softDeleteManager.hardDelete('Quote')
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
