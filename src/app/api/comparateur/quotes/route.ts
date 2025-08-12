import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const db: any = supabase

interface QuoteRequest {
  // Profil conducteur
  nom: string
  prenom: string
  email?: string
  telephone: string
  dateNaissance?: string
  datePermis?: string
  antecedentsSinistres?: string
  nombreSinistres?: string
  typeSinistres?: string[]
  usagePrincipal?: string
  kilometrageAnnuel?: string
  
  // Véhicule
  energie?: string
  puissanceFiscale?: string
  nombrePlaces?: string
  dateMiseCirculation?: string
  valeurNeuve?: string
  valeurVenale?: string
  usageVehicule?: string
  
  // Besoins assurance
  typeCouverture?: string
  options?: string[]
  niveauFranchise?: string
  preferenceContact?: string
  
  // Offres sélectionnées
  selectedOffers?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json()
    
    // Générer une référence unique pour le devis
    const quoteReference = `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Créer ou récupérer l'utilisateur
    let user = null
    if (body.email) {
      user = await db.user.findUnique({
        where: { email: body.email }
      })
    }
    
    if (!user && body.telephone) {
      user = await db.user.findUnique({
        where: { telephone: body.telephone }
      })
    }
    
    if (!user) {
      user = await db.user.create({
        data: {
          email: body.email || null,
          telephone: body.telephone,
          nom: body.nom,
          prenom: body.prenom,
          dateNaissance: body.dateNaissance ? new Date(body.dateNaissance) : null,
          datePermis: body.datePermis ? new Date(body.datePermis) : null
        }
      })
    }
    
    // Créer le devis
    const quote = await db.quote.create({
      data: {
        userId: user.id,
        quoteReference,
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        telephone: body.telephone,
        dateNaissance: body.dateNaissance ? new Date(body.dateNaissance) : null,
        datePermis: body.datePermis ? new Date(body.datePermis) : null,
        antecedentsSinistres: body.antecedentsSinistres === 'oui',
        nombreSinistres: body.nombreSinistres ? parseInt(body.nombreSinistres) : null,
        typeSinistres: body.typeSinistres ? JSON.stringify(body.typeSinistres) : null,
        usagePrincipal: body.usagePrincipal,
        kilometrageAnnuel: body.kilometrageAnnuel,
        energie: body.energie,
        puissanceFiscale: body.puissanceFiscale,
        nombrePlaces: body.nombrePlaces,
        dateMiseCirculation: body.dateMiseCirculation ? new Date(body.dateMiseCirculation) : null,
        valeurNeuve: body.valeurNeuve ? parseFloat(body.valeurNeuve) : null,
        valeurVenale: body.valeurVenale ? parseFloat(body.valeurVenale) : null,
        usageVehicule: body.usageVehicule,
        typeCouverture: body.typeCouverture,
        options: body.options ? JSON.stringify(body.options) : null,
        niveauFranchise: body.niveauFranchise,
        preferenceContact: body.preferenceContact,
        contactMethod: body.preferenceContact,
        status: 'pending'
      }
    })
    
    // Ajouter les offres au devis
    if (body.selectedOffers && body.selectedOffers.length > 0) {
      const quoteOffersData = body.selectedOffers.map((offerId: string) => ({
        quoteId: quote.id,
        offerId,
        priceAtQuote: 0 // Sera calculé plus tard
      }))
      
      await db.quoteOffer.createMany({
        data: quoteOffersData
      })
    }
    
    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        reference: quote.quoteReference,
        status: quote.status
      }
    })

  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const userId = searchParams.get('userId')
    
    if (reference) {
      // Récupérer un devis par sa référence
      const quote = await db.quote.findUnique({
        where: { quoteReference: reference },
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true
            }
          },
          quoteOffers: {
            include: {
              offer: {
                include: {
                  insurer: true,
                  offerFeatures: true
                }
              }
            }
          }
        }
      })
      
      if (!quote) {
        return NextResponse.json(
          { success: false, error: 'Quote not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        quote
      })
    }
    
    if (userId) {
      // Récupérer tous les devis d'un utilisateur
      const quotes = await db.quote.findMany({
        where: { userId },
        include: {
          quoteOffers: {
            include: {
              offer: {
                include: {
                  insurer: true
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
    }
    
    return NextResponse.json(
      { success: false, error: 'Missing parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}