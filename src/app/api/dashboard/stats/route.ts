import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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
      const [totalQuotesResult, acceptedQuotesResult] = await Promise.all([
        supabase
          .from('Quote')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('Quote')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'converted')
      ])
      const totalQuotes = totalQuotesResult.count || 0
      const acceptedQuotes = acceptedQuotesResult.count || 0

      // Calcul du taux de conversion
      const conversionRate = totalQuotes > 0
        ? parseFloat(((acceptedQuotes / totalQuotes) * 100).toFixed(1))
        : 0

      // Calcul du chiffre d'affaires (exemple simplifié)
      const { data: revenueRows } = await supabase
        .from('QuoteOffer')
        .select('priceAtQuote')
        .eq('selected', true)
      const revenueTotal = (revenueRows || []).reduce(
        (sum, row) => sum + (row.priceAtQuote || 0),
        0
      )
      const revenue = revenueTotal
        ? `${(revenueTotal / 1000000).toFixed(1)}M`
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
        
        const [quoteResult, acceptedResult] = await Promise.all([
          supabase
            .from('Quote')
            .select('*', { count: 'exact', head: true })
            .gte('createdAt', startDate.toISOString())
            .lte('createdAt', endDate.toISOString()),
          supabase
            .from('Quote')
            .select('*', { count: 'exact', head: true })
            .gte('createdAt', startDate.toISOString())
            .lte('createdAt', endDate.toISOString())
            .eq('status', 'converted')
        ])
        const quotes = quoteResult.count || 0
        const accepted = acceptedResult.count || 0
        months.push({
          month: startDate.toLocaleString('fr-FR', { month: 'short' }),
          quotes,
          accepted
        })
      }

      return months
    }

    const getTopOffers = async () => {
      const { data: quoteOffers } = await supabase
        .from('QuoteOffer')
        .select('offerId')
      const counts: Record<string, number> = {}
      ;(quoteOffers || []).forEach(qo => {
        counts[qo.offerId] = (counts[qo.offerId] || 0) + 1
      })
      const topIds = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
      const topOffers = await Promise.all(
        topIds.map(async ([id, count]) => {
          const { data } = await supabase
            .from('InsuranceOffer')
            .select('name')
            .eq('id', id)
            .single()
          return {
            name: data?.name || '',
            quotes: count,
            conversion: Math.floor(Math.random() * 30) + 10
          }
        })
      )
      return topOffers
    }

    switch (userRole) {
      case 'USER':
      case 'INSURER':
      case 'ADMIN':
        const commonStats = await getCommonStats()
        
        if (userRole === 'ADMIN') {
          const [totalUsersRes, activeInsurersRes, lastMonthUsersRes] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase
              .from('InsuranceOffer')
              .select('*', { count: 'exact', head: true })
              .eq('isActive', true),
            supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .gte(
                'createdAt',
                new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
              )
          ])
          const totalUsers = totalUsersRes.count || 0
          const activeInsurers = activeInsurersRes.count || 0
          const lastMonthUsers = lastMonthUsersRes.count || 0
          
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