'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  Server,
  Database,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react'

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  
  const logs = [
    {
      id: 1,
      timestamp: '2024-01-20T10:30:00',
      level: 'error',
      message: 'Échec de connexion à la base de données',
      source: 'DatabaseService',
      user: 'system',
      details: 'Connection timeout after 30 seconds'
    },
    {
      id: 2,
      timestamp: '2024-01-20T09:15:00',
      level: 'warning',
      message: 'Taux d\'utilisation CPU élevé',
      source: 'SystemMonitor',
      user: 'system',
      details: 'CPU usage at 85% for more than 5 minutes'
    },
    {
      id: 3,
      timestamp: '2024-01-20T08:45:00',
      level: 'info',
      message: 'Nouvel utilisateur inscrit',
      source: 'AuthService',
      user: 'marie.kone@email.com',
      details: 'User registration completed successfully'
    },
    {
      id: 4,
      timestamp: '2024-01-20T08:30:00',
      level: 'info',
      message: 'Devis généré avec succès',
      source: 'QuoteService',
      user: 'kouassi.yapo@email.com',
      details: 'Quote generated for Toyota Corolla 2019'
    },
    {
      id: 5,
      timestamp: '2024-01-20T07:15:00',
      level: 'error',
      message: 'Échec de l\'envoi d\'email',
      source: 'EmailService',
      user: 'system',
      details: 'SMTP server unreachable'
    },
    {
      id: 6,
      timestamp: '2024-01-19T18:20:00',
      level: 'info',
      message: 'Sauvegarde de la base de données terminée',
      source: 'BackupService',
      user: 'system',
      details: 'Database backup completed successfully'
    }
  ]

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Avertissement</Badge>
      case 'info':
        return <Badge variant="secondary">Info</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Server className="h-4 w-4 text-blue-500" />
      default:
        return <Server className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSourceIcon = (source: string) => {
    if (source.includes('Database')) return <Database className="h-4 w-4" />
    if (source.includes('Auth')) return <Shield className="h-4 w-4" />
    if (source.includes('System')) return <Server className="h-4 w-4" />
    return <Server className="h-4 w-4" />
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs Système</h1>
          <p className="text-muted-foreground">
            Surveillez les activités et les erreurs du système
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total logs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {logs.filter(l => l.level === 'error').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avertissements</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {logs.filter(l => l.level === 'warning').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24 dernières heures</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => {
                const logDate = new Date(l.timestamp)
                const now = new Date()
                const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60)
                return diffHours <= 24
              }).length}
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
                placeholder="Rechercher dans les logs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={levelFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLevelFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={levelFilter === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLevelFilter('error')}
              >
                Erreurs
              </Button>
              <Button
                variant={levelFilter === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLevelFilter('warning')}
              >
                Avertissements
              </Button>
              <Button
                variant={levelFilter === 'info' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLevelFilter('info')}
              >
                Info
              </Button>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getLevelIcon(log.level)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{log.message}</h3>
                      {getLevelBadge(log.level)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        {getSourceIcon(log.source)}
                        {log.source}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleDateString('fr-FR')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {log.details}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Voir détails
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}