'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Key, ArrowLeft, Clock, Check } from "lucide-react"
import Link from "next/link"

function Verify2FAContent() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  useEffect(() => {
    if (!userId) {
      router.push('/connexion')
      return
    }

    // Timer pour le délai d'expiration
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/connexion')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [userId, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Vérifier le token 2FA via l'API
      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Vérification 2FA réussie ! Connexion en cours...')
        
        // Signer avec NextAuth en marquant le 2FA comme vérifié
        const signInResult = await signIn('credentials', {
          email: '', // Sera récupéré depuis le userId
          password: '', // Sera récupéré depuis le userId
          redirect: false,
          userId: userId,
          twoFactorVerified: true,
        })

        if (signInResult?.error) {
          setError('Erreur lors de la connexion finale')
        } else {
          // Rediriger vers le dashboard
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 1500)
        }
      } else {
        setError(result.error || 'Code 2FA invalide')
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    // Logique pour renvoyer un code ou réinitialiser
    setSuccess('Un nouveau code a été envoyé si disponible')
    setTimeLeft(300) // Réinitialiser le timer
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
          <p className="text-gray-600 mt-2">Vérification à deux facteurs</p>
        </motion.div>

        {/* Carte de vérification 2FA */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Vérification 2FA
              </CardTitle>
              <CardDescription className="text-gray-600">
                Entrez le code à 6 chiffres depuis votre application d'authentification
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                      <Check className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-sm font-medium text-gray-700">
                    Code à 6 chiffres
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="token"
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-2xl tracking-widest"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Temps restant: {formatTime(timeLeft)}</span>
                </div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    type="submit"
                    disabled={loading || token.length !== 6 || timeLeft <= 0}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Vérification...
                      </div>
                    ) : (
                      "Vérifier"
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas reçu de code ?
                </p>
                <Button
                  variant="link"
                  onClick={handleResend}
                  disabled={timeLeft <= 0}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Renvoyer le code
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Problèmes avec le 2FA ?{' '}
                  <Link 
                    href="/connexion" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Retour à la connexion
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

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Verify2FAContent />
    </Suspense>
  )
}
