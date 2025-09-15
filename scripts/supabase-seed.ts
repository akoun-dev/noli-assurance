import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('Seeding Supabase database...')

  // Clean existing data
  console.log('Cleaning existing data...')
  const { error: deleteOffersError } = await supabase
    .from('InsuranceOffer')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  
  const { error: deleteInsurersError } = await supabase
    .from('insurers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  
  const { error: deleteUsersError } = await supabase
    .from('users')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  const { error: deleteAssuresError } = await supabase
    .from('assures')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  const { error: deletePricingError } = await supabase
    .from('PricingConfig')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  
  if (deleteOffersError || deleteInsurersError || deleteUsersError) {
    throw deleteOffersError || deleteInsurersError || deleteUsersError
  }

  // Create test users
  const testUsers = [
    // Admin
    {
      email: 'admin@demo.com',
      telephone: '+2250102030405',
      nom: 'Admin',
      prenom: 'User',
      password: await hash('Admin123!', 12),
      role: 'ADMIN'
    },
    // Client standard
    {
      email: 'client@demo.com',
      telephone: '+2250506070809',
      nom: 'Client',
      prenom: 'Test',
      password: await hash('Client123!', 12),
      role: 'USER'
    },
    // Client VIP
    {
      email: 'vip@demo.com',
      telephone: '+2250708090102',
      nom: 'VIP',
      prenom: 'Client',
      password: await hash('Vip123!', 12),
      role: 'USER'
    }
  ]

  for (const user of testUsers) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .select()
      .single()
    if (error) throw error
  }

  // Prepare insurers data
  const insurerPassword = await hash('Assureur@2024!', 12)
  
  const insurersData = [
    // NSIA Assurance
    {
      user: {
        id: uuidv4(),
        email: 'contact@nsia.ci',
        telephone: '+2252720252025',
        nom: 'NSIA',
        prenom: 'Assurance',
        password: insurerPassword,
        role: 'INSURER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insurer: {
        nom: 'NSIA',
        prenom: 'Assurance',
        email: 'contact@nsia.ci',
        telephone: '+2252720252025',
        nomEntreprise: 'NSIA Assurance Côte d\'Ivoire',
        adresseEntreprise: 'Immeuble NSIA, Angle Boulevard Latrille et Avenue Chardy, Plateau',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-1995-001',
        numeroAgrement: 'AG-1995-001',
        domaineActivite: 'Assurance Multirisques',
        anneeExperience: '28',
        nombreEmployes: '800+',
        siteWeb: 'https://www.nsia.ci',
        description: 'Leader de l\'assurance en Côte d\'Ivoire depuis 1995',
        statut: 'ACTIF',
        dateCreation: new Date('1995-01-01'),
        updatedAt: new Date()
      },
      offers: [
        { name: 'Auto Premium', coverageLevel: 'Tous risques', monthlyPrice: 5200, annualPrice: 62400, franchise: 100000 },
        { name: 'Auto Confort', coverageLevel: 'Tiers +', monthlyPrice: 3800, annualPrice: 45600, franchise: 150000 },
        { name: 'Moto Sécurité', coverageLevel: 'Tous risques', monthlyPrice: 2500, annualPrice: 30000, franchise: 50000 },
        { name: 'Habitation Elite', coverageLevel: 'Complet', monthlyPrice: 7500, annualPrice: 90000, franchise: 200000 }
      ]
    },
    // SUNU Assurances
    {
      user: {
        id: uuidv4(),
        email: 'contact@sunu-assurance.ci',
        telephone: '+2252721212121',
        nom: 'SUNU',
        prenom: 'Assurance',
        password: insurerPassword,
        role: 'INSURER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insurer: {
        nom: 'SUNU',
        prenom: 'Assurance',
        email: 'contact@sunu-assurance.ci',
        telephone: '+2252721212121',
        nomEntreprise: 'SUNU Assurances CI',
        adresseEntreprise: 'Immeuble SUNU, Rue des Jardins, Zone 4, Abidjan',
        siegeSocial: 'Abidjan, Cocody',
        numeroRegistre: 'CI-ABJ-1998-003',
        numeroAgrement: 'AG-1998-003',
        domaineActivite: 'Assurance Générale',
        anneeExperience: '25',
        nombreEmployes: '600+',
        siteWeb: 'https://www.sunu-assurance.ci',
        description: 'Groupe panafricain présent en Côte d\'Ivoire depuis 1998',
        statut: 'ACTIF',
        dateCreation: new Date('1998-05-15'),
        updatedAt: new Date()
      },
      offers: [
        { name: 'Auto Excellence', coverageLevel: 'Tous risques', monthlyPrice: 5500, annualPrice: 66000, franchise: 75000 },
        { name: 'Auto Sécurité', coverageLevel: 'Tiers +', monthlyPrice: 4500, annualPrice: 54000, franchise: 100000 },
        { name: 'Moto Protection', coverageLevel: 'Tiers', monthlyPrice: 1800, annualPrice: 21600, franchise: 75000 },
        { name: 'Entreprise Plus', coverageLevel: 'Complet', monthlyPrice: 12000, annualPrice: 144000, franchise: 500000 }
      ]
    },
    // Allianz Côte d'Ivoire
    {
      user: {
        id: uuidv4(),
        email: 'contact@allianz.ci',
        telephone: '+2252727303030',
        nom: 'Allianz',
        prenom: 'CI',
        password: insurerPassword,
        role: 'INSURER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insurer: {
        nom: 'Allianz',
        prenom: 'Côte d\'Ivoire',
        email: 'contact@allianz.ci',
        telephone: '+2252727303030',
        nomEntreprise: 'Allianz Côte d\'Ivoire',
        adresseEntreprise: 'Immeuble Allianz, Avenue Noguès, Plateau',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2010-005',
        numeroAgrement: 'AG-2010-005',
        domaineActivite: 'Assurance Multirisques',
        anneeExperience: '13',
        nombreEmployes: '450+',
        siteWeb: 'https://www.allianz.ci',
        description: 'Groupe international présent en Côte d\'Ivoire depuis 2010',
        statut: 'ACTIF',
        dateCreation: new Date('2010-03-10'),
        updatedAt: new Date()
      },
      offers: [
        { name: 'Auto Gold', coverageLevel: 'Tous risques', monthlyPrice: 6000, annualPrice: 72000, franchise: 80000 },
        { name: 'Auto Silver', coverageLevel: 'Tiers +', monthlyPrice: 4200, annualPrice: 50400, franchise: 120000 },
        { name: 'Voyage Plus', coverageLevel: 'International', monthlyPrice: 3500, annualPrice: 42000, franchise: 50000 }
      ]
    },
    // Colina Côte d'Ivoire
    {
      user: {
        id: uuidv4(),
        email: 'contact@colina.ci',
        telephone: '+2252722151515',
        nom: 'Colina',
        prenom: 'Assurances',
        password: insurerPassword,
        role: 'INSURER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insurer: {
        nom: 'Colina',
        prenom: 'Assurances',
        email: 'contact@colina.ci',
        telephone: '+2252722151515',
        nomEntreprise: 'Colina Côte d\'Ivoire',
        adresseEntreprise: 'Rue du Commerce, Quartier du Commerce, Plateau',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2005-007',
        numeroAgrement: 'AG-2005-007',
        domaineActivite: 'Assurance Générale',
        anneeExperience: '18',
        nombreEmployes: '550+',
        siteWeb: 'https://www.colina.ci',
        description: 'Assureur ivoirien spécialisé dans les solutions innovantes',
        statut: 'ACTIF',
        dateCreation: new Date('2005-07-20'),
        updatedAt: new Date()
      },
      offers: [
        { name: 'Auto Prestige', coverageLevel: 'Tous risques', monthlyPrice: 5800, annualPrice: 69600, franchise: 90000 },
        { name: 'Auto Eco', coverageLevel: 'Tiers', monthlyPrice: 3200, annualPrice: 38400, franchise: 180000 },
        { name: 'Habitation Sécurité', coverageLevel: 'Complet', monthlyPrice: 6800, annualPrice: 81600, franchise: 150000 }
      ]
    },
    // Axa Assurances CI
    {
      user: {
        id: uuidv4(),
        email: 'contact@axa.ci',
        telephone: '+2252720181818',
        nom: 'AXA',
        prenom: 'Assurances',
        password: insurerPassword,
        role: 'INSURER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insurer: {
        nom: 'AXA',
        prenom: 'Assurances',
        email: 'contact@axa.ci',
        telephone: '+2252720181818',
        nomEntreprise: 'AXA Assurances Côte d\'Ivoire',
        adresseEntreprise: 'Immeuble AXA, Boulevard de Marseille, Plateau',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2008-009',
        numeroAgrement: 'AG-2008-009',
        domaineActivite: 'Assurance Multirisques',
        anneeExperience: '15',
        nombreEmployes: '700+',
        siteWeb: 'https://www.axa.ci',
        description: 'Groupe international leader en assurance',
        statut: 'ACTIF',
        dateCreation: new Date('2008-11-05'),
        updatedAt: new Date()
      },
      offers: [
        { name: 'Auto Confort Plus', coverageLevel: 'Tous risques', monthlyPrice: 6200, annualPrice: 74400, franchise: 85000 },
        { name: 'Auto Essentiel', coverageLevel: 'Tiers +', monthlyPrice: 4800, annualPrice: 57600, franchise: 110000 },
        { name: 'Moto Liberté', coverageLevel: 'Tiers', monthlyPrice: 2200, annualPrice: 26400, franchise: 60000 },
        { name: 'Professionnel Plus', coverageLevel: 'Complet', monthlyPrice: 15000, annualPrice: 180000, franchise: 300000 }
      ]
    },
    // Saham Assurance
    {
      user: {
        id: uuidv4(),
        email: 'contact@saham.ci',
        telephone: '+2252725121212',
        nom: 'Saham',
        prenom: 'Assurance',
        password: insurerPassword,
        role: 'INSURER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insurer: {
        nom: 'Saham',
        prenom: 'Assurance',
        email: 'contact@saham.ci',
        telephone: '+2252725121212',
        nomEntreprise: 'Saham Assurance Côte d\'Ivoire',
        adresseEntreprise: 'Immeuble Saham, Boulevard de la République, Plateau',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2012-011',
        numeroAgrement: 'AG-2012-011',
        domaineActivite: 'Assurance Générale',
        anneeExperience: '11',
        nombreEmployes: '500+',
        siteWeb: 'https://www.sahamassurance.ci',
        description: 'Groupe marocain leader en Afrique',
        statut: 'ACTIF',
        dateCreation: new Date('2012-09-15'),
        updatedAt: new Date()
      },
      offers: [
        { name: 'Auto Premium Plus', coverageLevel: 'Tous risques', monthlyPrice: 6500, annualPrice: 78000, franchise: 70000 },
        { name: 'Auto Standard', coverageLevel: 'Tiers +', monthlyPrice: 4000, annualPrice: 48000, franchise: 130000 },
        { name: 'Moto Confort', coverageLevel: 'Tous risques', monthlyPrice: 2800, annualPrice: 33600, franchise: 40000 },
        { name: 'Entreprise Standard', coverageLevel: 'Complet', monthlyPrice: 10000, annualPrice: 120000, franchise: 400000 },
        { name: 'Voyage Essential', coverageLevel: 'International', monthlyPrice: 3000, annualPrice: 36000, franchise: 60000 }
      ]
    }
  ]

  // Add pricing configs
  const pricingConfigs = [
    {
      insurerId: '',
      coverageLevel: 'Tous risques',
      basePrice: 5000,
      ageFactor: 1.2,
      vehicleAgeFactor: 1.5,
      powerFactor: 1.3,
      franchiseFactor: 0.9,
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
    {
      insurerId: '',
      coverageLevel: 'Tiers +',
      basePrice: 3500,
      ageFactor: 1.1,
      vehicleAgeFactor: 1.3,
      powerFactor: 1.2,
      franchiseFactor: 0.8,
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
  ]

  // Add sample assures
  const assuresData = [
    {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      telephone: '+2250708090102',
      isWhatsApp: true
    },
    {
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@example.com',
      telephone: '+2250506070809',
      isWhatsApp: false
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
      .insert({
        id: uuidv4(),
        ...entry.insurer,
        userId: user.id,
        dateCreation: new Date(),
        updatedAt: new Date()
      })
      .select()
      .single()
    if (insurerError) throw insurerError

    const offersWithInsurer = entry.offers.map((o) => ({ ...o, insurerId: insurer.id }))
    const { error: offersError } = await supabase
      .from('InsuranceOffer')
      .insert(offersWithInsurer.map(o => ({
        id: uuidv4(),
        ...o,
        createdAt: new Date(),
        updatedAt: new Date()
      })))
    if (offersError) throw offersError
  }

  // Insert pricing configs
  const { data: allInsurers } = await supabase
    .from('insurers')
    .select('id')
  
  if (allInsurers && allInsurers.length >= 2) {
    pricingConfigs[0].insurerId = allInsurers[0].id
    pricingConfigs[1].insurerId = allInsurers[1].id
    
    const { error: pricingError } = await supabase
      .from('PricingConfig')
      .insert(pricingConfigs.map(pc => ({
        id: uuidv4(),
        ...pc,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })))
    if (pricingError) throw pricingError
  }

  // Insert assures
  const { error: assuresError } = await supabase
    .from('assures')
    .insert(assuresData.map(a => ({
      id: uuidv4(),
      ...a,
      createdAt: new Date(),
      updatedAt: new Date()
    })))
  if (assuresError) throw assuresError

  console.log('Supabase database seeded successfully!')
  console.log('Admin: admin@demo.com / Admin123!')
  console.log('Assureurs: Tous les assureurs utilisent le mot de passe: Assureur@2024!')
  console.log('Exemples:')
  console.log('- NSIA: contact@nsia.ci / Assureur@2024!')
  console.log('- SUNU: contact@sunu-assurance.ci / Assureur@2024!')
  console.log('- Allianz: contact@allianz.ci / Assureur@2024!')
  console.log('- Colina: contact@colina.ci / Assureur@2024!')
  console.log('- AXA: contact@axa.ci / Assureur@2024!')
  console.log('- Saham: contact@saham.ci / Assureur@2024!')

  // Verify inserted data
  console.log('\nVerifying inserted data...')
  
  const { data: users } = await supabase
    .from('users')
    .select('*')
  console.log('Users:', users?.length)

  const { data: insurersList } = await supabase
    .from('insurers')
    .select('*')
  console.log('Insurers:', insurersList?.length)

  const { data: offers } = await supabase
    .from('InsuranceOffer')
    .select('*')
  console.log('Offers:', offers?.length)

  const { data: pricing } = await supabase
    .from('PricingConfig')
    .select('*')
  console.log('Pricing Configs:', pricing?.length)

  const { data: assures } = await supabase
    .from('assures')
    .select('*')
  console.log('Assures:', assures?.length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
