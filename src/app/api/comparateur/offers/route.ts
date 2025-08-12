import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const db: any = supabase

interface ComparisonRequest {
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
}

export async function POST(request: NextRequest) {
  try {
    console.log('Début du traitement de la requête /api/comparateur/offers')
    const body: ComparisonRequest = await request.json()
    console.log('Données reçues:', JSON.stringify(body, null, 2))
    
    // Récupérer toutes les offres actives
    const offers = await db.insuranceOffer.findMany({
      where: {
        isActive: true
      },
      include: {
        insurer: true,
        offerFeatures: true
      },
      orderBy: {
        monthlyPrice: 'asc'
      }
    })
    console.log('Offres récupérées depuis la base:', offers.length)

    // Filtrer et calculer les prix en fonction des critères
    const processedOffers = offers.map(offer => {
      let adjustedPrice = offer.monthlyPrice
      
      // Ajuster le prix en fonction de la couverture demandée
      if (body.typeCouverture && body.typeCouverture !== offer.coverageLevel) {
        // Si la couverture demandée est différente, ajuster le prix
        const coverageMultiplier = {
          'Tiers': 1.0,
          'Tiers +': 1.5,
          'Tous risques': 2.0
        }
        const requestedMultiplier = coverageMultiplier[body.typeCouverture as keyof typeof coverageMultiplier] || 1.0
        const offerMultiplier = coverageMultiplier[offer.coverageLevel as keyof typeof coverageMultiplier] || 1.0
        adjustedPrice = adjustedPrice * (requestedMultiplier / offerMultiplier)
      }
      
      // Ajuster en fonction de la franchise
      if (body.niveauFranchise) {
        const franchiseAdjustment = {
          'faible': 1.2,    // Franchise faible = prix plus élevé
          'standard': 1.0,  // Franchise standard = prix normal
          'eleve': 0.8      // Franchise élevée = prix plus bas
        }
        adjustedPrice = adjustedPrice * (franchiseAdjustment[body.niveauFranchise as keyof typeof franchiseAdjustment] || 1.0)
      }
      
      // Ajuster en fonction des antécédents de sinistres
      if (body.antecedentsSinistres === 'oui' && body.nombreSinistres) {
        const sinistreCount = parseInt(body.nombreSinistres) || 0
        const sinistreMultiplier = 1 + (sinistreCount * 0.1) // +10% par sinistre
        adjustedPrice = adjustedPrice * sinistreMultiplier
      }
      
      // Ajuster en fonction de l'âge du véhicule
      if (body.dateMiseCirculation) {
        const vehicleAge = new Date().getFullYear() - new Date(body.dateMiseCirculation).getFullYear()
        if (vehicleAge > 10) {
          adjustedPrice = adjustedPrice * 1.1 // +10% pour les véhicules de plus de 10 ans
        } else if (vehicleAge < 2) {
          adjustedPrice = adjustedPrice * 1.05 // +5% pour les véhicules neufs
        }
      }
      
      // Ajuster en fonction de la puissance fiscale
      if (body.puissanceFiscale) {
        const power = parseInt(body.puissanceFiscale) || 0
        if (power > 8) {
          adjustedPrice = adjustedPrice * 1.15 // +15% pour les véhicules puissants
        }
      }
      
      return {
        id: offer.id,
        insurer: offer.insurer.nomEntreprise,
        monthlyPrice: Math.round(adjustedPrice),
        annualPrice: Math.round(adjustedPrice * 12),
        coverageLevel: offer.coverageLevel,
        rating: 4.0 + Math.random() * 0.7, // Note aléatoire entre 4.0 et 4.7
        features: offer.offerFeatures
          .filter(f => f.featureType === 'included')
          .map(f => f.featureName),
        franchise: offer.franchise,
        description: offer.description || `Offre ${offer.coverageLevel} chez ${offer.insurer.nomEntreprise}`,
        includedOptions: offer.offerFeatures
          .filter(f => f.featureType === 'included')
          .map(f => f.featureName),
        additionalOptions: offer.offerFeatures
          .filter(f => f.featureType === 'optional')
          .map(f => f.featureName)
      }
    })

    // Trier par prix ajusté
    processedOffers.sort((a, b) => a.monthlyPrice - b.monthlyPrice)

    return NextResponse.json({
      success: true,
      offers: processedOffers,
      totalOffers: processedOffers.length
    })

  } catch (error) {
    console.error('Error in comparison API:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Récupérer toutes les offres actives pour le filtrage côté client
    const offers = await db.insuranceOffer.findMany({
      where: {
        isActive: true
      },
      include: {
        insurer: true,
        offerFeatures: true
      }
    })

    const insurers = await db.insurer.findMany({
      where: {
        statut: "ACTIF"
      }
    })

    return NextResponse.json({
      success: true,
      offers: offers,
      insurers: insurers
    })

  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}