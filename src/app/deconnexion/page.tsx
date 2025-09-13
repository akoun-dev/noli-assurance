'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Shield, Check, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function DeconnexionPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers l'accueil
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    // Si l'utilisateur est connecté, procéder à la déconnexion
    if (status === 'authenticated') {
      performLogout()
    }
  }, [status, router])

  const performLogout = async () => {
    try {
      setLoading(true)
      
      // Appeler l'API de déconnexion pour nettoyer la session côté serveur
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Déconnexion NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: '/'
      })

      setSuccess(true)
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      setError('Une erreur est survenue lors de la déconnexion')
      
      // Même en cas d'erreur, tenter de déconnecter localement
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleManualLogout = async () => {
    await performLogout()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo et titre */}
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-600">
            NOLI
          </h1>
          <p className="text-gray-600 mt-2">Déconnexion</p>
        </motion.div>

        {/* Carte de déconnexion */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                <LogOut className="h-6 w-6 mr-2" />
                Déconnexion
              </CardTitle>
              <CardDescription className="text-gray-600">
                Vous êtes sur le point de vous déconnecter de votre compte NOLI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Déconnexion réussie ! Vous allez être redirigé vers la page d'accueil...
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {loading && (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                  <p className="text-gray-600">Déconnexion en cours...</p>
                </div>
              )}

              {!loading && !success && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Informations de session :</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Email :</span> {session?.user?.email}</p>
                      <p><span className="font-medium">Nom :</span> {session?.user?.name}</p>
                      <p><span className="font-medium">Rôle :</span> {session?.user?.role}</p>
                      {session?.user?.twoFactorEnabled && (
                        <p><span className="font-medium">2FA :</span> Activé</p>
                      )}
                    </div>
                  </div>

                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={handleManualLogout}
                      className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Confirmer la déconnexion
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="w-full h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Annuler
                    </Button>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Lien de retour */}
        <motion.div 
          className="text-center mt-6"
          variants={itemVariants}
        >
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
