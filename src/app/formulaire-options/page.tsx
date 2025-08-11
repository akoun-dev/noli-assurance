'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, ArrowRight, ArrowLeft, Calendar, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function FormulaireOptions() {
  const [formData, setFormData] = useState({
    typeCouverture: '',
    dateEffet: '',
    dureeContrat: '1',
    niveauFranchise: 'standard',
    options: [] as string[]
  })

  const [errors, setErrors] = useState({
    typeCouverture: '',
    dateEffet: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [assureId, setAssureId] = useState<string | null>(null)
  const [quoteId, setQuoteId] = useState<string | null>(null)

  const insuranceOptions = [
    {
      id: 'tiers',
      name: 'Tiers',
      price: 'À partir de 25 000 FCFA/mois',
      description: 'Responsabilité civile obligatoire',
      features: ['Dommages causés aux tiers', 'Protection juridique', 'Assistance dépannage 0km'],
      color: 'bg-blue-100 border-blue-300'
    },
    {
      id: 'vol-incendie',
      name: 'Vol & Incendie',
      price: 'À partir de 45 000 FCFA/mois',
      description: 'Tiers + protection contre le vol et l\'incendie',
      features: ['Tous les risques Tiers', 'Vol du véhicule', 'Incendie', 'Bris de glaces'],
      color: 'bg-purple-100 border-purple-300'
    },
    {
      id: 'tous-risques',
      name: 'Tous risques',
      price: 'À partir de 75 000 FCFA/mois',
      description: 'Protection complète pour votre tranquillité d\'esprit',
      features: ['Toutes les garanties Vol & Incendie', 'Dommages tous accidents', 'Catastrophes naturelles', 'Véhicule de remplacement'],
      color: 'bg-green-100 border-green-300',
      recommended: true
    }
  ]

  const additionalOptions = [
    { id: 'conducteur-additionnel', name: 'Conducteur additionnel', description: 'Couverture pour les conducteurs additionnels' },
    { id: 'assistance-etendue', name: 'Assistance étendue', description: 'Assistance 24h/24 et véhicule de remplacement' },
    { id: 'protection-juridique', name: 'Protection juridique renforcée', description: 'Défense pénale et recours suite à accident' },
    { id: 'bris-de-glaces', name: 'Bris de glaces', description: 'Prise en charge des réparations de bris de glaces' },
    { id: 'catastrophes-naturelles', name: 'Catastrophes naturelles', description: 'Protection contre les intempéries et catastrophes' }
  ]

  useEffect(() => {
    // Vérifier d'abord la connexion au serveur
    const checkServer = async () => {
      try {
        const healthCheck = await fetch('/api/health')
        if (!healthCheck.ok) {
          console.error('Erreur de connexion au serveur:', healthCheck.status)
          alert('Le serveur ne répond pas. Veuillez réessayer plus tard.')
          return
        }
        
        // Récupérer l'ID de l'assuré depuis le localStorage
        const savedAssureId = localStorage.getItem('assureId')
        if (!savedAssureId) {
          // Rediriger vers la première étape si aucun ID d'assuré n'est trouvé
          window.location.href = '/formulaire-assure'
        } else {
          setAssureId(savedAssureId)
        }

        // Récupérer l'ID du devis depuis le localStorage (s'il existe)
        const savedQuoteId = localStorage.getItem('quoteId')
        if (savedQuoteId) {
          setQuoteId(savedQuoteId)
        }
      } catch (error) {
        console.error('Erreur de connexion:', error)
        alert('Impossible de se connecter au serveur. Vérifiez votre connexion internet.')
      }
    }

    checkServer()
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = { 
      typeCouverture: '', 
      dateEffet: ''
    }

    if (!formData.typeCouverture) {
      newErrors.typeCouverture = 'Le type de couverture est requis'
      isValid = false
    }

    if (!formData.dateEffet) {
      newErrors.dateEffet = 'La date d\'effet est requise'
      isValid = false
    } else {
      // Valider le format de date (jj/mm/aaaa)
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      if (!dateRegex.test(formData.dateEffet)) {
        newErrors.dateEffet = 'Format de date invalide (jj/mm/aaaa)'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && assureId) {
      setIsLoading(true)
      try {
        console.log('AssureId utilisé:', assureId)
        const payload = {
          ...formData,
          assureId,
          quoteId,
          dateEffet: formData.dateEffet
        }
        
        console.log('Envoi des données au serveur:', payload)
        
        const response = await fetch('/api/formulaire-options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Options enregistrées:', data)
          
          // Stocker l'ID du devis pour la page de résultats
          if (data.quote?.id) {
            localStorage.setItem('quoteId', data.quote.id)
          }
          
          // Redirection vers la page de comparaison des offres
          window.location.href = '/resultats'
        } else {
          try {
            const errorData = await response.json()
            console.error('Erreur détaillée du serveur:', {
              status: response.status,
              error: errorData,
              url: response.url
            })
            
            // Si l'erreur concerne un devis invalide, nettoyer le localStorage
            if (errorData.error?.includes('No record was found for an update')) {
              localStorage.removeItem('quoteId')
              setQuoteId(null)
              alert('Votre session a expiré. Veuillez recommencer le formulaire.')
              window.location.href = '/formulaire-assure'
              return
            }
            
            const errorMessage = errorData.error || errorData.message || 'Une erreur est survenue lors de l\'enregistrement'
            alert(`Erreur ${response.status}: ${errorMessage}`)
          } catch (parseError) {
            console.error('Erreur de réponse:', {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
              error: parseError
            })
            alert(`Erreur ${response.status}: ${response.statusText || 'Une erreur de réseau est survenue. Veuillez réessayer.'}`)
          }
        }
      } catch (error) {
        console.error('Erreur de réseau:', error)
        alert('Une erreur de réseau est survenue')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur lorsque l'utilisateur commence à taper
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDateChange = (value: string) => {
    // Formater la date automatiquement en jj/mm/aaaa
    let formatted = value.replace(/\D/g, '')
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2)
    }
    if (formatted.length >= 5) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9)
    }
    handleInputChange('dateEffet', formatted)
  }

  const handleOptionToggle = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.includes(optionId)
        ? prev.options.filter(id => id !== optionId)
        : [...prev.options, optionId]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">NOLI</h1>
                <p className="text-xs text-gray-500">Assurance Auto</p>
              </div>
            </Link>
            
            <Button variant="ghost" asChild>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Formulaire Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">Profil de l'assuré</span>
                </div>
                <div className="flex-1 h-1 bg-green-600 mx-4">
                  <div className="h-1 bg-green-600 w-full"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">Informations véhicule</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div className="h-1 bg-blue-600 w-full"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">Options</span>
                </div>
              </div>
            </div>

            {/* Formulaire Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Votre assurance
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Choisissez votre formule d'assurance et les options qui vous conviennent
                  </CardDescription>
                  <div className="flex items-center justify-center mt-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      100% complète
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 sm:px-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Formule d'assurance */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        Quelle formule souhaitez-vous ?
                      </Label>
                      
                      <RadioGroup 
                        value={formData.typeCouverture} 
                        onValueChange={(value) => handleInputChange('typeCouverture', value)}
                        className="space-y-4"
                      >
                        {insuranceOptions.map((option) => (
                          <div key={option.id} className="relative">
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={option.id}
                              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                formData.typeCouverture === option.id
                                  ? `${option.color} border-blue-500 bg-blue-50`
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                      formData.typeCouverture === option.id
                                        ? 'border-blue-600 bg-blue-600'
                                        : 'border-gray-300'
                                    }`}>
                                      {formData.typeCouverture === option.id && (
                                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        {option.name}
                                        {option.recommended && (
                                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                            Recommandé
                                          </span>
                                        )}
                                      </h3>
                                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                      <p className="text-lg font-bold text-blue-600 mt-2">{option.price}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="ml-7 mt-3">
                                    <ul className="space-y-1">
                                      {option.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-600">
                                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                          {feature}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      
                      {errors.typeCouverture && (
                        <p className="text-sm text-red-600 mt-1">{errors.typeCouverture}</p>
                      )}
                    </div>

                    {/* Date d'effet et durée */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dateEffet" className="text-sm font-medium text-gray-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          Date d'effet *
                        </Label>
                        <Input
                          id="dateEffet"
                          type="text"
                          placeholder="jj/mm/aaaa"
                          value={formData.dateEffet}
                          onChange={(e) => handleDateChange(e.target.value)}
                          maxLength={10}
                          className={`h-12 text-base ${errors.dateEffet ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                        />
                        {errors.dateEffet && (
                          <p className="text-sm text-red-600 mt-1">{errors.dateEffet}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dureeContrat" className="text-sm font-medium text-gray-700">
                          Durée du contrat
                        </Label>
                        <Select value={formData.dureeContrat} onValueChange={(value) => handleInputChange('dureeContrat', value)}>
                          <SelectTrigger className="h-12 text-base border-gray-300 focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 an</SelectItem>
                            <SelectItem value="2">2 ans</SelectItem>
                            <SelectItem value="3">3 ans</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Options additionnelles */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-900 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-blue-600" />
                        Options additionnelles
                      </Label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {additionalOptions.map((option) => (
                          <div key={option.id} className="relative">
                            <input
                              type="checkbox"
                              id={option.id}
                              checked={formData.options.includes(option.id)}
                              onChange={() => handleOptionToggle(option.id)}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={option.id}
                              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                formData.options.includes(option.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0 ${
                                  formData.options.includes(option.id)
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300'
                                }`}>
                                  {formData.options.includes(option.id) && (
                                    <CheckCircle className="w-3 h-3 text-white m-1" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{option.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Boutons de navigation */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="flex-1 h-12 text-base font-medium border-2 border-gray-300 hover:border-blue-600"
                      >
                        <Link href="/formulaire-vehicule">
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Précédent
                        </Link>
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            Comparer les offres
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}