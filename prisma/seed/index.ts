import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Créer les utilisateurs de base
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      telephone: '+2250102030405',
      nom: 'Admin',
      prenom: 'User',
      password: await hash('password123', 12),
      role: 'ADMIN'
    }
  })

  const insurerUser = await prisma.user.create({
    data: {
      email: 'assureur@demo.com',
      telephone: '+2250102030406',
      nom: 'Assureur',
      prenom: 'User',
      password: await hash('password123', 12),
      role: 'INSURER'
    }
  })

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@demo.com',
      telephone: '+2250102030407',
      nom: 'Regular',
      prenom: 'User',
      password: await hash('password123', 12),
      role: 'USER'
    }
  })

  // Créer les assureurs avec leur utilisateur associé
  const insurers = await Promise.all([
    prisma.insurer.create({
      data: {
        userId: insurerUser.id,
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
      }
    }),
    prisma.insurer.create({
      data: {
        userId: await prisma.user.create({
          data: {
            email: 'atlantique@demo.com',
            telephone: '+2250102030408',
            nom: 'Atlantique',
            prenom: 'Assurance',
            password: await hash('password123', 12),
            role: 'INSURER'
          }
        }).then(u => u.id),
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
      }
    }),
    prisma.insurer.create({
      data: {
        userId: await prisma.user.create({
          data: {
            email: 'saham@demo.com',
            telephone: '+2250102030409',
            nom: 'Saham',
            prenom: 'Assurance',
            password: await hash('password123', 12),
            role: 'INSURER'
          }
        }).then(u => u.id),
        nom: 'Saham',
        prenom: 'Assurance',
        email: 'contact@sahamassurance.com',
        telephone: '+225 27 20 02 00 00',
        nomEntreprise: 'Saham Assurance',
        adresseEntreprise: 'Abidjan, Treichville',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2024-003',
        numeroAgrement: 'AG-2024-003',
        domaineActivite: 'Assurance Automobile',
        anneeExperience: '10',
        nombreEmployes: '200-300',
        siteWeb: 'https://www.sahamassurance.com',
        description: 'Excellente couverture avec options d\'assistance premium',
        statut: 'ACTIF'
      }
    }),
    prisma.insurer.create({
      data: {
        userId: await prisma.user.create({
          data: {
            email: 'allianz@demo.com',
            telephone: '+2250102030410',
            nom: 'Allianz',
            prenom: 'CI',
            password: await hash('password123', 12),
            role: 'INSURER'
          }
        }).then(u => u.id),
        nom: 'Allianz',
        prenom: 'CI',
        email: 'contact@allianz.ci',
        telephone: '+225 27 20 03 00 00',
        nomEntreprise: 'Allianz CI',
        adresseEntreprise: 'Abidjan, Cocody',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2024-004',
        numeroAgrement: 'AG-2024-004',
        domaineActivite: 'Assurance Automobile',
        anneeExperience: '20',
        nombreEmployes: '1000+',
        siteWeb: 'https://www.allianz.ci',
        description: 'Expert international proposant des couvertures complètes',
        statut: 'ACTIF'
      }
    }),
    prisma.insurer.create({
      data: {
        userId: await prisma.user.create({
          data: {
            email: 'axa@demo.com',
            telephone: '+2250102030411',
            nom: 'AXA',
            prenom: 'Assurance',
            password: await hash('password123', 12),
            role: 'INSURER'
          }
        }).then(u => u.id),
        nom: 'AXA',
        prenom: 'Assurance',
        email: 'contact@axa.ci',
        telephone: '+225 27 20 04 00 00',
        nomEntreprise: 'AXA Assurance',
        adresseEntreprise: 'Abidjan, Marcory',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2024-005',
        numeroAgrement: 'AG-2024-005',
        domaineActivite: 'Assurance Automobile',
        anneeExperience: '18',
        nombreEmployes: '800-1000',
        siteWeb: 'https://www.axa.ci',
        description: 'Solutions d\'assurance innovantes avec assistance 24/7',
        statut: 'ACTIF'
      }
    }),
    prisma.insurer.create({
      data: {
        userId: await prisma.user.create({
          data: {
            email: 'sunu@demo.com',
            telephone: '+2250102030412',
            nom: 'Sunu',
            prenom: 'Assurance',
            password: await hash('password123', 12),
            role: 'INSURER'
          }
        }).then(u => u.id),
        nom: 'Sunu',
        prenom: 'Assurance',
        email: 'contact@sunuassurance.com',
        telephone: '+225 27 20 05 00 00',
        nomEntreprise: 'Sunu Assurance',
        adresseEntreprise: 'Abidjan, Yopougon',
        siegeSocial: 'Abidjan, Plateau',
        numeroRegistre: 'CI-ABJ-2024-006',
        numeroAgrement: 'AG-2024-006',
        domaineActivite: 'Assurance Automobile',
        anneeExperience: '8',
        nombreEmployes: '100-200',
        siteWeb: 'https://www.sunuassurance.com',
        description: 'Tarifs compétitifs et gestion de sinistres efficace',
        statut: 'ACTIF'
      }
    })
  ])

  // Créer les offres d'assurance
  const offers = await Promise.all([
    // NSIA Assurance
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[0].id,
        name: 'Auto Premium',
        coverageLevel: 'Tous risques',
        monthlyPrice: 5200,
        annualPrice: 62400,
        franchise: 100000,
        description: 'Couverture complète avec garanties étendues et service premium'
      }
    }),
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[0].id,
        name: 'Auto Confort',
        coverageLevel: 'Tiers +',
        monthlyPrice: 3800,
        annualPrice: 45600,
        franchise: 150000,
        description: 'Bonne couverture avec garanties essentielles'
      }
    }),
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[0].id,
        name: 'Auto Éco',
        coverageLevel: 'Tiers',
        monthlyPrice: 2500,
        annualPrice: 30000,
        franchise: 200000,
        description: 'Solution économique pour les conducteurs prudents'
      }
    }),

    // Atlantique Assurance
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[1].id,
        name: 'Auto Excellence',
        coverageLevel: 'Tous risques',
        monthlyPrice: 5500,
        annualPrice: 66000,
        franchise: 75000,
        description: 'Meilleure couverture avec service exceptionnel'
      }
    }),
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[1].id,
        name: 'Auto Sécurité',
        coverageLevel: 'Tiers +',
        monthlyPrice: 4500,
        annualPrice: 54000,
        franchise: 100000,
        description: 'Excellent rapport qualité-prix'
      }
    }),

    // Saham Assurance
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[2].id,
        name: 'Auto Protection',
        coverageLevel: 'Tous risques',
        monthlyPrice: 4800,
        annualPrice: 57600,
        franchise: 125000,
        description: 'Protection complète avec assistance premium'
      }
    }),
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[2].id,
        name: 'Auto Essential',
        coverageLevel: 'Tiers',
        monthlyPrice: 2800,
        annualPrice: 33600,
        franchise: 175000,
        description: 'Couverture de base à prix compétitif'
      }
    }),

    // Allianz CI
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[3].id,
        name: 'Auto Max',
        coverageLevel: 'Tous risques',
        monthlyPrice: 6000,
        annualPrice: 72000,
        franchise: 50000,
        description: 'Couverture maximale avec toutes les garanties'
      }
    }),
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[3].id,
        name: 'Auto Standard',
        coverageLevel: 'Tiers +',
        monthlyPrice: 4200,
        annualPrice: 50400,
        franchise: 125000,
        description: 'Couverture équilibrée et fiable'
      }
    }),

    // AXA Assurance
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[4].id,
        name: 'Auto Sérénité',
        coverageLevel: 'Tous risques',
        monthlyPrice: 5800,
        annualPrice: 69600,
        franchise: 75000,
        description: 'Sérénité absolue avec assistance 24/7'
      }
    }),
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[4].id,
        name: 'Auto Liberté',
        coverageLevel: 'Tiers +',
        monthlyPrice: 4000,
        annualPrice: 48000,
        franchise: 150000,
        description: 'Liberté et protection à bon prix'
      }
    }),

    // Sunu Assurance
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[5].id,
        name: 'Auto Confiance',
        coverageLevel: 'Tous risques',
        monthlyPrice: 5000,
        annualPrice: 60000,
        franchise: 100000,
        description: 'Confiance et sécurité garanties'
      }
    }),
    prisma.insuranceOffer.create({
      data: {
        insurerId: insurers[5].id,
        name: 'Auto Économique',
        coverageLevel: 'Tiers',
        monthlyPrice: 2600,
        annualPrice: 31200,
        franchise: 200000,
        description: 'Protection économique et efficace'
      }
    })
  ])

  // Ajouter les caractéristiques aux offres
  const featuresList = [
    'Assistance 24/7',
    'Véhicule de remplacement',
    'Protection juridique',
    'Individuel Accident Passager',
    'Individuel Accident Conducteur',
    'Défense pénale',
    'Bris de glace',
    'Vol',
    'Incendie',
    'Dégâts des eaux'
  ] as const

  type FeatureType = typeof featuresList[number]

  for (const offer of offers) {
    // Caractéristiques incluses selon le niveau de couverture
    const includedFeatures: FeatureType[] = []
    const optionalFeatures: FeatureType[] = []

    if (offer.coverageLevel === 'Tous risques') {
      includedFeatures.push('Assistance 24/7', 'Véhicule de remplacement', 'Protection juridique', 'Bris de glace', 'Vol', 'Incendie', 'Dégâts des eaux')
      optionalFeatures.push('Individuel Accident Passager', 'Individuel Accident Conducteur', 'Défense pénale')
    } else if (offer.coverageLevel === 'Tiers +') {
      includedFeatures.push('Assistance 24/7', 'Vol', 'Incendie')
      optionalFeatures.push('Véhicule de remplacement', 'Protection juridique', 'Individuel Accident Passager', 'Individuel Accident Conducteur', 'Bris de glace', 'Défense pénale', 'Dégâts des eaux')
    } else {
      includedFeatures.push('Assistance 24/7')
      optionalFeatures.push('Véhicule de remplacement', 'Protection juridique', 'Individuel Accident Passager', 'Individuel Accident Conducteur', 'Bris de glace', 'Vol', 'Incendie', 'Défense pénale', 'Dégâts des eaux')
    }

    // Créer les caractéristiques incluses
    for (const feature of includedFeatures) {
      await prisma.offerFeature.create({
        data: {
          offerId: offer.id,
          featureName: feature,
          featureType: 'included'
        }
      })
    }

    // Créer les caractéristiques optionnelles
    for (const feature of optionalFeatures) {
      await prisma.offerFeature.create({
        data: {
          offerId: offer.id,
          featureName: feature,
          featureType: 'optional'
        }
      })
    }
  }

  // Créer quelques configurations de prix
  await Promise.all([
    prisma.pricingConfig.create({
      data: {
        insurerId: insurers[0].id,
        coverageLevel: 'Tiers',
        basePrice: 25000,
        ageFactor: 1.0,
        vehicleAgeFactor: 1.0,
        powerFactor: 1.0,
        franchiseFactor: 1.0,
        validFrom: new Date('2024-01-01')
      }
    }),
    prisma.pricingConfig.create({
      data: {
        insurerId: insurers[0].id,
        coverageLevel: 'Tiers +',
        basePrice: 45000,
        ageFactor: 1.0,
        vehicleAgeFactor: 1.0,
        powerFactor: 1.0,
        franchiseFactor: 1.0,
        validFrom: new Date('2024-01-01')
      }
    }),
    prisma.pricingConfig.create({
      data: {
        insurerId: insurers[0].id,
        coverageLevel: 'Tous risques',
        basePrice: 62000,
        ageFactor: 1.0,
        vehicleAgeFactor: 1.0,
        powerFactor: 1.0,
        franchiseFactor: 1.0,
        validFrom: new Date('2024-01-01')
      }
    })
  ])

  console.log('Database seeded successfully!')
  console.log('Utilisateurs créés:')
  console.log('- Admin: admin@demo.com / password123')
  console.log('- Assureur: assureur@demo.com / password123')
  console.log('- User: user@demo.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })