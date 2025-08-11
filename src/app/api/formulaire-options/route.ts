import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      assureId, 
      quoteId,
      typeCouverture, 
      dateEffet, 
      dureeContrat, 
      niveauFranchise,
      options 
    } = body

    // Validation des données
    if (!assureId || !typeCouverture || !dateEffet) {
      return NextResponse.json(
        { error: 'Les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation de la date
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    if (!dateRegex.test(dateEffet)) {
      return NextResponse.json(
        { error: 'Format de date invalide (jj/mm/aaaa)' },
        { status: 400 }
      )
    }

    // Convertir la date en format ISO
    const [day, month, year] = dateEffet.split('/')
    const isoDate = new Date(`${year}-${month}-${day}`)

    // Vérifier si l'assuré existe
    const assure = await db.assure.findUnique({
      where: { id: assureId }
    })

    if (!assure) {
      return NextResponse.json(
        { error: 'Assuré non trouvé' },
        { status: 404 }
      )
    }

    let quote

    if (quoteId) {
      // Vérifier d'abord si le devis existe
      const existingQuote = await db.quote.findUnique({
        where: { id: quoteId }
      })

      if (existingQuote) {
        // Mettre à jour le devis existant
        quote = await db.quote.update({
          where: { id: quoteId },
          data: {
            typeCouverture,
            dateEffet: isoDate,
            dureeContrat: parseInt(dureeContrat),
            niveauFranchise,
            options: JSON.stringify(options || []),
            status: 'pending',
            updatedAt: new Date()
          }
        })
      } else {
        // Créer un nouveau devis si l'ID existant n'est pas valide
        quote = await db.quote.create({
          data: {
            assureId: assureId,
            quoteReference: `DEVIS-${Date.now()}`,
            status: 'pending',
            nom: assure.nom,
            prenom: assure.prenom,
            email: assure.email,
            telephone: assure.telephone,
            typeCouverture,
            dateEffet: isoDate,
            dureeContrat: parseInt(dureeContrat),
            niveauFranchise,
            options: JSON.stringify(options || []),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }
    } else {
      // Créer un nouveau devis (cas improbable mais possible)
      quote = await db.quote.create({
        data: {
          assureId: assureId,
          quoteReference: `DEVIS-${Date.now()}`,
          status: 'pending',
          
          // Informations de l'assuré
          nom: assure.nom,
          prenom: assure.prenom,
          email: assure.email,
          telephone: assure.telephone,
          
          // Options d'assurance
          typeCouverture,
          dateEffet: isoDate,
          dureeContrat: parseInt(dureeContrat),
          niveauFranchise,
          options: JSON.stringify(options || []),
          
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Récupérer les offres d'assurance disponibles qui correspondent aux critères
    const insuranceOffers = await db.insuranceOffer.findMany({
      where: {
        coverageLevel: typeCouverture,
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

    // Créer les offres associées au devis
    const quoteOffers = await Promise.all(
      insuranceOffers.map(async (offer) => {
        // Calculer le prix en fonction des caractéristiques du véhicule et des options
        // Pour l'instant, on utilise le prix de base, mais on pourrait ajouter une logique de calcul plus complexe
        const calculatedPrice = offer.monthlyPrice

        return await db.quoteOffer.create({
          data: {
            quoteId: quote.id,
            offerId: offer.id,
            priceAtQuote: calculatedPrice,
            createdAt: new Date()
          }
        })
      })
    )

    return NextResponse.json({
      message: 'Options d\'assurance enregistrées avec succès',
      quote: {
        id: quote.id,
        quoteReference: quote.quoteReference,
        typeCouverture: quote.typeCouverture,
        dateEffet: quote.dateEffet,
        dureeContrat: quote.dureeContrat,
        niveauFranchise: quote.niveauFranchise,
        options: quote.options ? JSON.parse(quote.options) : [],
        status: quote.status
      },
      offers: quoteOffers.map(qo => ({
        id: qo.id,
        priceAtQuote: qo.priceAtQuote
      })),
      insuranceOffers: insuranceOffers.map(offer => ({
        id: offer.id,
        name: offer.name,
        coverageLevel: offer.coverageLevel,
        monthlyPrice: offer.monthlyPrice,
        annualPrice: offer.annualPrice,
        franchise: offer.franchise,
        description: offer.description,
        insurer: {
          id: offer.insurer.id,
          nomEntreprise: offer.insurer.nomEntreprise,
          nom: offer.insurer.nom,
          prenom: offer.insurer.prenom
        },
        features: offer.offerFeatures.map(f => ({
          name: f.featureName,
          type: f.featureType,
          value: f.featureValue
        }))
      }))
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des options:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement' },
      { status: 500 }
    )
  }
}