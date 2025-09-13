import { NextRequest, NextResponse } from 'next/server'
import getServerSession from 'next-auth'
import { authOptions } from '@/lib/auth'
import { regenerateBackupCodes } from '@/lib/2fa'

// POST /api/user/2fa/backup-codes - Régénérer les codes de secours
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const result = await regenerateBackupCodes(session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Codes de secours régénérés avec succès',
      backupCodes: result.backupCodes
    })

  } catch (error) {
    console.error('Erreur lors de la régénération des codes de secours:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
