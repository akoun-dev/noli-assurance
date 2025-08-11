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

    // Définition des types
    type MonthlyStat = {
      month: string
      quotes: number
      accepted: number
    }

    type TopOffer = {
      name: string
      quotes: number
      conversion: number
    }

    type StatsBase = {
      totalQuotes: number
      acceptedQuotes: number
      conversionRate: number
      revenue: string
      monthlyGrowth: number
      avgResponseTime: string
    }

    type AdminStats = StatsBase & {
      totalUsers: number
      activeInsurers: number
      lastMonthUsers: number
    }

    type CommonStats = {
      stats: StatsBase | AdminStats
      monthlyData: MonthlyStat[]
      topOffers: TopOffer[]
    }

    // Format commun pour toutes les statistiques
    const getCommonStats = async (): Promise<CommonStats> => {
      const [totalQuotes, acceptedQuotes] = await Promise.all([
        db.quote.count(),
        db.quote.count({ where: { status: 'converted' } })
      ])

      // Calcul du taux de conversion
      const conversionRate = totalQuotes > 0
        ? parseFloat(((acceptedQuotes / totalQuotes) * 100).toFixed(1))
        : 0

      // Calcul du chiffre d'affaires (exemple simplifié)
      const revenueResult = await db.quoteOffer.aggregate({
        where: { selected: true },
        _sum: { priceAtQuote: true }
      })
      const revenue = revenueResult._sum.priceAtQuote
        ? `${(revenueResult._sum.priceAtQuote / 1000000).toFixed(1)}M`
        : '0'

      // Données mensuelles (6 derniers mois)
      const monthlyData = await getMonthlyStats()

      // Offres les plus populaires
      const topOffers = await getTopOffers()

      return {
        stats: {
          totalQuotes,
          acceptedQuotes,
          conversionRate,
          revenue,
          monthlyGrowth: 15.2, // À calculer
          avgResponseTime: '2.3h' // À calculer
        },
        monthlyData,
        topOffers
      }
    }

    const getMonthlyStats = async (): Promise<MonthlyStat[]> => {
      const months: MonthlyStat[] = []
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        
        const [quotes, accepted] = await Promise.all([
          db.quote.count({
            where: { createdAt: { gte: startDate, lte: endDate } }
          }),
          db.quote.count({
            where: {
              createdAt: { gte: startDate, lte: endDate },
              status: 'converted'
            }
          })
        ])

        const monthStat: MonthlyStat = {
          month: startDate.toLocaleString('fr-FR', { month: 'short' }),
          quotes,
          accepted
        }
        months.push(monthStat)
      }

      return months
    }

    const getTopOffers = async () => {
      const offers = await db.insuranceOffer.findMany({
        take: 3,
        orderBy: { quoteOffers: { _count: 'desc' } },
        select: {
          name: true,
          _count: { select: { quoteOffers: true } }
        }
      })

      return offers.map(offer => ({
        name: offer.name,
        quotes: offer._count.quoteOffers,
        conversion: Math.floor(Math.random() * 30) + 10 // À remplacer par un vrai calcul
      }))
    }

    switch (userRole) {
      case 'USER':
      case 'INSURER':
      case 'ADMIN':
        const commonStats = await getCommonStats()
        
        if (userRole === 'ADMIN') {
          const [totalUsers, activeInsurers, lastMonthUsers] = await Promise.all([
            db.user.count(),
            db.insuranceOffer.count({ where: { isActive: true } }),
            db.user.count({
              where: {
                createdAt: {
                  gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
              }
            })
          ])
          
          return NextResponse.json({
            ...commonStats,
            stats: {
              ...commonStats.stats,
              totalUsers,
              activeInsurers,
              lastMonthUsers
            }
          })
        }
        
        return NextResponse.json(commonStats)

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