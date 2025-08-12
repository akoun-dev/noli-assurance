import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabase from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { data: quotes, error } = await supabase
      .from('Quote')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching quotes:', error)
      return NextResponse.json(
        { success: false, error: 'Une erreur est survenue lors de la récupération des devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quotes
    })

  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la récupération des devis' },
      { status: 500 }
    )
  }
}