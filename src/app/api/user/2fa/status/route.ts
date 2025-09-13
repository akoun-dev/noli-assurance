import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { get2FAStatus } from '@/lib/2fa'

// GET /api/user/2fa/status - Récupérer le statut 2FA
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const status = await get2FAStatus(session.user.id)

    return NextResponse.json({
      success: true,
      status
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du statut 2FA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
