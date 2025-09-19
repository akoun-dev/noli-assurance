import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabaseAdmin from '@/lib/supabase-admin'

interface InsurerStats {
  totalOffers: number
  activeOffers: number
  totalQuotes: number
  convertedQuotes: number
  pendingQuotes: number
  contactedQuotes: number
  totalRevenue: number
  conversionRate: number
  monthlyRevenue: {
    month: string
    revenue: number
  }[]
  topOffers: {
    id: string
    name: string
    coverageLevel: string
    monthlyPrice: number
    quoteCount: number
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (session.user.role !== 'ASSUREUR') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer l'ID de l'assureur
    const { data: insurer, error: insurerError } = await supabaseAdmin
      .from('insurers')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (insurerError || !insurer) {
      return NextResponse.json({ error: 'Profil assureur introuvable' }, { status: 403 })
    }

    const insurerId = insurer.id

    // Récupérer les statistiques des offres
    const { data: offers, error: offersError } = await supabaseAdmin
      .from('InsuranceOffer')
      .select('*')
      .eq('insurerId', insurerId)

    if (offersError) {
      console.error('Error fetching offers:', offersError)
      return NextResponse.json({ error: 'Erreur de récupération des offres' }, { status: 500 })
    }

    // Récupérer les devis liés aux offres de l'assureur
    const { data: quoteOffers, error: quoteOffersError } = await supabaseAdmin
      .from('QuoteOffer')
      .select(`
        *,
        quote(
          id,
          quoteReference,
          status,
          createdAt,
          nom,
          prenom,
          email,
          telephone
        )
      `)
      .in('offerId', offers.map(o => o.id))

    if (quoteOffersError) {
      console.error('Error fetching quote offers:', quoteOffersError)
      return NextResponse.json({ error: 'Erreur de récupération des devis' }, { status: 500 })
    }

    // Calculer les statistiques
    const activeOffers = offers.filter(o => o.isActive).length
    const allQuotes = quoteOffers.map(qo => qo.quote).filter(Boolean)
    const uniqueQuotes = Array.from(new Map(allQuotes.map(q => [q.id, q])).values())

    const convertedQuotes = uniqueQuotes.filter(q => q.status === 'converted').length
    const pendingQuotes = uniqueQuotes.filter(q => q.status === 'pending').length
    const contactedQuotes = uniqueQuotes.filter(q => q.status === 'contacted').length

    const totalRevenue = convertedQuotes * 10000 // Estimation simplifiée
    const conversionRate = uniqueQuotes.length > 0 ? (convertedQuotes / uniqueQuotes.length) * 100 : 0

    // Calculer le revenu mensuel
    const monthlyRevenue = []
    const currentDate = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

      const monthQuotes = uniqueQuotes.filter(q => {
        const quoteDate = new Date(q.createdAt)
        return quoteDate.getMonth() === date.getMonth() &&
               quoteDate.getFullYear() === date.getFullYear() &&
               q.status === 'converted'
      })

      monthlyRevenue.push({
        month: monthName,
        revenue: monthQuotes.length * 10000 // Estimation simplifiée
      })
    }

    // Top offres par nombre de devis
    const offerQuoteCounts = quoteOffers.reduce((acc, qo) => {
      acc[qo.offerId] = (acc[qo.offerId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topOffers = offers
      .map(offer => ({
        id: offer.id,
        name: offer.name,
        coverageLevel: offer.coverageLevel,
        monthlyPrice: offer.monthlyPrice,
        quoteCount: offerQuoteCounts[offer.id] || 0
      }))
      .sort((a, b) => b.quoteCount - a.quoteCount)
      .slice(0, 5)

    const stats: InsurerStats = {
      totalOffers: offers.length,
      activeOffers,
      totalQuotes: uniqueQuotes.length,
      convertedQuotes,
      pendingQuotes,
      contactedQuotes,
      totalRevenue,
      conversionRate,
      monthlyRevenue,
      topOffers
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error in insurer stats API:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}