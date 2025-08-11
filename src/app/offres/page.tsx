'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft,
  ToggleRight,
  Star,
  Clock
} from 'lucide-react'

export default function OffresPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const offres = [
    {
      id: 1,
      name: 'Assurance Tiers Complet',
      price: '85,000 FCFA',
      coverage: 'Responsabilité civile + Vol + Incendie',
      status: 'active',
      createdAt: '2024-01-01',
      subscribers: 45
    },
    {
      id: 2,
      name: 'Assurance Tous Risques',
      price: '150,000 FCFA',
      coverage: 'Tous risques inclus',
      status: 'active',
      createdAt: '2024-01-05',
      subscribers: 23
    },
    {
      id: 3,
      name: 'Assurance Économique',
      price: '45,000 FCFA',
      coverage: 'Responsabilité civile uniquement',
      status: 'inactive',
      createdAt: '2024-01-10',
      subscribers: 12
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Offres</h1>
          <p className="text-muted-foreground">
            Gérez vos offres d'assurance auto
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle offre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des offres</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offres.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offres actives</CardTitle>
            <ToggleRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offres.filter(o => o.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total souscripteurs</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offres.reduce((sum, offre) => sum + offre.subscribers, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu mensuel</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2M</div>
            <p className="text-xs text-muted-foreground">FCFA</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une nouvelle offre</CardTitle>
            <CardDescription>
              Définissez les détails de votre nouvelle offre d'assurance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offerName">Nom de l'offre</Label>
                <Input id="offerName" placeholder="Ex: Assurance Tiers Complet" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input id="price" type="number" placeholder="85000" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverage">Couverture</Label>
              <Textarea 
                id="coverage" 
                placeholder="Décrivez les garanties incluses dans cette offre..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (mois)</Label>
                <Input id="duration" type="number" defaultValue="12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deductible">Franchise (FCFA)</Label>
                <Input id="deductible" type="number" placeholder="50000" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button>Créer l'offre</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des offres */}
      <div className="space-y-4">
        {offres.map((offre) => (
          <Card key={offre.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    {offre.name}
                  </CardTitle>
                  <CardDescription>
                    Créée le {new Date(offre.createdAt).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(offre.status)}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Prix</Label>
                  <p className="text-lg font-semibold">{offre.price}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Couverture</Label>
                  <p className="text-sm">{offre.coverage}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Souscripteurs</Label>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-semibold">{offre.subscribers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}