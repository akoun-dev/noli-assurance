'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Building2, FileText, TrendingUp, Shield, Settings, UserCheck, UserX, Plus, Edit, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  role: string
  createdAt: string
}

interface Insurer {
  id: string
  name: string
  description: string
  website: string
  contactEmail: string
  contactPhone: string
  isActive: boolean
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
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [insurers, setInsurers] = useState<Insurer[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInsurers: 0,
    totalQuotes: 0,
    activeQuotes: 0
  })

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      window.location.href = '/'
      return
    }
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      const [usersRes, insurersRes, quotesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/insurers'),
        fetch('/api/admin/quotes')
      ])

      const usersData = await usersRes.json()
      const insurersData = await insurersRes.json()
      const quotesData = await quotesRes.json()

      if (usersData.success) setUsers(usersData.users)
      if (insurersData.success) setInsurers(insurersData.insurers)
      if (quotesData.success) setQuotes(quotesData.quotes)

      // Calculate stats
      setStats({
        totalUsers: usersData.users?.length || 0,
        totalInsurers: insurersData.insurers?.length || 0,
        totalQuotes: quotesData.quotes?.length || 0,
        activeQuotes: quotesData.quotes?.filter((q: Quote) => q.status !== 'converted')?.length || 0
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'INSURER': return 'bg-blue-100 text-blue-800'
      case 'USER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
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
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
              <p className="text-gray-600 mt-2">Gérez l'ensemble de la plateforme NOLI</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">
                <Shield className="h-4 w-4 mr-1" />
                Administrateur
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total utilisateurs</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assureurs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInsurers}</div>
              <p className="text-xs text-muted-foreground">Partenaires actifs</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuotes}</div>
              <p className="text-xs text-muted-foreground">Total devis générés</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devis actifs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQuotes}</div>
              <p className="text-xs text-muted-foreground">En cours de traitement</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="insurers">Assureurs</TabsTrigger>
              <TabsTrigger value="quotes">Devis</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card">
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>Gérez tous les utilisateurs de la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.prenom} {user.nom}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.telephone}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
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

            <TabsContent value="insurers">
              <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des assureurs</CardTitle>
                      <CardDescription>Gérez les assureurs partenaires</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un assureur
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Site web</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insurers.map((insurer) => (
                        <TableRow key={insurer.id}>
                          <TableCell className="font-medium">
                            {insurer.name}
                          </TableCell>
                          <TableCell>{insurer.contactEmail}</TableCell>
                          <TableCell>{insurer.contactPhone}</TableCell>
                          <TableCell>
                            <a 
                              href={insurer.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {insurer.website}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge className={insurer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {insurer.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
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
              <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card">
                <CardHeader>
                  <CardTitle>Gestion des devis</CardTitle>
                  <CardDescription>Suivez tous les devis générés sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.map((quote) => (
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
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
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
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}