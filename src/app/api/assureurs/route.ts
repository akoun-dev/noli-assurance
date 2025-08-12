import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  try {
    const { data: insurers, error } = await supabase
      .from('insurer')
      .select('id, nomEntreprise, email, telephone, statut, siteWeb, description')
      .order('nomEntreprise', { ascending: true })

    if (error) {
      console.error('Error fetching insurers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch insurers' },
        { status: 500 }
      )
    }

    return NextResponse.json({ insurers })
  } catch (error) {
    console.error('Error fetching insurers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurers' },
      { status: 500 }
    )
  }
}
