'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Plus,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Quote {
  id: string
  vehicle: string
  date: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  price: string
  insurer: string
  expires: string
  coverage: string
}

interface UserStats {
  totalQuotes: number
  pendingQuotes: number
  acceptedQuotes: number
  totalSavings: string
}

export default function MesDevisPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalQuotes: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
    totalSavings: '0 FCFA'
  })

  useEffect(() => {
    // Simuler le chargement des données
    // Dans une vraie application, cela viendrait d'une API
    const mockQuotes: Quote[] = [
      {
        id: '1',
        vehicle: 'Toyota Yaris 2020',
        date: '2024-01-15',
        status: 'pending',
        price: '85,000 FCFA',
        insurer: 'NSIA',
        expires: '2024-02-15',
        coverage: 'Tous risques'
      },
      {
        id: '2',
        vehicle: 'Peugeot 308 2019',
        date: '2024-01-10',
        status: 'accepted',
        price: '92,000 FCFA',
        insurer: 'SUNU',
        expires: '2024-02-10',
        coverage: 'Tiers complet'
      },
      {
        id: '3',
        vehicle: 'Renault Clio 2021',
        date: '2024-01-05',
        status: 'rejected',
        price: '78,000 FCFA',
        insurer: 'AXA',
        expires: '2024-02-05',
        coverage: 'Au tiers'
      }
    ]

    const mockStats: UserStats = {
      totalQuotes: 3,
      pendingQuotes: 1,
      acceptedQuotes: 1,
      totalSavings: '45,000 FCFA'
    }

    setQuotes(mockQuotes)
    setStats(mockStats)
  }, [])

  const getStatusBadge = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepté</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Refusé</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Expiré</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>Veuillez vous connecter pour accéder à vos devis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/connexion')} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Devis</h1>
              <p className="text-gray-600">Gérez vos demandes d'assurance automobile</p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/comparateur">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau devis
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total devis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuotes}</div>
              <p className="text-xs text-muted-foreground">Devis demandés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
              <p className="text-xs text-muted-foreground">En cours de traitement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptedQuotes}</div>
              <p className="text-xs text-muted-foreground">Devis acceptés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Économies</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSavings}</div>
              <p className="text-xs text-muted-foreground">Économies réalisées</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des devis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{quote.vehicle}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(quote.date).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prix:</span>
                    <span className="font-semibold text-lg">{quote.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Assureur:</span>
                    <span className="font-medium">{quote.insurer}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Couverture:</span>
                    <span className="text-sm">{quote.coverage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expiration:</span>
                    <span className="text-sm">{new Date(quote.expires).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    {quote.status === 'accepted' && (
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        Télécharger
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* État vide */}
        {quotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis trouvé</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore demandé de devis d'assurance</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/comparateur">
                <Plus className="w-4 h-4 mr-2" />
                Demander mon premier devis
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}