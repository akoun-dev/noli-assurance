'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, ArrowRight, User, Mail, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function FormulaireAssure() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    isWhatsApp: false
  })

  const [errors, setErrors] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    let isValid = true
    const newErrors = { nom: '', prenom: '', email: '', telephone: '' }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis'
      isValid = false
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
      isValid = false
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis'
      isValid = false
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Le numéro de téléphone n\'est pas valide'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/formulaire-assure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Assuré enregistré:', data)
          // Redirection vers l'étape suivante (informations véhicule)
          // Vous pouvez stocker l'ID de l'assuré dans le localStorage ou un state global
          localStorage.setItem('assureId', data.assure.id)
          // Redirection vers la page suivante
          window.location.href = '/formulaire-vehicule'
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
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">Profil de l'assuré</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div className="h-1 bg-blue-600 w-1/3"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-400">Informations véhicule</span>
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
                    Profil de l'assuré
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Ces informations nous permettent de vous identifier et d'éditer votre police d'assurance
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 sm:px-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom */}
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        Nom *
                      </Label>
                      <Input
                        id="nom"
                        type="text"
                        placeholder="Votre nom"
                        value={formData.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        className={`h-12 text-base ${errors.nom ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      {errors.nom && (
                        <p className="text-sm text-red-600 mt-1">{errors.nom}</p>
                      )}
                    </div>

                    {/* Prénom */}
                    <div className="space-y-2">
                      <Label htmlFor="prenom" className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        Prénom *
                      </Label>
                      <Input
                        id="prenom"
                        type="text"
                        placeholder="Votre prénom"
                        value={formData.prenom}
                        onChange={(e) => handleInputChange('prenom', e.target.value)}
                        className={`h-12 text-base ${errors.prenom ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      {errors.prenom && (
                        <p className="text-sm text-red-600 mt-1">{errors.prenom}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        Adresse email de l'assuré *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`h-12 text-base ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="text-sm font-medium text-gray-700 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-blue-600" />
                        Numéro de téléphone * (obligatoire)
                      </Label>
                      <Input
                        id="telephone"
                        type="tel"
                        placeholder="07 00 00 00 00"
                        value={formData.telephone}
                        onChange={(e) => handleInputChange('telephone', e.target.value)}
                        className={`h-12 text-base ${errors.telephone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      {errors.telephone && (
                        <p className="text-sm text-red-600 mt-1">{errors.telephone}</p>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="whatsapp"
                        checked={formData.isWhatsApp}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isWhatsApp: checked as boolean }))
                        }
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Numéro WhatsApp
                        </Label>
                      </div>
                    </div>

                    {/* Bouton de soumission */}
                    <div className="pt-6">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            Continuer
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