'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Home, 
  FileText, 
  User, 
  Settings, 
  BarChart3, 
  Users, 
  Shield, 
  Menu,
  X,
  Car,
  Calculator,
  TrendingUp,
  Building2,
  FileBarChart,
  UserCheck,
  AlertCircle,
  LogOut
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const userRole = session?.user?.role || 'USER'

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  const menuItems = {
    USER: [
      {
        title: 'Tableau de bord',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: 'Comparateur',
        href: '/comparateur',
        icon: Calculator,
      },
      {
        title: 'Mes Devis',
        href: '/devis',
        icon: FileText,
      },
      {
        title: 'Mon Profil',
        href: '/profil',
        icon: User,
      },
    ],
    INSURER: [
      {
        title: 'Tableau de bord',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: 'Mes Offres',
        href: '/offres',
        icon: Car,
      },
      {
        title: 'Statistiques',
        href: '/statistiques',
        icon: BarChart3,
      },
      {
        title: 'Devis Reçus',
        href: '/devis-recus',
        icon: FileBarChart,
      },
      {
        title: 'Mon Profil',
        href: '/profil',
        icon: User,
      },
    ],
    ADMIN: [
      {
        title: 'Tableau de bord',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: 'Utilisateurs',
        href: '/utilisateurs',
        icon: Users,
      },
      {
        title: 'Assureurs',
        href: '/assureurs',
        icon: Building2,
      },
      {
        title: 'Statistiques',
        href: '/statistiques',
        icon: TrendingUp,
      },
      {
        title: 'Devis',
        href: '/devis-admin',
        icon: FileText,
      },
      {
        title: 'Offres',
        href: '/offres-admin',
        icon: Car,
      },
      {
        title: 'Logs Système',
        href: '/logs',
        icon: AlertCircle,
      },
      {
        title: 'Paramètres',
        href: '/parametres',
        icon: Settings,
      },
    ],
  }

  const currentMenuItems = menuItems[userRole as keyof typeof menuItems] || menuItems.USER

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-800 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">NOLI Assurance</h1>
            <p className="text-xs text-gray-300 capitalize">{userRole}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white hover:bg-slate-700"
          onClick={toggleSidebar}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {currentMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-gray-100',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-muted-foreground hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-600"
                )} />
                <span className="truncate font-medium">{item.title}</span>
              </Link>
            )
          })}
        </div>

        {/* Section déconnexion */}
        <div className="mt-auto pt-4 border-t">
          <Link
            href="/api/auth/signout"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span className="font-medium">Déconnexion</span>
          </Link>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-800 text-white hover:bg-slate-700 shadow-lg"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar for desktop */}
      <div className={cn('hidden md:flex md:w-64 lg:w-72 flex-col border-r border-gray-200 bg-white shadow-lg', className)}>
        <SidebarContent />
      </div>

      {/* Sidebar for mobile (overlay) */}
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
          />
          {/* Mobile sidebar */}
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[80vw] bg-white border-r border-gray-200 shadow-2xl">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}