import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generate2FASetup } from '@/lib/2fa'

// POST /api/user/2fa/setup - Générer une configuration 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const setup = await generate2FASetup(session.user.id, session.user.email || '')

    return NextResponse.json({
      success: true,
      setup
    })

  } catch (error) {
    console.error('Erreur lors de la génération de la configuration 2FA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
