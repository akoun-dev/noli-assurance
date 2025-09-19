'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download
} from 'lucide-react'

export default function DevisRecusPage() {
  const router = useRouter()
  const { data: session } = useSession()

  // Rediriger les utilisateurs ASSUREUR vers l'interface centralisée
  useEffect(() => {
    if (session?.user?.role === 'ASSUREUR') {
      router.replace('/assureur?tab=quotes')
    }
  }, [session, router])

  // Afficher un état de chargement pendant la redirection
  if (session?.user?.role === 'ASSUREUR') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  const devis = [
    {
      id: 1,
      clientName: 'Marie Koné',
      clientEmail: 'marie.kone@email.com',
      clientPhone: '+225 07 01 02 03 04',
      vehicle: 'Peugeot 208 2021',
      date: '2024-01-20T10:30:00',
      status: 'new',
      priceRange: '80,000 - 100,000 FCFA',
      urgency: 'high'
    },
    {
      id: 2,
      clientName: 'Kouassi Yapo',
      clientEmail: 'kouassi.yapo@email.com',
      clientPhone: '+225 07 05 06 07 08',
      vehicle: 'Toyota Corolla 2019',
      date: '2024-01-19T14:15:00',
      status: 'contacted',
      priceRange: '70,000 - 90,000 FCFA',
      urgency: 'medium'
    },
    {
      id: 3,
      clientName: 'Awa Touré',
      clientEmail: 'awa.toure@email.com',
      clientPhone: '+225 07 09 10 11 12',
      vehicle: 'Renault Clio 2020',
      date: '2024-01-18T09:45:00',
      status: 'quoted',
      priceRange: '60,000 - 80,000 FCFA',
      urgency: 'low'
    },
    {
      id: 4,
      clientName: 'Jean-Baptiste Kouadio',
      clientEmail: 'jb.kouadio@email.com',
      clientPhone: '+225 07 13 14 15 16',
      vehicle: 'Citroën C3 2018',
      date: '2024-01-17T16:20:00',
      status: 'accepted',
      priceRange: '90,000 - 120,000 FCFA',
      urgency: 'high'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">Nouveau</Badge>
      case 'contacted':
        return <Badge variant="secondary">Contacté</Badge>
      case 'quoted':
        return <Badge variant="outline">Devis envoyé</Badge>
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepté</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="destructive">Urgent</Badge>
      case 'medium':
        return <Badge variant="outline">Moyen</Badge>
      case 'low':
        return <Badge variant="secondary">Faible</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'contacted':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'quoted':
        return <FileText className="h-4 w-4 text-muted-foreground" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Devis Reçus</h1>
        <p className="text-muted-foreground">
          Gérez les demandes de devis des clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux devis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devis.filter(d => d.status === 'new').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devis.filter(d => d.status === 'contacted' || d.status === 'quoted').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devis.filter(d => d.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
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
                placeholder="Rechercher par client, véhicule ou email..."
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
      <div className="space-y-4">
        {devis.map((devis) => (
          <Card key={devis.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(devis.status)}
                  <div>
                    <CardTitle className="text-lg">{devis.clientName}</CardTitle>
                    <CardDescription>
                      {devis.vehicle} • {new Date(devis.date).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(devis.status)}
                  {getUrgencyBadge(devis.urgency)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{devis.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{devis.clientEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{devis.clientPhone}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{devis.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Budget: {devis.priceRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Reçu le {new Date(devis.date).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(devis.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Voir détails
                </Button>
                {devis.status === 'new' && (
                  <Button size="sm">
                    Contacter
                  </Button>
                )}
                {devis.status === 'contacted' && (
                  <Button size="sm">
                    Envoyer devis
                  </Button>
                )}
                {devis.status === 'accepted' && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger contrat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}