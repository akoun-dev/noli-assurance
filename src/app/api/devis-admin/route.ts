import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const db: any = supabase

export async function GET() {
  try {
    const quotes = await db.quote.findMany({
      include: {
        user: true,
        assure: true,
        quoteOffers: {
          include: {
            offer: {
              include: {
                insurer: true
              }
            }
          },
          where: {
            selected: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedQuotes = quotes.map(quote => {
      const selectedOffer = quote.quoteOffers[0]?.offer
      const client = quote.assure || quote.user

      return {
        id: quote.id,
        reference: quote.quoteReference,
        client: `${client?.prenom || ''} ${client?.nom || ''}`.trim() || 'Client inconnu',
        email: client?.email || 'Email non disponible',
        telephone: quote.telephone,
        vehicule: `${quote.energie || ''} ${quote.puissanceFiscale || ''}`.trim() || 'Véhicule non spécifié',
        offre: selectedOffer?.name || 'Offre non sélectionnée',
        assureur: selectedOffer?.insurer?.nomEntreprise || 'Assureur inconnu',
        status: quote.status,
        createdAt: quote.createdAt.toISOString(),
        prix: quote.quoteOffers[0]?.priceAtQuote !== undefined
          ? `${quote.quoteOffers[0].priceAtQuote.toLocaleString('fr-FR')} FCFA`
          : 'Non calculé'
      }
    })

    return NextResponse.json({ quotes: formattedQuotes })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}