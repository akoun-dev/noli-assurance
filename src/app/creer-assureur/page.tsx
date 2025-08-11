'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, UserCheck, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from 'next/navigation'

type FormData = {
  nom: string
  prenom: string
  email: string
  telephone: string
  nomEntreprise: string
  adresseEntreprise: string
  siegeSocial: string
  numeroRegistre: string
  numeroAgrement: string
  domaineActivite: string
  anneeExperience: string
  nombreEmployes: string
  siteWeb: string
  description: string
}

export default function CreerAssureurPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    nomEntreprise: '',
    adresseEntreprise: '',
    siegeSocial: '',
    numeroRegistre: '',
    numeroAgrement: '',
    domaineActivite: '',
    anneeExperience: '',
    nombreEmployes: '',
    siteWeb: '',
    description: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/insurers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Assureur créé avec succès !')
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          nomEntreprise: '',
          adresseEntreprise: '',
          siegeSocial: '',
          numeroRegistre: '',
          numeroAgrement: '',
          domaineActivite: '',
          anneeExperience: '',
          nombreEmployes: '',
          siteWeb: '',
          description: ''
        })
        
        // Rediriger vers la liste des assureurs après 2 secondes
        setTimeout(() => {
          router.push('/assureurs')
        }, 2000)
      } else {
        setError(result.message || 'Une erreur est survenue lors de la création de l\'assureur')
      }
    } catch (error) {
      console.error('Error creating insurer:', error)
      setError('Une erreur est survenue lors de la création de l\'assureur')
    } finally {
      setLoading(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un nouvel assureur</h1>
          <p className="text-gray-600">Ajoutez une nouvelle compagnie d'assurance à la plateforme NOLI</p>
        </div>

        {/* Alert messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="h-6 w-6 text-blue-600 mr-2" />
                <CardTitle className="text-2xl font-bold text-gray-900">Informations de l'assureur</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                Remplissez toutes les informations requises pour créer le compte assureur
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section: Contact principal */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center mb-4">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Contact principal</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="font-medium text-gray-700">Nom *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => updateFormData('nom', e.target.value)}
                        placeholder="Nom du contact principal"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom" className="font-medium text-gray-700">Prénom *</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => updateFormData('prenom', e.target.value)}
                        placeholder="Prénom du contact principal"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="email@entreprise.com"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="font-medium text-gray-700">Téléphone *</Label>
                      <Input
                        id="telephone"
                        value={formData.telephone}
                        onChange={(e) => updateFormData('telephone', e.target.value)}
                        placeholder="+225 07 00 00 00 00"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Section: Entreprise */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center mb-4">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Informations entreprise</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomEntreprise" className="font-medium text-gray-700">Nom de l'entreprise *</Label>
                      <Input
                        id="nomEntreprise"
                        value={formData.nomEntreprise}
                        onChange={(e) => updateFormData('nomEntreprise', e.target.value)}
                        placeholder="Nom de la compagnie d'assurance"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siegeSocial" className="font-medium text-gray-700">Siège social *</Label>
                      <Input
                        id="siegeSocial"
                        value={formData.siegeSocial}
                        onChange={(e) => updateFormData('siegeSocial', e.target.value)}
                        placeholder="Ville, Pays"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adresseEntreprise" className="font-medium text-gray-700">Adresse complète *</Label>
                    <Input
                      id="adresseEntreprise"
                      value={formData.adresseEntreprise}
                      onChange={(e) => updateFormData('adresseEntreprise', e.target.value)}
                      placeholder="Adresse complète de l'entreprise"
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroRegistre" className="font-medium text-gray-700">Numéro de registre *</Label>
                      <Input
                        id="numeroRegistre"
                        value={formData.numeroRegistre}
                        onChange={(e) => updateFormData('numeroRegistre', e.target.value)}
                        placeholder="RCCM ou équivalent"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numeroAgrement" className="font-medium text-gray-700">Numéro d'agrément *</Label>
                      <Input
                        id="numeroAgrement"
                        value={formData.numeroAgrement}
                        onChange={(e) => updateFormData('numeroAgrement', e.target.value)}
                        placeholder="Numéro d'agrément ministériel"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Section: Activité */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center mb-4">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Activité et expérience</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="domaineActivite" className="font-medium text-gray-700">Domaine d'activité *</Label>
                      <Select value={formData.domaineActivite} onValueChange={(value) => updateFormData('domaineActivite', value)}>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Assurance Automobile</SelectItem>
                          <SelectItem value="multirisque">Multirisque</SelectItem>
                          <SelectItem value="sante">Assurance Santé</SelectItem>
                          <SelectItem value="vie">Assurance Vie</SelectItem>
                          <SelectItem value="transport">Assurance Transport</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anneeExperience" className="font-medium text-gray-700">Années d'expérience *</Label>
                      <Select value={formData.anneeExperience} onValueChange={(value) => updateFormData('anneeExperience', value)}>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-2">0-2 ans</SelectItem>
                          <SelectItem value="3-5">3-5 ans</SelectItem>
                          <SelectItem value="6-10">6-10 ans</SelectItem>
                          <SelectItem value="11-20">11-20 ans</SelectItem>
                          <SelectItem value="20+">20+ ans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombreEmployes" className="font-medium text-gray-700">Nombre d'employés *</Label>
                      <Select value={formData.nombreEmployes} onValueChange={(value) => updateFormData('nombreEmployes', value)}>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employés</SelectItem>
                          <SelectItem value="11-50">11-50 employés</SelectItem>
                          <SelectItem value="51-200">51-200 employés</SelectItem>
                          <SelectItem value="201-500">201-500 employés</SelectItem>
                          <SelectItem value="500+">500+ employés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteWeb" className="font-medium text-gray-700">Site web</Label>
                      <Input
                        id="siteWeb"
                        type="url"
                        value={formData.siteWeb}
                        onChange={(e) => updateFormData('siteWeb', e.target.value)}
                        placeholder="https://www.entreprise.com"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-medium text-gray-700">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Brève description de l'entreprise"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Submit button */}
                <motion.div variants={itemVariants} className="pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Création en cours...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <UserCheck className="h-5 w-5 mr-2" />
                        Créer l'assureur
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}