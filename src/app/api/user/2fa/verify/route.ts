import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAndEnable2FA } from '@/lib/2fa'

// POST /api/user/2fa/verify - Vérifier et activer le 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token 2FA requis' }, { status: 400 })
    }

    const result = await verifyAndEnable2FA(session.user.id, token)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: '2FA activé avec succès',
      user: result.user
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du 2FA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
