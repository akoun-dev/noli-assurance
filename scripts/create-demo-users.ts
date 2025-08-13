import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function createDemoUsers() {
  try {
    // Hasher le mot de passe pour les comptes de démo
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Créer l'utilisateur de démo
    const { data: demoUser, error: demoUserError } = await supabase
      .from('users')
      .upsert(
        {
          email: 'user@demo.com',
          telephone: '+22501020304',
          nom: 'Demo',
          prenom: 'User',
          password: hashedPassword,
          role: 'USER'
        },
        { onConflict: 'email' }
      )
      .select()
      .single()
    if (demoUserError) throw demoUserError

    // Créer l'assureur de démo
    const { data: demoInsurerUser, error: demoInsurerUserError } =
      await supabase
        .from('users')
        .upsert(
          {
            email: 'assureur@demo.com',
            telephone: '+22501020305',
            nom: 'Demo',
            prenom: 'Assureur',
            password: hashedPassword,
            role: 'INSURER'
          },
          { onConflict: 'email' }
        )
        .select()
        .single()
    if (demoInsurerUserError) throw demoInsurerUserError

    const { error: insurerError } = await supabase.from('insurers').upsert(
      {
        userId: demoInsurerUser.id,
        nom: 'Demo',
        prenom: 'Assureur',
        email: 'assureur@demo.com',
        telephone: '+22501020305',
        nomEntreprise: 'Demo Assurance',
        adresseEntreprise: 'Abidjan',
        siegeSocial: 'Abidjan',
        numeroRegistre: 'REG12345',
        numeroAgrement: 'AGR67890',
        domaineActivite: 'Assurance',
        anneeExperience: '5',
        nombreEmployes: '10'
      },
      { onConflict: 'email' }
    )
    if (insurerError) throw insurerError

    // Créer l'administrateur de démo
    const { data: demoAdmin, error: demoAdminError } = await supabase
      .from('users')
      .upsert(
        {
          email: 'admin@demo.com',
          telephone: '+22501020306',
          nom: 'Demo',
          prenom: 'Admin',
          password: hashedPassword,
          role: 'ADMIN'
        },
        { onConflict: 'email' }
      )
      .select()
      .single()
    if (demoAdminError) throw demoAdminError

    console.log('Utilisateurs de démo créés avec succès :')
    console.log('Utilisateur:', demoUser.email, 'Rôle:', demoUser.role)
    console.log(
      'Assureur:',
      demoInsurerUser.email,
      'Rôle:',
      demoInsurerUser.role
    )
    console.log('Administrateur:', demoAdmin.email, 'Rôle:', demoAdmin.role)
    console.log('Mot de passe pour tous: password123')
  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs de démo:', error)
  }
}
createDemoUsers()

