import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const quotes = await prisma.quote.findMany({
      where: {
        userId: session.user?.id
      },
      include: {
        quoteOffers: {
          include: {
            offer: {
              include: {
                insurer: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      quotes
    })

  } catch (error) {
    console.error('Error fetching user quotes:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la récupération des devis' },
      { status: 500 }
    )
  }
}