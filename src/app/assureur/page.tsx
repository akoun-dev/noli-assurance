'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, FileText, TrendingUp, Users, Plus, Edit, Trash2, Eye, DollarSign, Target } from "lucide-react"
import { useSession } from "next-auth/react"

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
  const [offers, setOffers] = useState<InsuranceOffer[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalOffers: 0,
    activeOffers: 0,
    totalQuotes: 0,
    convertedQuotes: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (session?.user?.role !== 'INSURER') {
      window.location.href = '/'
      return
    }
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      const [offersRes, quotesRes] = await Promise.all([
        fetch('/api/insurer/offers'),
        fetch('/api/insurer/quotes')
      ])

      const offersData = await offersRes.json()
      const quotesData = await quotesRes.json()

      if (offersData.success) setOffers(offersData.offers)
      if (quotesData.success) setQuotes(quotesData.quotes)

      // Calculate stats
      const activeOffers = offersData.offers?.filter((o: InsuranceOffer) => o.isActive)?.length || 0
      const convertedQuotes = quotesData.quotes?.filter((q: Quote) => q.status === 'converted')?.length || 0
      const totalRevenue = quotesData.quotes
        ?.filter((q: Quote) => q.status === 'converted')
        ?.reduce((sum: number, q: Quote) => {
          const selectedOffer = q.quoteOffers?.find(qo => qo.offer)
          return sum + (selectedOffer?.priceAtQuote || 0)
        }, 0) || 0

      setStats({
        totalOffers: offersData.offers?.length || 0,
        activeOffers,
        totalQuotes: quotesData.quotes?.length || 0,
        convertedQuotes,
        totalRevenue
      })
    } catch (error) {
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
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2">
              <TabsTrigger value="offers">Mes offres</TabsTrigger>
              <TabsTrigger value="quotes">Devis reçus</TabsTrigger>
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
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}