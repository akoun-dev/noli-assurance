'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Building2,
  Users,
  BarChart3,
  Database,
  Globe,
  CheckCircle
} from 'lucide-react'

interface SettingsData {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
    quotes: boolean
    payments: boolean
    support: boolean
  }
  privacy: {
    profileVisible: boolean
    shareData: boolean
    analytics: boolean
    cookies: boolean
  }
  preferences: {
    language: string
    timezone: string
    currency: string
    dateFormat: string
  }
  adminSettings?: {
    systemNotifications: boolean
    userMonitoring: boolean
    dataRetention: string
    apiAccess: boolean
  }
  insurerSettings?: {
    quoteNotifications: boolean
    autoResponse: boolean
    leadManagement: boolean
    reporting: boolean
  }
}

export default function ParametresPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      quotes: true,
      payments: true,
      support: true
    },
    privacy: {
      profileVisible: true,
      shareData: false,
      analytics: true,
      cookies: true
    },
    preferences: {
      language: 'fr-FR',
      timezone: 'Africa/Abidjan',
      currency: 'XOF',
      dateFormat: 'DD/MM/YYYY'
    }
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (session?.user) {
      // Load role-specific settings
      const userRole = session.user.role
      let roleSpecificSettings: SettingsData = { ...settings }

      if (userRole === 'ADMIN') {
        roleSpecificSettings.adminSettings = {
          systemNotifications: true,
          userMonitoring: true,
          dataRetention: '90',
          apiAccess: false
        }
      } else if (userRole === 'INSURER') {
        roleSpecificSettings.insurerSettings = {
          quoteNotifications: true,
          autoResponse: false,
          leadManagement: true,
          reporting: true
        }
      }

      setSettings(roleSpecificSettings)
    }
  }, [session])

  const handleNotificationChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [setting]: value }
    }))
  }

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [setting]: value }
    }))
  }

  const handlePreferenceChange = (setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [setting]: value }
    }))
  }

  const handleAdminSettingChange = (setting: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      adminSettings: { ...prev.adminSettings!, [setting]: value }
    }))
  }

  const handleInsurerSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      insurerSettings: { ...prev.insurerSettings!, [setting]: value }
    }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setSaveStatus(null)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Paramètres sauvegardés avec succès' })
      } else {
        setSaveStatus({ type: 'error', message: 'Erreur lors de la sauvegarde des paramètres' })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setSaveStatus({ type: 'error', message: 'Erreur serveur lors de la sauvegarde' })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas' })
      return
    }

    setLoading(true)
    setSaveStatus(null)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      })

      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Mot de passe mis à jour avec succès' })
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setSaveStatus({ type: 'error', message: 'Erreur lors de la mise à jour du mot de passe' })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mot de passe:', error)
      setSaveStatus({ type: 'error', message: 'Erreur serveur lors de la mise à jour' })
    } finally {
      setLoading(false)
    }
  }

  const renderRoleSpecificSettings = () => {
    if (!session?.user) return null

    const userRole = session.user.role

    switch (userRole) {
      case 'ADMIN':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Paramètres administrateur
                </CardTitle>
                <CardDescription>
                  Configuration système et sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications système</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les alertes système et erreurs
                    </p>
                  </div>
                  <Switch
                    checked={settings.adminSettings?.systemNotifications}
                    onCheckedChange={(checked) => handleAdminSettingChange('systemNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Monitoring utilisateurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Surveiller l'activité des utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={settings.adminSettings?.userMonitoring}
                    onCheckedChange={(checked) => handleAdminSettingChange('userMonitoring', checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-base">Rétention des données</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings.adminSettings?.dataRetention}
                      onChange={(e) => handleAdminSettingChange('dataRetention', e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">jours</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Accès API</Label>
                    <p className="text-sm text-muted-foreground">
                      Autoriser l'accès à l'API externe
                    </p>
                  </div>
                  <Switch
                    checked={settings.adminSettings?.apiAccess}
                    onCheckedChange={(checked) => handleAdminSettingChange('apiAccess', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )

      case 'INSURER':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Paramètres assureur
                </CardTitle>
                <CardDescription>
                  Gestion des offres et communication client
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications de devis</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes pour nouveaux devis reçus
                    </p>
                  </div>
                  <Switch
                    checked={settings.insurerSettings?.quoteNotifications}
                    onCheckedChange={(checked) => handleInsurerSettingChange('quoteNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Réponse automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des réponses automatiques aux clients
                    </p>
                  </div>
                  <Switch
                    checked={settings.insurerSettings?.autoResponse}
                    onCheckedChange={(checked) => handleInsurerSettingChange('autoResponse', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Gestion des leads</Label>
                    <p className="text-sm text-muted-foreground">
                      Outils de suivi et conversion
                    </p>
                  </div>
                  <Switch
                    checked={settings.insurerSettings?.leadManagement}
                    onCheckedChange={(checked) => handleInsurerSettingChange('leadManagement', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Rapports</Label>
                    <p className="text-sm text-muted-foreground">
                      Rapports de performance automatisés
                    </p>
                  </div>
                  <Switch
                    checked={settings.insurerSettings?.reporting}
                    onCheckedChange={(checked) => handleInsurerSettingChange('reporting', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Préférences utilisateur
              </CardTitle>
              <CardDescription>
                Personnalisez votre expérience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <select
                    id="language"
                    value={settings.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="fr-FR">Français</option>
                    <option value="en-US">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <select
                    id="timezone"
                    value={settings.preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Africa/Abidjan">Abidjan (GMT)</option>
                    <option value="Africa/Dakar">Dakar (GMT)</option>
                    <option value="Africa/Lagos">Lagos (WAT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <select
                    id="currency"
                    value={settings.preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar (USD)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Format de date</Label>
                  <select
                    id="dateFormat"
                    value={settings.preferences.dateFormat}
                    onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      {saveStatus && (
        <Alert variant={saveStatus.type === 'success' ? 'default' : 'destructive'}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu latéral */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Confidentialité
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Lock className="h-4 w-4 mr-2" />
              Sécurité
            </Button>
            {session?.user?.role === 'ADMIN' && (
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Administration
              </Button>
            )}
            {session?.user?.role === 'INSURER' && (
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Assureur
              </Button>
            )}
            {session?.user?.role === 'USER' && (
              <Button variant="ghost" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Préférences
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez recevoir les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications par email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications par SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications sur votre appareil
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Devis</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les nouveaux devis
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.quotes}
                  onCheckedChange={(checked) => handleNotificationChange('quotes', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Paiements</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications de paiement et facturation
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.payments}
                  onCheckedChange={(checked) => handleNotificationChange('payments', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Support</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications du support client
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.support}
                  onCheckedChange={(checked) => handleNotificationChange('support', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les offres et promotions
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Confidentialité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Confidentialité
              </CardTitle>
              <CardDescription>
                Gérez vos paramètres de confidentialité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profil visible</Label>
                  <p className="text-sm text-muted-foreground">
                    Votre profil est visible par les assureurs
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.profileVisible}
                  onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Partage de données</Label>
                  <p className="text-sm text-muted-foreground">
                    Autoriser le partage de données pour améliorer le service
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.shareData}
                  onCheckedChange={(checked) => handlePrivacyChange('shareData', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Autoriser la collecte de données d'utilisation
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => handlePrivacyChange('analytics', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Accepter les cookies pour une meilleure expérience
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.cookies}
                  onCheckedChange={(checked) => handlePrivacyChange('cookies', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Paramètres spécifiques au rôle */}
          {renderRoleSpecificSettings()}

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Gérez votre mot de passe et la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>

              <Button onClick={handleSavePassword} disabled={loading} className="w-full">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Mettre à jour le mot de passe
              </Button>

              <Separator />

              <div className="space-y-2">
                <Label className="text-base">Authentification à deux facteurs</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                  <Badge variant="secondary">Non configuré</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Configurer 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bouton de sauvegarde général */}
          <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder tous les paramètres
          </Button>
        </div>
      </div>
    </div>
  )
}