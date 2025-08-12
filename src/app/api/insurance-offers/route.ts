import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  try {
    const { data: offers, error } = await supabase
      .from('insuranceOffer')
      .select('id, description, monthlyPrice, coverageLevel, isActive, createdAt, insurer:insurer(nomEntreprise)')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching insurance offers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch insurance offers' },
        { status: 500 }
      )
    }

    const formattedOffers = (offers || []).map((offer: any) => ({
      id: offer.id,
      name: offer.description || 'Offre sans nom',
      insurer: offer.insurer?.nomEntreprise || 'Assureur inconnu',
      price: `${offer.monthlyPrice?.toLocaleString('fr-FR') || '0'} FCFA/mois`,
      coverage: offer.coverageLevel || 'Couverture non spécifiée',
      status: offer.isActive ? 'active' : 'inactive',
      subscribers: 0,
      createdAt: offer.createdAt,
      rating: 4.0
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
