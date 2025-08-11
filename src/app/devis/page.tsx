'use client'

import { useSession } from 'next-auth/react'
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
  Download
} from 'lucide-react'

export default function DevisPage() {
  const { data: session } = useSession()

  const devis = [
    {
      id: 1,
      vehicle: 'Toyota Yaris 2020',
      date: '2024-01-15',
      status: 'pending',
      price: '85,000 FCFA',
      insurer: 'NSIA',
      expires: '2024-02-15'
    },
    {
      id: 2,
      vehicle: 'Renault Clio 2019',
      date: '2024-01-10',
      status: 'accepted',
      price: '92,000 FCFA',
      insurer: 'SUNU',
      expires: '2024-02-10'
    },
    {
      id: 3,
      vehicle: 'Peugeot 208 2021',
      date: '2024-01-08',
      status: 'expired',
      price: '78,000 FCFA',
      insurer: 'AXA',
      expires: '2024-02-08'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>
      case 'accepted':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Accepté</Badge>
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expiré</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Devis</h1>
        <p className="text-muted-foreground">
          Gérez tous vos devis d'assurance auto
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des devis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devis.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devis.filter(d => d.status === 'pending' || d.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économie totale</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des devis */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
          <CardDescription>Tous vos devis d'assurance auto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devis.map((devis) => (
              <div key={devis.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Car className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{devis.vehicle}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(devis.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span>•</span>
                      <span>{devis.insurer}</span>
                      <span>•</span>
                      <span>Expire le {new Date(devis.expires).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{devis.price}</div>
                    {getStatusBadge(devis.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {devis.status === 'accepted' && (
                      <Button variant="default" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    )}
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