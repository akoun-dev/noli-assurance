'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Shield, Zap, Clock, Users, Star, TrendingUp, Award, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/UserProfile"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const trackEvent = (eventType: string, eventData?: any) => {
    if (typeof window !== 'undefined') {
      try {
        const data = JSON.stringify({ eventType, eventData })
        if (!navigator.sendBeacon?.('/api/analytics', data)) {
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true
          }).catch(() => {})
        }
      } catch (e) {
        console.error('Tracking error:', e)
      }
    }
  }

  useEffect(() => {
    trackEvent('page_view', { page: 'home' })
  }, [])

  useEffect(() => {
    if (session && status === 'authenticated') {
      switch (session.user.role) {
        case 'USER':
          router.push('/mes-devis')
          break
        case 'ADMIN':
          router.push('/admin')
          break
        case 'ASSUREUR':
          router.push('/dashboard')
          break
        default:
          router.push('/mes-devis')
      }
    }
  }, [session, status, router])

  if (session && status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Redirection vers votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">NOLI</h1>
                <p className="text-xs text-gray-500">Assurance Auto</p>
              </div>
            </Link>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#pourquoi" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pourquoi NOLI ?</a>
              <a href="#comment-ca-marche" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Comment ça marche ?</a>
              <a href="#partenaires" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Nos partenaires</a>
              <a href="#avis" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Avis clients</a>
              <UserProfile />
            </nav>

            <div className="lg:hidden flex items-center space-x-2">
              <UserProfile variant="minimal" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu')
                  menu?.classList.toggle('hidden')
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>

          <div id="mobile-menu" className="hidden lg:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-3">
              <a 
                href="#pourquoi" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-2"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu')
                  menu?.classList.add('hidden')
                }}
              >
                Pourquoi NOLI ?
              </a>
              <a 
                href="#comment-ca-marche" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-2"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu')
                  menu?.classList.add('hidden')
                }}
              >
                Comment ça marche ?
              </a>
              <a 
                href="#partenaires" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-2"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu')
                  menu?.classList.add('hidden')
                }}
              >
                Nos partenaires
              </a>
              <a 
                href="#avis" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-2"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu')
                  menu?.classList.add('hidden')
                }}
              >
                Avis clients
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge variant="secondary" className="mb-4 sm:mb-6 bg-blue-100 text-blue-800 border-blue-200 text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Économisez jusqu'à 40% sur votre assurance auto
                  </Badge>
                </motion.div>
                
                <motion.h1 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Comparez les meilleures assurances auto
                  <span className="block text-blue-600 mt-2">en moins de 3 minutes</span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Comparez gratuitement les offres des plus grands assureurs ivoiriens et trouvez l'assurance qui vous correspond au meilleur prix.
                </motion.p>

                <motion.div
                  className="mb-8 sm:mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors"
                      onClick={async () => {
                        await trackEvent('cta_click', { cta: 'main_compare', location: 'hero' });
                        window.location.assign('/formulaire-assure');
                      }}
                    >
                      Commencer mon devis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </motion.div>
                </motion.div>
                
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 sm:mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {[
                    { value: '6', label: 'Assureurs' },
                    { value: '50K+', label: 'Clients' },
                    { value: '3 min', label: 'Temps' },
                    { value: '40%', label: 'Économie' }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                      <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Assurance Auto</h3>
                    <p className="text-gray-600">Le meilleur prix garanti</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      À partir de<br/>
                      <span className="text-5xl">25 000 FCFA</span>
                    </div>
                    <div className="text-gray-500">/ an</div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      '✓ Comparaison instantanée',
                      '✓ Meilleur prix garanti',
                      '✓ Souscription en ligne',
                      '✓ Assistance 24/7'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/formulaire-assure"
                      prefetch={false}
                      onClick={() => trackEvent('cta_click', { cta: 'assurance_auto_card', location: 'hero' })}
                    >
                      <Button
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-colors h-12 font-semibold text-lg"
                      >
                        Obtenir mon devis gratuit
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                  
                  <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                      ⏱️ En moins de 3 minutes • 🔄 Sans engagement
                    </p>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">100% sécurisé</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Section Nos Services */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Avec NOLI, comparer c'est gagner</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez toutes nos solutions d'assurance pour vous protéger au meilleur prix
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Assurance Auto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-blue-200 bg-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-blue-600">Assurance Auto</CardTitle>
                  <CardDescription className="text-gray-600">Protection complète pour votre véhicule</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">25 000 FCFA</div>
                  <div className="text-sm text-gray-500 mb-4">/ an</div>
                  <div className="space-y-2 mb-6">
                    <div className="text-sm text-gray-700">✓ Tous risques</div>
                    <div className="text-sm text-gray-700">✓ Assistance 24/7</div>
                    <div className="text-sm text-gray-700">✓ Véhicule de remplacement</div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                    onClick={() => trackEvent('service_click', { service: 'assurance_auto', location: 'services_grid' })}
                  >
                    Comparer les offres
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Assurance Habitation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-blue-200 bg-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-blue-600">Assurance Habitation</CardTitle>
                  <CardDescription className="text-gray-600">Protégez votre logement et vos biens</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">15 000 FCFA</div>
                  <div className="text-sm text-gray-500 mb-4">/ an</div>
                  <div className="space-y-2 mb-6">
                    <div className="text-sm text-gray-700">✓ Incendie et dégâts des eaux</div>
                    <div className="text-sm text-gray-700">✓ Vol et vandalisme</div>
                    <div className="text-sm text-gray-700">✓ Responsabilité civile</div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                    onClick={() => trackEvent('service_click', { service: 'assurance_habitation', location: 'services_grid' })}
                  >
                    Comparer les offres
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Assurance Santé */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-2 border-blue-200 bg-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-blue-600">Assurance Santé</CardTitle>
                  <CardDescription className="text-gray-600">Couverture médicale complète</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">30 000 FCFA</div>
                  <div className="text-sm text-gray-500 mb-4">/ an</div>
                  <div className="space-y-2 mb-6">
                    <div className="text-sm text-gray-700">✓ Hospitalisation</div>
                    <div className="text-sm text-gray-700">✓ Consultations</div>
                    <div className="text-sm text-gray-700">✓ Médicaments</div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                    onClick={() => trackEvent('service_click', { service: 'assurance_sante', location: 'services_grid' })}
                  >
                    Comparer les offres
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          
        </div>
      </section>
    </div>
  )
}