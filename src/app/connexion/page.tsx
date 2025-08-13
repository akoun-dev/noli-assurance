'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, Users, Building2, Settings } from "lucide-react"
import Link from "next/link"

function ConnexionContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else {
        // Rediriger vers l'URL de callback ou la page d'accueil
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
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
        ease: "easeOut"
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
          <p className="text-gray-600 mt-2">Assurance Auto</p>
        </motion.div>

        {/* Carte de connexion */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Connexion
              </CardTitle>
              <CardDescription className="text-gray-600">
                Connectez-vous à votre compte NOLI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connexion...
                      </div>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas de compte ?{' '}
                  <Link 
                    href="/inscription" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Inscrivez-vous
                  </Link>
                </p>
              </div>
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

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ConnexionContent />
    </Suspense>
  )
}