import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import supabaseAdmin from '@/lib/supabase-admin'
import { logAdminAction } from '@/lib/auth-logger'

const ProfileSchema = z.object({
  nomEntreprise: z.string().min(2).max(100),
  adresseEntreprise: z.string().min(5).max(200),
  siegeSocial: z.string().min(5).max(200),
  numeroRegistre: z.string().min(5).max(50),
  numeroAgrement: z.string().min(5).max(50),
  domaineActivite: z.string().min(2).max(100),
  anneeExperience: z.string().min(1).max(50),
  nombreEmployes: z.string().min(1).max(50),
  siteWeb: z.string().url().optional().or(z.literal('')),
  description: z.string().max(500).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (session.user.role !== 'ASSUREUR') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { data: insurer, error } = await supabaseAdmin
      .from('insurers')
      .select(`
        *,
        user:users(
          id,
          email,
          telephone,
          nom,
          prenom
        )
      `)
      .eq('userId', session.user.id)
      .single()

    if (error || !insurer) {
      return NextResponse.json({ error: 'Profil assureur introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: insurer
    })

  } catch (error) {
    console.error('Error fetching insurer profile:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (session.user.role !== 'ASSUREUR') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = ProfileSchema.parse(await request.json())

    // Vérifier que le profil existe
    const { data: existingInsurer, error: fetchError } = await supabaseAdmin
      .from('insurers')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (fetchError || !existingInsurer) {
      return NextResponse.json({ error: 'Profil assureur introuvable' }, { status: 404 })
    }

    // Mettre à jour le profil
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('insurers')
      .update(updateData)
      .eq('userId', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating insurer profile:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      )
    }

    // Journaliser l'activité
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email || '',
      action: 'INSURER_PROFILE_UPDATED',
      target: existingInsurer.id,
      details: { nomEntreprise: body.nomEntreprise },
      success: !error,
      request,
    })

    return NextResponse.json({
      success: true,
      profile: data,
    })

  } catch (error) {
    console.error('Error in update insurer profile API:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}