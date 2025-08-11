'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Search, 
  Filter, 
  Car, 
  User, 
  Calendar,
  Building2,
  TrendingUp,
  Eye,
  Download,
  MoreHorizontal
} from 'lucide-react'

export default function DevisAdminPage() {
  const quotes = [
    {
      id: 1,
      clientName: 'Marie Koné',
      clientEmail: 'marie.kone@email.com',
      vehicle: 'Peugeot 208 2021',
      insurer: 'NSIA Assurances',
      price: '85,000 FCFA',
      status: 'accepted',
      date: '2024-01-20T10:30:00',
      commission: '8,500 FCFA'
    },
    {
      id: 2,
      clientName: 'Kouassi Yapo',
      clientEmail: 'kouassi.yapo@email.com',
      vehicle: 'Toyota Corolla 2019',
      insurer: 'SUNU Assurances',
      price: '92,000 FCFA',
      status: 'pending',
      date: '2024-01-19T14:15:00',
      commission: '9,200 FCFA'
    },
    {
      id: 3,
      clientName: 'Awa Touré',
      clientEmail: 'awa.toure@email.com',
      vehicle: 'Renault Clio 2020',
      insurer: 'AXA Côte d\'Ivoire',
      price: '78,000 FCFA',
      status: 'expired',
      date: '2024-01-18T09:45:00',
      commission: '7,800 FCFA'
    },
    {
      id: 4,
      clientName: 'Jean-Baptiste Kouadio',
      clientEmail: 'jb.kouadio@email.com',
      vehicle: 'Citroën C3 2018',
      insurer: 'Allianz CI',
      price: '95,000 FCFA',
      status: 'accepted',
      date: '2024-01-17T16:20:00',
      commission: '9,500 FCFA'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepté</Badge>
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>
      case 'expired':
        return <Badge variant="outline">Expiré</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Devis</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de tous les devis sur la plateforme
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total devis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis acceptés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.filter(q => q.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8M</div>
            <p className="text-xs text-muted-foreground">FCFA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">280K</div>
            <p className="text-xs text-muted-foreground">FCFA</p>
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
                placeholder="Rechercher par client, véhicule ou assureur..."
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

      {/* Liste des devis */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
          <CardDescription>
            Tous les devis générés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{quote.clientName}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {quote.vehicle}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {quote.insurer}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(quote.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{quote.price}</div>
                    <div className="text-sm text-muted-foreground">
                      Commission: {quote.commission}
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {quote.status === 'accepted' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}