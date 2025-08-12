const { createClient } = require('@supabase/supabase-js')
const { hash } = require('bcryptjs')
const dotenv = require('dotenv')

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('Seeding Supabase database...')

  // Create admin user
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .insert({
      email: 'admin@demo.com',
      telephone: '+2250102030405',
      nom: 'Admin',
      prenom: 'User',
      password: await hash('password123', 12),
      role: 'ADMIN'
    })
    .select()
    .single()
  if (adminError) throw adminError

  // Prepare insurers data
  const insurersData = [
    {
      user: {
        email: 'assureur@demo.com',
        telephone: '+2250102030406',
        nom: 'Assureur',
        prenom: 'User',
        password: await hash('password123', 12),
        role: 'INSURER'
      },
      insurer: {
        nom: 'NSIA',
        prenom: 'Assurance',
        email: 'contact@nsiaassurances.com',
        telephone: '+225 27 20 00 00 00',
        nomEntreprise: 'NSIA Assurance',
        adresseEntreprise: 'Abidjan, Cocody',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2024-001',
        numeroAgrement: 'AG-2024-001',
        domaineActivite: 'Assurance Automobile',
        anneeExperience: '15',
        nombreEmployes: '500+',
        siteWeb: 'https://www.nsiaassurances.com',
        description: 'Leader en assurance auto avec des formules adaptées à tous les profils',
        statut: 'ACTIF'
      },
      offers: [
        {
          name: 'Auto Premium',
          coverageLevel: 'Tous risques',
          monthlyPrice: 5200,
          annualPrice: 62400,
          franchise: 100000,
          description: 'Couverture complète avec garanties étendues et service premium'
        },
        {
          name: 'Auto Confort',
          coverageLevel: 'Tiers +',
          monthlyPrice: 3800,
          annualPrice: 45600,
          franchise: 150000,
          description: 'Bonne couverture avec garanties essentielles'
        }
      ]
    },
    {
      user: {
        email: 'atlantique@demo.com',
        telephone: '+2250102030408',
        nom: 'Atlantique',
        prenom: 'Assurance',
        password: await hash('password123', 12),
        role: 'INSURER'
      },
      insurer: {
        nom: 'Atlantique',
        prenom: 'Assurance',
        email: 'contact@atlantique-assurance.com',
        telephone: '+225 27 20 01 00 00',
        nomEntreprise: 'Atlantique Assurance',
        adresseEntreprise: 'Abidjan, Marcory',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2024-002',
        numeroAgrement: 'AG-2024-002',
        domaineActivite: 'Assurance Automobile',
        anneeExperience: '12',
        nombreEmployes: '300-500',
        siteWeb: 'https://www.atlantique-assurance.com',
        description: 'Garanties personnalisables et service client de qualité',
        statut: 'ACTIF'
      },
      offers: [
        {
          name: 'Auto Excellence',
          coverageLevel: 'Tous risques',
          monthlyPrice: 5500,
          annualPrice: 66000,
          franchise: 75000,
          description: 'Meilleure couverture avec service exceptionnel'
        },
        {
          name: 'Auto Sécurité',
          coverageLevel: 'Tiers +',
          monthlyPrice: 4500,
          annualPrice: 54000,
          franchise: 100000,
          description: 'Excellent rapport qualité-prix'
        }
      ]
    }
  ]

  for (const entry of insurersData) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert(entry.user)
      .select()
      .single()
    if (userError) throw userError

    const { data: insurer, error: insurerError } = await supabase
      .from('insurers')
      .insert({ ...entry.insurer, userId: user.id })
      .select()
      .single()
    if (insurerError) throw insurerError

    const offersWithInsurer = entry.offers.map((o) => ({ ...o, insurerId: insurer.id }))
    const { error: offersError } = await supabase
      .from('insuranceOffers')
      .insert(offersWithInsurer)
    if (offersError) throw offersError
  }

  console.log('Supabase database seeded successfully!')
  console.log('Admin: admin@demo.com / password123')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

