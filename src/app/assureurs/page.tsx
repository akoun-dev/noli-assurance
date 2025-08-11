'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Ban
} from 'lucide-react'
import Link from 'next/link'

interface Insurer {
  id: string
  nomEntreprise: string
  email: string
  telephone: string
  adresseEntreprise: string
  statut: string
  dateCreation: string
  siteWeb?: string
  description?: string
}

export default function AssureursPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [insurers, setInsurers] = useState<Insurer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsurers = async () => {
      try {
        const response = await fetch('/api/assureurs')
        const data = await response.json()
        setInsurers(data.insurers)
      } catch (error) {
        console.error('Error fetching insurers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsurers()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Actif
        </Badge>
      case 'INACTIF':
        return <Badge variant="destructive">
          <Ban className="w-3 h-3 mr-1" />
          Inactif
        </Badge>
      case 'SUSPENDU':
        return <Badge variant="secondary">
          Suspendu
        </Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating}</span>
      </div>
    )
  }

  const filteredInsurers = insurers.filter(insurer =>
    insurer.nomEntreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insurer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement des assureurs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assureurs</h1>
          <p className="text-muted-foreground">
            Gérez tous les assureurs partenaires
          </p>
        </div>
        <Link href="/creer-assureur">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un assureur
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total assureurs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insurers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assureurs actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insurers.filter(i => i.statut === 'ACTIF').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total assureurs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insurers.length}
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
                placeholder="Rechercher par nom ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des assureurs */}
      <div className="space-y-4">
        {filteredInsurers.map((insurer) => (
          <Card key={insurer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{insurer.nomEntreprise}</CardTitle>
                    <CardDescription>
                      {insurer.adresseEntreprise} • Membre depuis le {new Date(insurer.dateCreation).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(insurer.statut)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{insurer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{insurer.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{insurer.adresseEntreprise}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Site web</span>
                    <span className="text-sm font-medium">
                      {insurer.siteWeb ? (
                        <a href={insurer.siteWeb} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {insurer.siteWeb}
                        </a>
                      ) : 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Devis reçus</span>
                    <span className="text-sm font-medium">
                      {insurer.description || 'Non spécifié'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm">
                  Voir les offres
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