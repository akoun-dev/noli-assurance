import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabase from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'INSURER') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { data: offers, error } = await supabase
      .from('InsuranceOffer')
      .select('*, insurer(name)')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching offers:', error)
      return NextResponse.json(
        { success: false, error: 'Une erreur est survenue lors de la récupération des offres' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      offers
    })

  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la récupération des offres' },
      { status: 500 }
    )
  }
}