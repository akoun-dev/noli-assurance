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

    const { data: users, error } = await supabase
      .from('users')
      .select('id, nom, prenom, email, telephone, role, createdAt, updatedAt')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { success: false, error: 'Une erreur est survenue lors de la récupération des utilisateurs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}