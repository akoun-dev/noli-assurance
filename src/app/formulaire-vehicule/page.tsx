'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ArrowRight, ArrowLeft, Car, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default function FormulaireVehicule() {
  const [formData, setFormData] = useState({
    energie: '',
    puissanceFiscale: '',
    nombrePlaces: '',
    dateMiseCirculation: '',
    valeurNeuve: '',
    valeurVenale: '',
    usageVehicule: ''
  })

  const [errors, setErrors] = useState({
    energie: '',
    puissanceFiscale: '',
    nombrePlaces: '',
    dateMiseCirculation: '',
    valeurNeuve: '',
    valeurVenale: '',
    usageVehicule: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [assureId, setAssureId] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer l'ID de l'assuré depuis le localStorage
    const savedAssureId = localStorage.getItem('assureId')
    if (!savedAssureId) {
      // Rediriger vers la première étape si aucun ID d'assuré n'est trouvé
      window.location.href = '/formulaire-assure'
    } else {
      setAssureId(savedAssureId)
    }
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = { 
      energie: '', 
      puissanceFiscale: '', 
      nombrePlaces: '', 
      dateMiseCirculation: '', 
      valeurNeuve: '', 
      valeurVenale: '', 
      usageVehicule: '' 
    }

    if (!formData.energie) {
      newErrors.energie = 'Le type de carburant est requis'
      isValid = false
    }

    if (!formData.puissanceFiscale) {
      newErrors.puissanceFiscale = 'La puissance fiscale est requise'
      isValid = false
    }

    if (!formData.nombrePlaces) {
      newErrors.nombrePlaces = 'Le nombre de places est requis'
      isValid = false
    }

    if (!formData.dateMiseCirculation) {
      newErrors.dateMiseCirculation = 'La date de mise en circulation est requise'
      isValid = false
    } else {
      // Valider le format de date (jj/mm/aaaa)
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      if (!dateRegex.test(formData.dateMiseCirculation)) {
        newErrors.dateMiseCirculation = 'Format de date invalide (jj/mm/aaaa)'
        isValid = false
      }
    }

    if (!formData.valeurNeuve) {
      newErrors.valeurNeuve = 'La valeur neuve est requise'
      isValid = false
    } else if (isNaN(Number(formData.valeurNeuve.replace(/\s/g, '')))) {
      newErrors.valeurNeuve = 'La valeur doit être un nombre'
      isValid = false
    }

    if (!formData.valeurVenale) {
      newErrors.valeurVenale = 'La valeur actuelle est requise'
      isValid = false
    } else if (isNaN(Number(formData.valeurVenale.replace(/\s/g, '')))) {
      newErrors.valeurVenale = 'La valeur doit être un nombre'
      isValid = false
    }

    if (!formData.usageVehicule) {
      newErrors.usageVehicule = 'L\'usage du véhicule est requis'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && assureId) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/formulaire-vehicule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            assureId,
            // Nettoyer les valeurs numériques
            valeurNeuve: formData.valeurNeuve.replace(/\s/g, ''),
            valeurVenale: formData.valeurVenale.replace(/\s/g, '')
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Véhicule enregistré:', data)
          // Redirection vers l'étape suivante (options)
          window.location.href = '/formulaire-options'
        } else {
          try {
            const errorData = await response.json()
            const errorMessage = errorData.error || errorData.message || 'Une erreur est survenue lors de l\'enregistrement'
            console.error('Erreur:', errorMessage)
            alert(errorMessage)
          } catch {
            // Si la réponse n'est pas du JSON valide
            console.error('Erreur de réponse:', response.status, response.statusText)
            alert('Une erreur de réseau est survenue. Veuillez réessayer.')
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

  const formatNumber = (value: string) => {
    // Formater le nombre avec des espaces pour les milliers
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handleNumberChange = (field: string, value: string) => {
    // Ne permettre que les chiffres
    const numericValue = value.replace(/[^\d]/g, '')
    const formattedValue = formatNumber(numericValue)
    handleInputChange(field, formattedValue)
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
    handleInputChange('dateMiseCirculation', formatted)
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
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">Profil de l'assuré</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div className="h-1 bg-blue-600 w-2/3"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">Informations véhicule</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-400">Options</span>
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
                    Informations véhicule
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Renseignez les caractéristiques de votre véhicule pour obtenir un devis personnalisé
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 sm:px-8">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                    {/* Type de carburant */}
                    <div className="space-y-2">
                      <Label htmlFor="energie" className="text-sm font-medium text-gray-700 flex items-center">
                        <Car className="w-4 h-4 mr-2 text-blue-600" />
                        Carburant *
                      </Label>
                      <Select value={formData.energie} onValueChange={(value) => handleInputChange('energie', value)}>
                        <SelectTrigger className={`w-full h-12 text-base ${errors.energie ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
                          <SelectValue placeholder="Sélectionner le type de carburant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="essence">Essence</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="hybride">Hybride</SelectItem>
                          <SelectItem value="electrique">Électrique</SelectItem>
                          <SelectItem value="gpl">GPL</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.energie && (
                        <p className="text-sm text-red-600 mt-1">{errors.energie}</p>
                      )}
                    </div>

                    {/* Puissance fiscale */}
                    <div className="space-y-2">
                      <Label htmlFor="puissanceFiscale" className="text-sm font-medium text-gray-700">
                        Puissance fiscale *
                      </Label>
                      <Select value={formData.puissanceFiscale} onValueChange={(value) => handleInputChange('puissanceFiscale', value)}>
                        <SelectTrigger className={`w-full h-12 text-base ${errors.puissanceFiscale ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 CV</SelectItem>
                          <SelectItem value="4">4 CV</SelectItem>
                          <SelectItem value="5">5 CV</SelectItem>
                          <SelectItem value="6">6 CV</SelectItem>
                          <SelectItem value="7">7 CV</SelectItem>
                          <SelectItem value="8">8 CV</SelectItem>
                          <SelectItem value="9">9 CV</SelectItem>
                          <SelectItem value="10">10 CV</SelectItem>
                          <SelectItem value="11">11 CV</SelectItem>
                          <SelectItem value="12">12 CV</SelectItem>
                          <SelectItem value="13">13 CV</SelectItem>
                          <SelectItem value="14">14 CV</SelectItem>
                          <SelectItem value="15">15 CV</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.puissanceFiscale && (
                        <p className="text-sm text-red-600 mt-1">{errors.puissanceFiscale}</p>
                      )}
                    </div>

                    {/* Nombre de places */}
                    <div className="space-y-2">
                      <Label htmlFor="nombrePlaces" className="text-sm font-medium text-gray-700">
                        Nombre de places *
                      </Label>
                      <Select value={formData.nombrePlaces} onValueChange={(value) => handleInputChange('nombrePlaces', value)}>
                        <SelectTrigger className={`w-full h-12 text-base ${errors.nombrePlaces ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 places</SelectItem>
                          <SelectItem value="3">3 places</SelectItem>
                          <SelectItem value="4">4 places</SelectItem>
                          <SelectItem value="5">5 places</SelectItem>
                          <SelectItem value="6">6 places</SelectItem>
                          <SelectItem value="7">7 places</SelectItem>
                          <SelectItem value="8">8 places</SelectItem>
                          <SelectItem value="9">9 places</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.nombrePlaces && (
                        <p className="text-sm text-red-600 mt-1">{errors.nombrePlaces}</p>
                      )}
                    </div>

                    {/* Date de mise en circulation */}
                    <div className="space-y-2">
                      <Label htmlFor="dateMiseCirculation" className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        Date de mise en circulation * (jj/mm/aaaa)
                      </Label>
                      <Input
                        id="dateMiseCirculation"
                        type="text"
                        placeholder="jj/mm/aaaa"
                        value={formData.dateMiseCirculation}
                        onChange={(e) => handleDateChange(e.target.value)}
                        maxLength={10}
                        className={`h-12 text-base ${errors.dateMiseCirculation ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      {errors.dateMiseCirculation && (
                        <p className="text-sm text-red-600 mt-1">{errors.dateMiseCirculation}</p>
                      )}
                    </div>

                    {/* Valeur neuve */}
                    <div className="space-y-2">
                      <Label htmlFor="valeurNeuve" className="text-sm font-medium text-gray-700 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        Valeur neuve * (FCFA)
                      </Label>
                      <Input
                        id="valeurNeuve"
                        type="text"
                        placeholder="12 000 000"
                        value={formData.valeurNeuve}
                        onChange={(e) => handleNumberChange('valeurNeuve', e.target.value)}
                        className={`h-12 text-base ${errors.valeurNeuve ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      {errors.valeurNeuve && (
                        <p className="text-sm text-red-600 mt-1">{errors.valeurNeuve}</p>
                      )}
                    </div>

                    {/* Valeur actuelle */}
                    <div className="space-y-2">
                      <Label htmlFor="valeurVenale" className="text-sm font-medium text-gray-700 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        Valeur actuelle * (FCFA)
                      </Label>
                      <Input
                        id="valeurVenale"
                        type="text"
                        placeholder="6 500 000"
                        value={formData.valeurVenale}
                        onChange={(e) => handleNumberChange('valeurVenale', e.target.value)}
                        className={`h-12 text-base ${errors.valeurVenale ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      {errors.valeurVenale && (
                        <p className="text-sm text-red-600 mt-1">{errors.valeurVenale}</p>
                      )}
                    </div>

                    {/* Usage du véhicule */}
                    <div className="space-y-2">
                      <Label htmlFor="usageVehicule" className="text-sm font-medium text-gray-700">
                        Usage du véhicule *
                      </Label>
                      <Select value={formData.usageVehicule} onValueChange={(value) => handleInputChange('usageVehicule', value)}>
                        <SelectTrigger className={`w-full h-12 text-base ${errors.usageVehicule ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prive">Privé</SelectItem>
                          <SelectItem value="professionnel">Professionnel</SelectItem>
                          <SelectItem value="affaire">Affaire</SelectItem>
                          <SelectItem value="taxi">Taxi</SelectItem>
                          <SelectItem value="transport">Transport de marchandises</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.usageVehicule && (
                        <p className="text-sm text-red-600 mt-1">{errors.usageVehicule}</p>
                      )}
                    </div>

                    {/* Boutons de navigation */}
                    <div className="col-span-full flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="flex-1 h-12 text-base font-medium border-2 border-gray-300 hover:border-blue-600"
                      >
                        <Link href="/formulaire-assure">
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
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            Suivant
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