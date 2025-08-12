import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    let { data: user } = body.email
      ? await supabase.from('users').select('*').eq('email', body.email).maybeSingle()
      : { data: null }

    if (!user && body.telephone) {
      const res = await supabase
        .from('users')
        .select('*')
        .eq('telephone', body.telephone)
        .maybeSingle()
      user = res.data
    }

    if (!user) {
      const { data: createdUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: body.email || null,
          telephone: body.telephone,
          nom: body.nom,
          prenom: body.prenom,
          dateNaissance: body.dateNaissance ? new Date(body.dateNaissance) : null,
          datePermis: body.datePermis ? new Date(body.datePermis) : null
        })
        .select()
        .single()
      if (userError) throw userError
      user = createdUser
    }
    
    // Créer le devis
    const { data: quote, error: quoteError } = await supabase
      .from('Quote')
      .insert({
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
      })
      .select()
      .single()

    if (quoteError) throw quoteError
    
    // Ajouter les offres au devis
    if (body.selectedOffers && body.selectedOffers.length > 0) {
      const quoteOffersData = body.selectedOffers.map((offerId: string) => ({
        quoteId: quote.id,
        offerId,
        priceAtQuote: 0 // Sera calculé plus tard
      }))
      
      await supabase.from('QuoteOffer').insert(quoteOffersData)
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
      const { data: quote, error } = await supabase
        .from('Quote')
        .select(`*, user:users(id, nom, prenom, email, telephone), quoteOffers:QuoteOffer(*, offer:InsuranceOffer(*, insurer:insurers(*), offerFeatures:OfferFeature(*)))`)
        .eq('quoteReference', reference)
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Quote not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, quote })
    }
    
    if (userId) {
      // Récupérer tous les devis d'un utilisateur
      const { data: quotes, error } = await supabase
        .from('Quote')
        .select(`*, quoteOffers:QuoteOffer(*, offer:InsuranceOffer(*, insurer:insurers(*)))`)
        .eq('userId', userId)
        .order('createdAt', { ascending: false })

      if (error) throw error

      return NextResponse.json({ success: true, quotes })
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