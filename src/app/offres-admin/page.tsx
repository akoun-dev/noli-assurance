'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Car, 
  Search, 
  Filter, 
  Building2, 
  Users, 
  Calendar,
  TrendingUp,
  Star,
  Edit,
  Eye,
  MoreHorizontal,
  ToggleRight,
  ToggleLeft
} from 'lucide-react'

export default function OffresAdminPage() {
  const offers = [
    {
      id: 1,
      name: 'Assurance Tiers Complet',
      insurer: 'NSIA Assurances',
      price: '85,000 FCFA',
      coverage: 'Responsabilité civile + Vol + Incendie',
      status: 'active',
      subscribers: 45,
      createdAt: '2024-01-01',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Assurance Tous Risques',
      insurer: 'SUNU Assurances',
      price: '150,000 FCFA',
      coverage: 'Tous risques inclus',
      status: 'active',
      subscribers: 23,
      createdAt: '2024-01-05',
      rating: 4.3
    },
    {
      id: 3,
      name: 'Assurance Économique',
      insurer: 'AXA Côte d\'Ivoire',
      price: '45,000 FCFA',
      coverage: 'Responsabilité civile uniquement',
      status: 'inactive',
      subscribers: 12,
      createdAt: '2024-01-10',
      rating: 4.1
    },
    {
      id: 4,
      name: 'Assurance Premium',
      insurer: 'Allianz CI',
      price: '200,000 FCFA',
      coverage: 'Premium tous risques',
      status: 'active',
      subscribers: 8,
      createdAt: '2024-01-15',
      rating: 4.7
    }
  ]

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-500">
        <ToggleRight className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <ToggleLeft className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Offres</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de toutes les offres d'assurance
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total offres</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offres actives</CardTitle>
            <ToggleRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.filter(o => o.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total souscripteurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.reduce((sum, offer) => sum + offer.subscribers, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(offers.reduce((sum, offer) => sum + offer.rating, 0) / offers.length).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom ou assureur..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des offres */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-lg">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{offer.name}</CardTitle>
                    <CardDescription>
                      {offer.insurer} • Créée le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(offer.status)}
                  {getRatingStars(offer.rating)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Prix</Label>
                      <p className="text-lg font-semibold">{offer.price}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Couverture</Label>
                      <p className="text-sm">{offer.coverage}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Assureur</Label>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{offer.insurer}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Souscripteurs</Label>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-semibold">{offer.subscribers}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                      <div>{getStatusBadge(offer.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Note</Label>
                      <div>{getRatingStars(offer.rating)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Voir détails
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm">
                  Voir les statistiques
                </Button>
                <Button variant="outline" size="sm" className="ml-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}