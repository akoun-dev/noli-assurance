'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone,
  Calendar,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

export default function UtilisateursPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const users = [
    {
      id: 1,
      name: 'Marie Koné',
      email: 'marie.kone@email.com',
      phone: '+225 07 01 02 03 04',
      role: 'USER',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20T10:30:00',
      quotesCount: 3,
      acceptedQuotes: 1
    },
    {
      id: 2,
      name: 'Kouassi Yapo',
      email: 'kouassi.yapo@email.com',
      phone: '+225 07 05 06 07 08',
      role: 'USER',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-19T14:15:00',
      quotesCount: 2,
      acceptedQuotes: 0
    },
    {
      id: 3,
      name: 'Awa Touré',
      email: 'awa.toure@email.com',
      phone: '+225 07 09 10 11 12',
      role: 'USER',
      status: 'inactive',
      joinDate: '2024-01-05',
      lastLogin: '2024-01-10T09:45:00',
      quotesCount: 1,
      acceptedQuotes: 1
    },
    {
      id: 4,
      name: 'Jean-Baptiste Kouadio',
      email: 'jb.kouadio@email.com',
      phone: '+225 07 13 14 15 16',
      role: 'USER',
      status: 'active',
      joinDate: '2024-01-01',
      lastLogin: '2024-01-18T16:20:00',
      quotesCount: 5,
      acceptedQuotes: 2
    }
  ]

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        Actif
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Ban className="w-3 h-3 mr-1" />
        Inactif
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive">Administrateur</Badge>
      case 'INSURER':
        return <Badge variant="default">Assureur</Badge>
      default:
        return <Badge variant="outline">Utilisateur</Badge>
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => new Date(u.joinDate).getMonth() === new Date().getMonth()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'activité</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
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

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Tous les utilisateurs enregistrés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Inscrit le {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(user.status)}
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.quotesCount} devis • {user.acceptedQuotes} acceptés
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
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