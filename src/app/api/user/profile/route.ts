import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, nom, prenom, email, telephone, dateNaissance, datePermis } = body

    // Vérifier que l'utilisateur modifie bien son propre profil
    if (id !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé à modifier ce profil' }, { status: 403 })
    }

    // Mettre à jour le profil utilisateur
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        nom,
        prenom,
        email,
        telephone,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        datePermis: datePermis ? new Date(datePermis) : null
      })
      .eq('id', session.user.id)
      .select('id, nom, prenom, email, telephone, dateNaissance, datePermis, role')
      .single()

    if (error) throw error

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, nom, prenom, email, telephone, dateNaissance, datePermis, role')
      .eq('id', session.user.id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}