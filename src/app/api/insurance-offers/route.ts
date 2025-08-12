import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const db: any = supabase

export async function GET() {
  try {
    const offers = await db.insuranceOffer.findMany({
      include: {
        insurer: {
          select: {
            nomEntreprise: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      name: offer.description || 'Offre sans nom',
      insurer: offer.insurer?.nomEntreprise || 'Assureur inconnu',
      price: `${offer.monthlyPrice?.toLocaleString('fr-FR') || '0'} FCFA/mois`,
      coverage: offer.coverageLevel || 'Couverture non spécifiée',
      status: offer.isActive ? 'active' : 'inactive',
      subscribers: 0, // À implémenter selon la logique métier
      createdAt: offer.createdAt.toISOString(),
      rating: 4.0 // Valeur par défaut
    }))

    return NextResponse.json({ offers: formattedOffers })
  } catch (error) {
    console.error('Error fetching insurance offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance offers' },
      { status: 500 }
    )
  }
}