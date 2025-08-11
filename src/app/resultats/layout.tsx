'use client'

import { useSession } from 'next-auth/react'
import { Sidebar } from '@/components/layout/Sidebar'

export default function ResultatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()

  // Si l'utilisateur est connecté, afficher avec la sidebar
  if (session) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto md:ml-0">
          <div className="container mx-auto p-4 sm:p-6 pt-16 md:pt-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, afficher sans sidebar
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  )
}