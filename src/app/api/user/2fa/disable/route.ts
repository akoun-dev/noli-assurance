import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { disable2FA } from '@/lib/2fa'

// POST /api/user/2fa/disable - Désactiver le 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const result = await disable2FA(session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '2FA désactivé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la désactivation du 2FA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
