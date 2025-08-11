'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Car,
  Calendar,
  Download,
  Eye
} from 'lucide-react'

export default function StatistiquesPage() {
  const stats = {
    totalQuotes: 1247,
    acceptedQuotes: 283,
    conversionRate: 22.7,
    revenue: '12.4M',
    monthlyGrowth: 15.2,
    avgResponseTime: '2.3h'
  }

  const topOffers = [
    { name: 'Assurance Tiers Complet', quotes: 89, conversion: 24 },
    { name: 'Assurance Tous Risques', quotes: 67, conversion: 18 },
    { name: 'Assurance Économique', quotes: 45, conversion: 12 }
  ]

  const monthlyData = [
    { month: 'Jan', quotes: 89, accepted: 20 },
    { month: 'Fév', quotes: 102, accepted: 23 },
    { month: 'Mar', quotes: 118, accepted: 27 },
    { month: 'Avr', quotes: 134, accepted: 31 },
    { month: 'Mai', quotes: 156, accepted: 36 },
    { month: 'Juin', quotes: 178, accepted: 41 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">
            Analyse de vos performances et tendances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Eye className="h-4 w-4 mr-2" />
            Vue détaillée
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis reçus</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.monthlyGrowth}% depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis acceptés</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Taux de conversion: {stats.conversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue}</div>
            <p className="text-xs text-muted-foreground">FCFA ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">Temps moyen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Offres les plus populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Offres les plus populaires
            </CardTitle>
            <CardDescription>
              Vos offres les plus demandées ce mois-ci
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOffers.map((offer, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{offer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.quotes} devis reçus
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{offer.conversion}%</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>
              Tendance des devis et conversions sur 6 mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <span className="text-muted-foreground">
                      {data.accepted}/{data.quotes} devis
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(data.accepted / data.quotes) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((data.accepted / data.quotes) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profil des clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">18-25 ans</span>
              <Badge variant="outline">23%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">26-35 ans</span>
              <Badge variant="outline">45%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">36-45 ans</span>
              <Badge variant="outline">22%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">46+ ans</span>
              <Badge variant="outline">10%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Types de véhicules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Citadines</span>
              <Badge variant="outline">42%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Berlines</span>
              <Badge variant="outline">31%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">SUV</span>
              <Badge variant="outline">18%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Utilitaires</span>
              <Badge variant="outline">9%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Canal d'acquisition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Site web</span>
              <Badge variant="outline">58%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Mobile</span>
              <Badge variant="outline">32%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Partenaires</span>
              <Badge variant="outline">7%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Autres</span>
              <Badge variant="outline">3%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}