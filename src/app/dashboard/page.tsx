'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Car, 
  FileText, 
  Users, 
  TrendingUp, 
  Building2,
  Calculator,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DashboardStats {
  stats: {
    pendingQuotes?: number
    acceptedQuotes?: number
    savingsRate?: number
    totalInsurers?: number
    activeOffers?: number
    receivedQuotes?: number
    conversionRate?: number
    monthlyRevenue?: string
    totalUsers?: number
    activeInsurers?: number
    totalQuotesGenerated?: number
    lastMonthUsers?: number
    lastMonthQuotes?: number
  }
  recentQuotes?: Array<{
    id: string
    quoteReference: string
    status: string
    createdAt: string
    nom: string
    prenom: string
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const userRole = session?.user?.role || 'USER'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données du dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>
      case 'sent':
        return <Badge variant="outline">Envoyé</Badge>
      case 'contacted':
        return <Badge variant="default">Contacté</Badge>
      case 'converted':
        return <Badge variant="default" className="bg-green-600">Accepté</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  }

  const renderUserDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Bienvenue sur votre espace personnel NOLI Motor
          </p>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis en cours</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.pendingQuotes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.stats.acceptedQuotes ? `+${dashboardData.stats.acceptedQuotes} acceptés` : 'Aucun devis'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis acceptés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.acceptedQuotes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Assurance en cours
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économie réalisée</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : `${dashboardData?.stats.savingsRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Par rapport au marché
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assureurs disponibles</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.totalInsurers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Partenaires vérifiés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary">
              <Calculator className="h-5 w-5 text-muted-foreground" />
              Nouveau comparatif
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Comparez les offres d'assurance pour votre véhicule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full shadow-lg transition-colors" asChild>
              <a href="/comparateur">Commencer</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Mes devis
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Consultez et gérez vos devis existants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full transition-all duration-300" asChild>
              <a href="/devis">Voir mes devis</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary">
              <Car className="h-5 w-5 text-muted-foreground" />
              Mon véhicule
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Mettez à jour les informations de votre véhicule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full transition-all duration-300" asChild>
              <a href="/profil">Gérer mon profil</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Derniers devis */}
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-gray-800">Derniers devis</CardTitle>
          <CardDescription className="text-sm text-gray-600">Vos demandes de comparaison récentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Chargement des données...
              </div>
            ) : dashboardData?.recentQuotes && dashboardData.recentQuotes.length > 0 ? (
              dashboardData.recentQuotes.map((quote) => (
                <div key={quote.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{quote.nom} {quote.prenom}</p>
                      <p className="text-sm text-gray-600">{formatDate(quote.createdAt)}</p>
                    </div>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-gray-600">Aucun devis trouvé</p>
                <p className="text-sm text-gray-500">Commencez par créer votre premier devis</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInsurerDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tableau de bord Assureur</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gérez vos offres et suivez vos performances
          </p>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offres actives</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.activeOffers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibles pour les clients
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis reçus</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.receivedQuotes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de traitement
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : `${dashboardData?.stats.conversionRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Performance globale
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.monthlyRevenue || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              FCFA ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Car className="h-5 w-5" />
              Nouvelle offre
            </CardTitle>
            <CardDescription className="text-sm">
              Créez une nouvelle offre d'assurance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/offres">Créer une offre</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-5 w-5" />
              Devis reçus
            </CardTitle>
            <CardDescription className="text-sm">
              Consultez les nouvelles demandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href="/devis-recus">Voir les devis</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-5 w-5" />
              Statistiques
            </CardTitle>
            <CardDescription className="text-sm">
              Analysez vos performances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href="/statistiques">Voir les stats</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Derniers devis reçus */}
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-400 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-gray-800">Derniers devis reçus</CardTitle>
          <CardDescription className="text-sm text-gray-600">Nouvelles demandes de comparaison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                Chargement des données...
              </div>
            ) : dashboardData?.recentQuotes && dashboardData.recentQuotes.length > 0 ? (
              dashboardData.recentQuotes.map((quote) => (
                <div key={quote.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{quote.nom} {quote.prenom}</p>
                      <p className="text-sm text-gray-600">{formatDate(quote.createdAt)}</p>
                    </div>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-gray-600">Aucun devis reçu</p>
                <p className="text-sm text-gray-500">Les nouvelles demandes apparaîtront ici</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tableau de bord Administrateur</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Vue d'ensemble complète de la plateforme NOLI Motor
          </p>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.stats.lastMonthUsers ? `+${dashboardData.stats.lastMonthUsers} ce mois` : 'Nouveaux utilisateurs'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assureurs actifs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.activeInsurers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Partenaires vérifiés
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis générés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : dashboardData?.stats.totalQuotesGenerated || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.stats.lastMonthQuotes ? `+${dashboardData.stats.lastMonthQuotes} ce mois` : 'Total des devis'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : `${dashboardData?.stats.conversionRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Performance globale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary">
              <Users className="h-5 w-5 text-muted-foreground" />
              Utilisateurs
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Gérez les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full shadow-lg transition-colors" asChild>
              <a href="/utilisateurs">Gérer</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Assureurs
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Gérez les assureurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full transition-all duration-300" asChild>
              <a href="/assureurs">Gérer</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Statistiques
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Analyse complète
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full transition-all duration-300" asChild>
              <a href="/statistiques">Voir</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary bg-card group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              Alertes
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Notifications système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full transition-all duration-300" asChild>
              <a href="/logs">Voir</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Rendu conditionnel selon le rôle
  switch (userRole) {
    case 'INSURER':
      return renderInsurerDashboard()
    case 'ADMIN':
      return renderAdminDashboard()
    default:
      return renderUserDashboard()
  }
}