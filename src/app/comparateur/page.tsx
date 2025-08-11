'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Shield, Car, Settings, Info, User, Building, Phone, Mail, Calendar, Zap } from "lucide-react"
import Link from "next/link"
import { UserProfile } from "@/components/UserProfile"
import { useSession } from "next-auth/react"

type FormData = {
  // Étape 1: Profil conducteur
  nom: string
  prenom: string
  email: string
  telephone: string
  dateNaissance: string
  datePermis: string
  antecedentsSinistres: string
  nombreSinistres: string
  typeSinistres: string[]
  usagePrincipal: string
  kilometrageAnnuel: string
  
  // Étape 2: Véhicule & Usage
  energie: string
  puissanceFiscale: string
  nombrePlaces: string
  dateMiseCirculation: string
  valeurNeuve: string
  valeurVenale: string
  usageVehicule: string
  
  // Étape 3: Besoins d'assurance
  dateEffet: string
  dureeContrat: string
  typeCouverture: string
  options: string[]
}

const optionsAssurance = [
  { id: 'assistance', label: 'Assistance 24/7', description: 'Dépannage 24h/24 et 7j/7' },
  { id: 'individuel_accident_passager', label: 'Individuel Accident Passager', description: 'Protection des passagers' },
  { id: 'individuel_accident_conducteur', label: 'Individuel Accident Conducteur', description: 'Protection du conducteur' },
  { id: 'protection_juridique', label: 'Protection Juridique', description: 'Accompagnement juridique' },
  { id: 'vehicule_remplacement', label: 'Véhicule de remplacement', description: 'Véhicule de prêt' }
]

export default function ComparateurPage() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    datePermis: '',
    antecedentsSinistres: '',
    nombreSinistres: '',
    typeSinistres: [],
    usagePrincipal: '',
    kilometrageAnnuel: '',
    energie: '',
    puissanceFiscale: '',
    nombrePlaces: '',
    dateMiseCirculation: '',
    valeurNeuve: '',
    valeurVenale: '',
    usageVehicule: '',
    dateEffet: '',
    dureeContrat: '',
    typeCouverture: '',
    options: []
  })

  // Effet pour pré-remplir les données utilisateur et rediriger vers l'étape 2 si connecté
  useEffect(() => {
    if (session?.user) {
      // Pré-remplir les informations de base de l'utilisateur
      setFormData(prev => ({
        ...prev,
        nom: session.user.name?.split(' ')[1] || session.user.name || '',
        prenom: session.user.name?.split(' ')[0] || '',
        email: session.user.email || '',
        telephone: session.user.telephone || ''
      }))
      
      // Rediriger vers l'étape 2 (véhicule) car l'étape 1 est pré-remplie
      setCurrentStep(2)
    } else {
      // Si l'utilisateur n'est pas connecté, commencer par l'étape 1
      setCurrentStep(1)
    }
  }, [session])

  const trackEvent = (eventType: string, eventData?: any) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        eventData
      })
    }).catch(console.error)
  }

  useEffect(() => {
    trackEvent('page_view', { page: 'comparateur' })
    trackEvent('form_start', { form: 'insurance_comparison' })
  }, [])

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    try {
      trackEvent('form_complete', { form: 'insurance_comparison', steps: 3 })
      
      // Envoyer les données à l'API de comparaison
      const response = await fetch('/api/comparateur/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      
      if (result.success) {
        trackEvent('quote_request', { 
          form: 'insurance_comparison', 
          offers_count: result.offers.length 
        })
        
        // Stocker les résultats dans sessionStorage pour la page suivante
        sessionStorage.setItem('comparisonResults', JSON.stringify(result.offers))
        sessionStorage.setItem('comparisonData', JSON.stringify(formData))
        
        // Rediriger vers la page de résultats
        window.location.href = '/resultats'
      } else {
        alert('Une erreur est survenue lors de la comparaison')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Une erreur est survenue lors de la soumission du formulaire')
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="h-5 w-5" />
      case 2: return <Car className="h-5 w-5" />
      case 3: return <Settings className="h-5 w-5" />
      default: return <Shield className="h-5 w-5" />
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Profil conducteur"
      case 2: return "Véhicule & Usage"
      case 3: return "Besoins d'assurance"
      default: return ""
    }
  }

  // Animation variants
  const stepVariants = {
    hidden: { 
      opacity: 0, 
      x: 300,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: -300,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  const progressVariants = {
    hidden: { width: 0 },
    visible: { width: `${progress}%` }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <User className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-blue-800 font-medium">Étape 1/3 : Vos informations personnelles</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nom" className="font-medium text-gray-700">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => updateFormData('nom', e.target.value)}
            placeholder="Votre nom"
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={!!session}
          />
          {session && (
            <p className="text-xs text-blue-600">Pré-rempli depuis votre profil</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom" className="font-medium text-gray-700">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => updateFormData('prenom', e.target.value)}
            placeholder="Votre prénom"
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={!!session}
          />
          {session && (
            <p className="text-xs text-blue-600">Pré-rempli depuis votre profil</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium text-gray-700">Adresse email de l'assuré *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="exemple@email.com"
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={!!session}
          />
          {session && (
            <p className="text-xs text-blue-600">Pré-rempli depuis votre profil</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone" className="font-medium text-gray-700">Numéro de téléphone * (obligatoire)</Label>
          <Input
            id="telephone"
            value={formData.telephone}
            onChange={(e) => updateFormData('telephone', e.target.value)}
            placeholder="07 00 00 00 00"
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={!!session}
          />
          {session && (
            <p className="text-xs text-blue-600">Pré-rempli depuis votre profil</p>
          )}
        </div>
      </div>

      {session && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800 font-medium">Vous êtes connecté !</p>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Vos informations sont pré-remplies. Vous pouvez les modifier si nécessaire avant de continuer.
          </p>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Car className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800 font-medium">Étape 2/3 : Informations sur votre véhicule</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="font-medium text-gray-700">Energie *</Label>
          <Select value={formData.energie} onValueChange={(value) => updateFormData('energie', value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="essence">Essence</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-medium text-gray-700">Puissance Fiscale *</Label>
          <Select value={formData.puissanceFiscale} onValueChange={(value) => updateFormData('puissanceFiscale', value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {formData.energie === 'essence' ? (
                <>
                  <SelectItem value="1">1 CV</SelectItem>
                  <SelectItem value="2">2 CV</SelectItem>
                  <SelectItem value="3">3 CV</SelectItem>
                  <SelectItem value="4">4 CV</SelectItem>
                  <SelectItem value="5">5 CV</SelectItem>
                  <SelectItem value="6">6 CV</SelectItem>
                  <SelectItem value="7">7 CV</SelectItem>
                  <SelectItem value="8">8 CV</SelectItem>
                  <SelectItem value="9">9 CV</SelectItem>
                  <SelectItem value="10">10 CV</SelectItem>
                  <SelectItem value="11">11 CV</SelectItem>
                  <SelectItem value="12+">12+ CV</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="1">1 CV</SelectItem>
                  <SelectItem value="2">2 CV</SelectItem>
                  <SelectItem value="3">3 CV</SelectItem>
                  <SelectItem value="4">4 CV</SelectItem>
                  <SelectItem value="5">5 CV</SelectItem>
                  <SelectItem value="6">6 CV</SelectItem>
                  <SelectItem value="7">7 CV</SelectItem>
                  <SelectItem value="8">8 CV</SelectItem>
                  <SelectItem value="9+">9+ CV</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-medium text-gray-700">Nombre de places *</Label>
          <Select value={formData.nombrePlaces} onValueChange={(value) => updateFormData('nombrePlaces', value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 places</SelectItem>
              <SelectItem value="4">4 places</SelectItem>
              <SelectItem value="5">5 places</SelectItem>
              <SelectItem value="6">6 places</SelectItem>
              <SelectItem value="7">7 places</SelectItem>
              <SelectItem value="8+">8+ places</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="font-medium text-gray-700">Usage du véhicule *</Label>
          <Select value={formData.usageVehicule} onValueChange={(value) => updateFormData('usageVehicule', value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prive">Privé</SelectItem>
              <SelectItem value="professionnel">Professionnel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="valeurNeuve" className="font-medium text-gray-700">Valeur neuve (FCFA) *</Label>
          <Input
            id="valeurNeuve"
            type="number"
            value={formData.valeurNeuve}
            onChange={(e) => updateFormData('valeurNeuve', e.target.value)}
            placeholder="12 000 000"
            className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valeurVenale" className="font-medium text-gray-700">Valeur vénale (actuelle) (FCFA) *</Label>
          <Input
            id="valeurVenale"
            type="number"
            value={formData.valeurVenale}
            onChange={(e) => updateFormData('valeurVenale', e.target.value)}
            placeholder="6 500 000"
            className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateMiseCirculation" className="font-medium text-gray-700">Date de mise en circulation *</Label>
        <Input
          id="dateMiseCirculation"
          type="date"
          value={formData.dateMiseCirculation}
          onChange={(e) => updateFormData('dateMiseCirculation', e.target.value)}
          placeholder="jj / mm / aaaa"
          className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-purple-600 mr-2" />
          <p className="text-purple-800 font-medium">Étape 3/3 : Vos besoins d'assurance</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dateEffet" className="font-medium text-gray-700">Date d'effet souhaitée *</Label>
          <Input
            id="dateEffet"
            type="date"
            value={formData.dateEffet || ''}
            onChange={(e) => updateFormData('dateEffet', e.target.value)}
            placeholder="jj / mm / aaaa"
            className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-medium text-gray-700">Durée du contrat *</Label>
          <Select value={formData.dureeContrat || ''} onValueChange={(value) => updateFormData('dureeContrat', value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_an">1 an</SelectItem>
              <SelectItem value="6_mois">6 mois</SelectItem>
              <SelectItem value="3_mois">3 mois</SelectItem>
              <SelectItem value="1_mois">1 mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-medium text-gray-700">Type de couverture *</Label>
          <Select value={formData.typeCouverture} onValueChange={(value) => updateFormData('typeCouverture', value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tiers">Tiers</SelectItem>
              <SelectItem value="vol_incendie">Vol & Incendie</SelectItem>
              <SelectItem value="tous_risques">Tous risques</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="font-medium text-lg text-gray-700">Options additionnelles</Label>
        <div className="grid md:grid-cols-3 gap-4">
          {optionsAssurance.map((option) => (
            <Card key={option.id} className="cursor-pointer transition-all duration-300 hover:shadow-md border-2 border-gray-200 hover:border-purple-300">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={formData.options.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const currentOptions = formData.options
                      if (checked) {
                        updateFormData('options', [...currentOptions, option.id])
                      } else {
                        updateFormData('options', currentOptions.filter(opt => opt !== option.id))
                      }
                    }}
                    className="mt-1 text-purple-600 border-purple-300 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="font-medium cursor-pointer text-gray-700">
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">NOLI</h1>
                <p className="text-xs text-gray-500">Assurance Auto</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-blue-600 text-blue-600">
                Étape {currentStep} sur {totalSteps}
              </Badge>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {getStepIcon(currentStep)}
              <span className="font-semibold text-lg">
                {getStepTitle(currentStep)}
              </span>
            </motion.div>
            <motion.span 
              className="text-sm text-gray-600 font-medium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {Math.round(progress)}% complété
            </motion.span>
          </div>
          <motion.div 
            className="h-3 bg-gray-200 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3].map((step, index) => (
              <motion.div 
                key={step} 
                className="flex items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <motion.div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {step}
                </motion.div>
                <div className={`ml-2 text-sm font-medium ${
                  step <= currentStep ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {getStepTitle(step)}
                </div>
                {step < 3 && (
                  <motion.div 
                    className={`mx-4 w-16 h-0.5 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentStep === 1 && "Vos informations personnelles"}
                    {currentStep === 2 && "Informations sur votre véhicule"}
                    {currentStep === 3 && "Vos besoins d'assurance"}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    {currentStep === 1 && "Veuillez renseigner vos informations pour commencer la comparaison"}
                    {currentStep === 2 && "Décrivez votre véhicule pour obtenir des offres précises"}
                    {currentStep === 3 && "Personnalisez votre couverture d'assurance selon vos besoins"}
                  </CardDescription>
                </motion.div>
              </CardHeader>
            <CardContent className="pb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </motion.div>
              </AnimatePresence>
              
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                </motion.div>
                
                {currentStep < totalSteps ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={handleNext}
                      className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={handleSubmit}
                      className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Comparer les offres
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}