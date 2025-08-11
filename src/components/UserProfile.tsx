'use client'

import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  LogOut, 
  Settings,
  ChevronDown,
  Building2,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface UserProfileProps {
  variant?: 'dropdown' | 'card' | 'minimal'
}

export function UserProfile({ variant = 'dropdown' }: UserProfileProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Chargement...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/connexion">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            Connexion
          </Button>
        </Link>
        <Link href="/inscription">
          <Button size="sm" className="text-xs sm:text-sm">
            Inscription
          </Button>
        </Link>
      </div>
    )
  }

  const user = session.user
  const userRole = user?.role || 'USER'

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'INSURER': return 'bg-blue-100 text-blue-800'
      case 'USER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4" />
      case 'INSURER': return <Building2 className="h-4 w-4" />
      case 'USER': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Profil Utilisateur</span>
          </CardTitle>
          <CardDescription>
            Informations de votre compte NOLI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-blue-600 text-white">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <Badge className={`${getRoleBadgeColor(userRole)} mt-1 inline-flex items-center`}>
                {getRoleIcon(userRole)}
                <span className="ml-1">{userRole}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm">{user.telephone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm">Membre depuis {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button variant="outline" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 text-red-600 hover:text-red-700"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt={user.name} />
          <AvatarFallback className="bg-blue-600 text-white text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-gray-600 truncate">{user.email}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => signOut()}
          className="text-red-600 hover:text-red-700 flex-shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 sm:w-64">
        <div className="px-2 py-1.5 text-sm text-gray-700">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <Badge className={`${getRoleBadgeColor(userRole)} mt-1 inline-flex items-center text-xs`}>
            {getRoleIcon(userRole)}
            <span className="ml-1">{userRole}</span>
          </Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Tableau de bord
          </Link>
        </DropdownMenuItem>
        
        {/* Menu items selon le rôle */}
        {userRole === 'USER' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/devis" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Mes devis
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/comparateur" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Comparateur
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profil" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Mon profil
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        {userRole === 'INSURER' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Tableau de bord
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/offres" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Mes offres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/devis-recus" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Devis reçus
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/statistiques" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Statistiques
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profil" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Mon profil
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        {userRole === 'ADMIN' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Tableau de bord
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/utilisateurs" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/assureurs" className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Assureurs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/devis-admin" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Devis
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/offres-admin" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Offres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/logs" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Logs système
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem asChild>
          <Link href="/parametres" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="text-red-600 focus:text-red-700 focus:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}