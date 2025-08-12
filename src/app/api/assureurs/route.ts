import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const db: any = supabase

export async function GET() {
  try {
    const insurers = await db.insurer.findMany({
      select: {
        id: true,
        nomEntreprise: true,
        email: true,
        telephone: true,
        statut: true,
        siteWeb: true,
        description: true
      },
      orderBy: {
        nomEntreprise: 'asc'
      }
    })

    return NextResponse.json({ insurers })
  } catch (error) {
    console.error('Error fetching insurers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurers' },
      { status: 500 }
    )
  }
}