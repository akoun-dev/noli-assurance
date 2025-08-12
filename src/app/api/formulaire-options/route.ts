import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const { data: assure, error: assureError } = await supabase
      .from('assures')
      .select('*')
      .eq('id', assureId)
      .single()

    if (assureError) {
      throw assureError
    }

    if (!assure) {
      return NextResponse.json(
        { error: 'Assuré non trouvé' },
        { status: 404 }
      )
    }

    let quote

    if (quoteId) {
      // Vérifier d'abord si le devis existe
      const { data: existingQuote } = await supabase
        .from('Quote')
        .select('id')
        .eq('id', quoteId)
        .maybeSingle()

      if (existingQuote) {
        const { data: updatedQuote } = await supabase
          .from('Quote')
          .update({
            typeCouverture,
            dateEffet: isoDate,
            dureeContrat: parseInt(dureeContrat),
            niveauFranchise,
            options: JSON.stringify(options || []),
            status: 'pending',
            updatedAt: new Date()
          })
          .eq('id', quoteId)
          .select()
          .single()
        quote = updatedQuote
      } else {
        const { data: createdQuote } = await supabase
          .from('Quote')
          .insert({
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
          })
          .select()
          .single()
        quote = createdQuote
      }
    } else {
      const { data: createdQuote } = await supabase
        .from('Quote')
        .insert({
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
        })
        .select()
        .single()
      quote = createdQuote
    }

    // Récupérer les offres d'assurance disponibles qui correspondent aux critères
    const { data: insuranceOffers, error: offersError } = await supabase
      .from('InsuranceOffer')
      .select('*, insurer:insurers(*), offerFeatures:OfferFeature(*)')
      .eq('coverageLevel', typeCouverture)
      .eq('isActive', true)
      .order('monthlyPrice', { ascending: true })

    if (offersError) throw offersError

    // Créer les offres associées au devis
    const quoteOffers = await Promise.all(
      insuranceOffers.map(async (offer: any) => {
        const calculatedPrice = offer.monthlyPrice

        const { data: qo } = await supabase
          .from('QuoteOffer')
          .insert({
            quoteId: quote.id,
            offerId: offer.id,
            priceAtQuote: calculatedPrice,
            createdAt: new Date()
          })
          .select()
          .single()
        return qo
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