import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'INSURER') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const offers = await prisma.insuranceOffer.findMany({
      include: {
        insurer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      offers
    })

  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la récupération des offres' },
      { status: 500 }
    )
  }
}