'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Building2, FileText, TrendingUp, Users, Plus, Edit, Trash2, Eye, DollarSign, Target, AlertCircle, RefreshCw, User, Mail, Phone, Calendar, Settings, Shield, MapPin } from "lucide-react"
import { useSession } from "next-auth/react"
import { useAssureurError, AssureurErrorDisplay } from "@/lib/assureur-error-handling.tsx"

interface InsuranceOffer {
  id: string
  name: string
  coverageLevel: string
  monthlyPrice: number
  annualPrice: number
  franchise: number
  isActive: boolean
  insurer: {
    name: string
  }
  createdAt: string
}

interface Quote {
  id: string
  quoteReference: string
  nom: string
  prenom: string
  email: string
  telephone: string
  status: string
  createdAt: string
  quoteOffers: {
    priceAtQuote: number
    offer: {
      name: string
      coverageLevel: string
    }
  }[]
}

interface Stats {
  totalOffers: number
  activeOffers: number
  totalQuotes: number
  convertedQuotes: number
  totalRevenue: number
}

export default function InsurerDashboard() {
  const { data: session } = useSession()
  const { getErrorMessage, handleError } = useAssureurError()
  const [offers, setOffers] = useState<InsuranceOffer[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalOffers: 0,
    activeOffers: 0,
    totalQuotes: 0,
    convertedQuotes: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (session?.user?.role !== 'ASSUREUR') {
      window.location.href = '/'
      return
    }
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      setError(null)
      const [offersRes, quotesRes] = await Promise.all([
        fetch('/api/insurer/offers'),
        fetch('/api/insurer/quotes')
      ])

      if (!offersRes.ok || !quotesRes.ok) {
        throw new Error('Erreur de communication avec le serveur')
      }

      const offersData = await offersRes.json()
      const quotesData = await quotesRes.json()

      if (!offersData.success) {
        throw new Error(offersData.error || 'Erreur lors de la récupération des offres')
      }
      if (!quotesData.success) {
        throw new Error(quotesData.error || 'Erreur lors de la récupération des devis')
      }

      setOffers(offersData.offers || [])
      setQuotes(quotesData.quotes || [])

      // Calculate stats
      const activeOffers = (offersData.offers || []).filter((o: InsuranceOffer) => o.isActive).length
      const convertedQuotes = (quotesData.quotes || []).filter((q: Quote) => q.status === 'converted').length
      const totalRevenue = (quotesData.quotes || [])
        .filter((q: Quote) => q.status === 'converted')
        .reduce((sum: number, q: Quote) => {
          const selectedOffer = q.quoteOffers?.find(qo => qo.offer)
          return sum + (selectedOffer?.priceAtQuote || 0)
        }, 0)

      setStats({
        totalOffers: (offersData.offers || []).length,
        activeOffers,
        totalQuotes: (quotesData.quotes || []).length,
        convertedQuotes,
        totalRevenue
      })
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-purple-100 text-purple-800'
      case 'converted': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCoverageBadgeColor = (level: string) => {
    switch (level) {
      case 'Tiers': return 'bg-green-100 text-green-800'
      case 'Tiers +': return 'bg-blue-100 text-blue-800'
      case 'Tous risques': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Assureur</h1>
              <p className="text-gray-600 mt-2">Gérez vos offres et suivez vos performances</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Building2 className="h-4 w-4 mr-1" />
                Assureur
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div className="mb-6" variants={itemVariants}>
            <AssureurErrorDisplay
              error={error}
              onRetry={fetchData}
            />
          </motion.div>
        )}

        {/* Stats Cards - Responsive */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8" variants={itemVariants}>
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Offres</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalOffers}</div>
              <p className="text-xs text-gray-600">Total offres</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Offres actives</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeOffers}</div>
              <p className="text-xs text-gray-600">Disponibles</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white overflow-x-auto">
            <div className="min-w-[600px] sm:min-w-0">
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Devis</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</div>
              <p className="text-xs text-gray-600">Reçus</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Convertis</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.convertedQuotes}</div>
              <p className="text-xs text-gray-600">Clients</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.totalRevenue)}
              </div>
              <p className="text-xs text-gray-600">Total estimé</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="offers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
              <TabsTrigger value="offers">Mes offres</TabsTrigger>
              <TabsTrigger value="quotes">Devis reçus</TabsTrigger>
              <TabsTrigger value="profile">Mon profil</TabsTrigger>
            </TabsList>

            <TabsContent value="offers">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des offres</CardTitle>
                      <CardDescription>Gérez vos offres d'assurance</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle offre
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Couverture</TableHead>
                        <TableHead>Prix mensuel</TableHead>
                        <TableHead>Prix annuel</TableHead>
                        <TableHead>Franchise</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">
                            {offer.name}
                          </TableCell>
                          <TableCell>
                            <Badge className={getCoverageBadgeColor(offer.coverageLevel)}>
                              {offer.coverageLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(offer.monthlyPrice)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(offer.annualPrice)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(offer.franchise)}
                          </TableCell>
                          <TableCell>
                            <Badge className={offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {offer.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quotes">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle>Devis reçus</CardTitle>
                  <CardDescription>Suivez les devis générés pour vos offres</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Offre sélectionnée</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.map((quote) => {
                        const selectedOffer = quote.quoteOffers?.[0]
                        return (
                          <TableRow key={quote.id}>
                            <TableCell className="font-medium">
                              {quote.quoteReference}
                            </TableCell>
                            <TableCell>
                              {quote.prenom} {quote.nom}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{quote.email}</div>
                                <div className="text-gray-500">{quote.telephone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {selectedOffer?.offer?.name || '-'}
                            </TableCell>
                            <TableCell>
                              {selectedOffer ? 
                                new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(selectedOffer.priceAtQuote) 
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(quote.status)}>
                                {quote.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle>Mon profil assureur</CardTitle>
                  <CardDescription>Gérez vos informations professionnelles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-blue-600" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Assureur
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Nom de l'entreprise</Label>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">Assurance NOLI</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Email professionnel</Label>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{session?.user?.email}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Téléphone</Label>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">+225 01 23 45 67 89</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Adresse</Label>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">Abidjan, Cocody</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Compte créé le</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <Button>
                            <Settings className="h-4 w-4 mr-2" />
                            Modifier le profil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Offres actives</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.activeOffers}</div>
                        <p className="text-xs text-gray-600">Total disponible</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Devis convertis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.convertedQuotes}</div>
                        <p className="text-xs text-gray-600">Ce mois-ci</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Taux de conversion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.totalQuotes > 0 ? Math.round((stats.convertedQuotes / stats.totalQuotes) * 100) : 0}%
                        </div>
                        <p className="text-xs text-gray-600">Performance</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}