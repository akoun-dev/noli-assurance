'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  Edit,
  Save,
  X,
  Building2,
  Shield,
  Settings,
  CheckCircle
} from 'lucide-react'

interface UserProfile {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  dateNaissance?: string
  datePermis?: string
  role: string
}

export default function ProfilPage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    datePermis: '',
    role: 'USER'
  })
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (session?.user) {
      const profileData: UserProfile = {
        id: session.user.id || '',
        nom: session.user.nom || '',
        prenom: session.user.prenom || '',
        email: session.user.email || '',
        telephone: session.user.telephone || '',
        dateNaissance: session.user.dateNaissance ? new Date(session.user.dateNaissance).toISOString().split('T')[0] : '',
        datePermis: session.user.datePermis ? new Date(session.user.datePermis).toISOString().split('T')[0] : '',
        role: session.user.role || 'USER'
      }
      setUserProfile(profileData)
      setFormData(profileData)
    }
  }, [session])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setSaveStatus(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUserProfile(updatedUser)
        setFormData(updatedUser)
        setSaveStatus({ type: 'success', message: 'Profil mis à jour avec succès' })
        setIsEditing(false)
        
        // Refresh the session to update the user data
        await fetch('/api/auth/session', { method: 'GET' })
      } else {
        setSaveStatus({ type: 'error', message: 'Erreur lors de la mise à jour du profil' })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setSaveStatus({ type: 'error', message: 'Erreur serveur lors de la mise à jour' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (userProfile) {
      setFormData(userProfile)
    }
    setSaveStatus(null)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive" className="bg-red-600">Administrateur</Badge>
      case 'INSURER':
        return <Badge variant="default" className="bg-blue-600">Assureur</Badge>
      default:
        return <Badge variant="secondary">Utilisateur</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Settings className="h-5 w-5" />
      case 'INSURER':
        return <Building2 className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const renderUserSpecificContent = () => {
    if (!userProfile) return null

    switch (userProfile.role) {
      case 'ADMIN':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informations administrateur
              </CardTitle>
              <CardDescription>
                Privilèges et responsabilités d'administrateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Niveau d'accès</Label>
                  <p className="text-lg font-semibold">Accès complet</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Permissions</Label>
                  <p className="text-lg font-semibold">Toutes les permissions</p>
                </div>
              </div>
              <div className="pt-2">
                <Badge variant="outline" className="border-green-200 text-green-700">
                  Compte vérifié ✓
                </Badge>
              </div>
            </CardContent>
          </Card>
        )

      case 'INSURER':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations assureur
              </CardTitle>
              <CardDescription>
                Détails de votre compte assureur partenaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Statut du compte</Label>
                  <p className="text-lg font-semibold">Actif</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type de compte</Label>
                  <p className="text-lg font-semibold">Partenaire premium</p>
                </div>
              </div>
              <div className="pt-2">
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  Assureur vérifié ✓
                </Badge>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Mon véhicule
              </CardTitle>
              <CardDescription>
                Informations sur votre véhicule assuré
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Marque</Label>
                    <p className="text-lg font-semibold">Toyota</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Modèle</Label>
                    <p className="text-lg font-semibold">Yaris</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Année</Label>
                    <p className="text-lg font-semibold">2020</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Immatriculation</Label>
                    <p className="text-lg font-semibold">CI-1234-AB</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Numéro VIN</Label>
                    <p className="text-lg font-semibold">VIN123456789012345</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                    <Badge variant="default">Véhicule vérifié</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      {saveStatus && (
        <Alert variant={saveStatus.type === 'success' ? 'default' : 'destructive'}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userProfile ? getRoleIcon(userProfile.role) : <User className="h-5 w-5" />}
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos coordonnées et informations de contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                {isEditing ? (
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{userProfile?.prenom}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                {isEditing ? (
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{userProfile?.nom}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{userProfile?.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              {isEditing ? (
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{userProfile?.telephone}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance</Label>
              {isEditing ? (
                <Input
                  id="dateNaissance"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                />
              ) : (
                <p className="text-sm font-medium">
                  {userProfile?.dateNaissance ? new Date(userProfile.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <div className="flex items-center gap-2">
                {userProfile ? getRoleBadge(userProfile.role) : <Badge variant="secondary">Utilisateur</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations du permis (pour les utilisateurs) */}
        {(userProfile?.role === 'USER' || !userProfile) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Permis de conduire
              </CardTitle>
              <CardDescription>
                Informations sur votre permis de conduire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="datePermis">Date d'obtention</Label>
                {isEditing ? (
                  <Input
                    id="datePermis"
                    type="date"
                    value={formData.datePermis}
                    onChange={(e) => handleInputChange('datePermis', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {userProfile?.datePermis ? new Date(userProfile.datePermis).toLocaleDateString('fr-FR') : 'Non renseignée'}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Badge variant="secondary">
                  Permis vérifié ✓
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contenu spécifique au rôle */}
      {renderUserSpecificContent()}
    </div>
  )
}