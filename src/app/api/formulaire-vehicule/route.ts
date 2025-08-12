import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      assureId, 
      energie, 
      puissanceFiscale, 
      nombrePlaces, 
      dateMiseCirculation, 
      valeurNeuve, 
      valeurVenale, 
      usageVehicule 
    } = body

    // Validation des données
    if (!assureId || !energie || !puissanceFiscale || !nombrePlaces || 
        !dateMiseCirculation || !valeurNeuve || !valeurVenale || !usageVehicule) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation de la date
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    if (!dateRegex.test(dateMiseCirculation)) {
      return NextResponse.json(
        { error: 'Format de date invalide (jj/mm/aaaa)' },
        { status: 400 }
      )
    }

    // Convertir la date en format ISO
    const [day, month, year] = dateMiseCirculation.split('/')
    const isoDate = new Date(`${year}-${month}-${day}`)

    // Validation des valeurs numériques
    const valeurNeuveNum = parseFloat(valeurNeuve)
    const valeurVenaleNum = parseFloat(valeurVenale)

    if (isNaN(valeurNeuveNum) || isNaN(valeurVenaleNum)) {
      return NextResponse.json(
        { error: 'Les valeurs doivent être des nombres valides' },
        { status: 400 }
      )
    }

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

    // Créer ou mettre à jour les informations du véhicule dans la base de données
    // Pour l'instant, on va stocker ces informations dans un devis temporaire
    // ou les ajouter à l'assuré si nécessaire
    
    // Créer un devis avec les informations du véhicule
    const { data: quote, error } = await supabase
      .from('Quote')
      .insert({
        assureId: assureId,
        quoteReference: `DEVIS-${Date.now()}`,
        status: 'pending',
        nom: assure.nom,
        prenom: assure.prenom,
        email: assure.email,
        telephone: assure.telephone,
        energie,
        puissanceFiscale,
        nombrePlaces,
        dateMiseCirculation: isoDate,
        valeurNeuve: valeurNeuveNum,
        valeurVenale: valeurVenaleNum,
        usageVehicule,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Informations du véhicule enregistrées avec succès',
      quote: {
        id: quote.id,
        quoteReference: quote.quoteReference,
        energie: quote.energie,
        puissanceFiscale: quote.puissanceFiscale,
        nombrePlaces: quote.nombrePlaces,
        dateMiseCirculation: quote.dateMiseCirculation,
        valeurNeuve: quote.valeurNeuve,
        valeurVenale: quote.valeurVenale,
        usageVehicule: quote.usageVehicule
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du véhicule:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement' },
      { status: 500 }
    )
  }
}