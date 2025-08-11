import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userRole = session.user.role

    switch (userRole) {
      case 'USER':
        // Stats pour les utilisateurs
        const [userQuotesCount, acceptedQuotesCount, totalInsurers] = await Promise.all([
          db.quote.count({
            where: {
              userId: session.user.id,
              status: { in: ['pending', 'sent'] }
            }
          }),
          db.quote.count({
            where: {
              userId: session.user.id,
              status: 'converted'
            }
          }),
          db.insurer.count({
            where: { isActive: true }
          })
        ])

        const recentQuotes = await db.quote.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            quoteReference: true,
            status: true,
            createdAt: true,
            nom: true,
            prenom: true
          }
        })

        return NextResponse.json({
          stats: {
            pendingQuotes: userQuotesCount,
            acceptedQuotes: acceptedQuotesCount,
            savingsRate: 15, // Calculé dynamiquement dans une vraie application
            totalInsurers
          },
          recentQuotes
        })

      case 'INSURER':
        // Stats pour les assureurs
        const [activeOffersCount, receivedQuotesCount, conversionRate, monthlyRevenue] = await Promise.all([
          db.insuranceOffer.count({
            where: { isActive: true }
          }),
          db.quote.count({
            where: {
              status: { in: ['pending', 'sent', 'contacted'] }
            }
          }),
          db.quote.aggregate({
            where: {
              status: 'converted'
            },
            _count: { id: true }
          }),
          db.quote.aggregate({
            where: {
              status: 'converted',
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            },
            _sum: {
              // Ceci serait calculé différemment dans une vraie application
              // basé sur les prix des offres acceptées
            }
          })
        ])

        const totalQuotes = await db.quote.count()
        const calculatedConversionRate = totalQuotes > 0 
          ? Math.round((conversionRate._count.id / totalQuotes) * 100) 
          : 0

        const recentReceivedQuotes = await db.quote.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            quoteReference: true,
            status: true,
            createdAt: true,
            nom: true,
            prenom: true
          }
        })

        return NextResponse.json({
          stats: {
            activeOffers: activeOffersCount,
            receivedQuotes: receivedQuotesCount,
            conversionRate: calculatedConversionRate,
            monthlyRevenue: '2.4M' // Valeur fictive
          },
          recentQuotes: recentReceivedQuotes
        })

      case 'ADMIN':
        // Stats pour les administrateurs
        const [totalUsers, activeInsurers, totalQuotesGenerated, adminConversionRate] = await Promise.all([
          db.user.count(),
          db.insurer.count({ where: { isActive: true } }),
          db.quote.count(),
          db.quote.aggregate({
            where: {
              status: 'converted'
            },
            _count: { id: true }
          })
        ])

        const totalQuotesCount = await db.quote.count()
        const calculatedAdminConversionRate = totalQuotesCount > 0 
          ? Math.round((adminConversionRate._count.id / totalQuotesCount) * 100) 
          : 0

        // Stats du mois dernier pour comparaison
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        
        const [lastMonthUsers, lastMonthQuotes] = await Promise.all([
          db.user.count({
            where: {
              createdAt: {
                gte: lastMonth,
                lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }),
          db.quote.count({
            where: {
              createdAt: {
                gte: lastMonth,
                lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          })
        ])

        return NextResponse.json({
          stats: {
            totalUsers,
            activeInsurers,
            totalQuotesGenerated,
            conversionRate: calculatedAdminConversionRate,
            lastMonthUsers,
            lastMonthQuotes
          }
        })

      default:
        return NextResponse.json({ error: 'Rôle non reconnu' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des stats du dashboard:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}