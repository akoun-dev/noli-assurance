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
        // Essayer d'abord avec sendBeacon, sinon fallback sur fetch
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
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Si l'utilisateur est connecté et authentifié, on affiche un écran de chargement pendant la redirection
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
            
            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#pourquoi" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pourquoi NOLI ?</a>
              <a href="#comment-ca-marche" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Comment ça marche ?</a>
              <a href="#partenaires" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Nos partenaires</a>
              <a href="#avis" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Avis clients</a>
              <UserProfile />
            </nav>

            {/* Menu Mobile Button */}
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

          {/* Mobile Menu */}
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

      {/* Hero Section avec CTA moderne */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Partie gauche - Contenu */}
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

                {/* CTA Principal */}
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
                
                {/* Stats */}
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
              
              {/* Partie droite - CTA Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                {/* Card principale */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  {/* Icône décorative */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Assurance Auto</h3>
                    <p className="text-gray-600">Le meilleur prix garanti</p>
                  </div>
                  
                  {/* Prix attractif */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      À partir de<br/>
                      <span className="text-5xl">25 000 FCFA</span>
                    </div>
                    <div className="text-gray-500">/ an</div>
                  </div>
                  
                  {/* Liste des avantages */}
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
                  
                  {/* CTA Button */}
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
                  
                  {/* Texte de confiance */}
                  <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                      ⏱️ En moins de 3 minutes • 🔄 Sans engagement
                    </p>
                  </div>
                </div>
                
                {/* Badge de confiance */}
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
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Section Nos Services - comme dans l'image */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Avec NOLI, comparer c'est gagner</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez toutes nos solutions d'assurance pour vous protéger au meilleur prix
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Assurance Auto - Carte principale */}
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
                <Link
                  href="/formulaire-assure"
                  prefetch={false}
                  onClick={() => trackEvent('service_click', { service: 'assurance_auto', location: 'services_grid' })}
                >
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Obtenir un devis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Assurance Moto */}
            <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-green-600">Assurance Moto</CardTitle>
                <CardDescription className="text-gray-600">Roulez en toute sérénité</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">15 000 FCFA</div>
                <div className="text-sm text-gray-500 mb-4">/ an</div>
                <div className="space-y-2 mb-6">
                  <div className="text-sm text-gray-700">✓ Protection conducteur</div>
                  <div className="text-sm text-gray-700">✓ Vol et incendie</div>
                  <div className="text-sm text-gray-700">✓ Assistance routière</div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 font-semibold"
                  onClick={() => trackEvent('service_click', { service: 'assurance_moto', location: 'services_grid' })}
                >
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>

            {/* Santé */}
            <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-purple-600">Mutuelle Santé</CardTitle>
                <CardDescription className="text-gray-600">Votre bien-être assuré</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">30 000 FCFA</div>
                <div className="text-sm text-gray-500 mb-4">/ an</div>
                <div className="space-y-2 mb-6">
                  <div className="text-sm text-gray-700">✓ Consultations illimitées</div>
                  <div className="text-sm text-gray-700">✓ Hospitalisation</div>
                  <div className="text-sm text-gray-700">✓ Médicaments pris en charge</div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
                  onClick={() => trackEvent('service_click', { service: 'mutuelle_sante', location: 'services_grid' })}
                >
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>

            {/* Habitation */}
            <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-orange-600">Assurance Habitation</CardTitle>
                <CardDescription className="text-gray-600">Protégez votre logement</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">35 000 FCFA</div>
                <div className="text-sm text-gray-500 mb-4">/ an</div>
                <div className="space-y-2 mb-6">
                  <div className="text-sm text-gray-700">✓ Incendie et dégâts des eaux</div>
                  <div className="text-sm text-gray-700">✓ Vol et vandalisme</div>
                  <div className="text-sm text-gray-700">✓ Responsabilité civile</div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold"
                  onClick={() => trackEvent('service_click', { service: 'assurance_habitation', location: 'services_grid' })}
                >
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>

            {/* Prêt */}
            <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-red-600">Assurance Prêt</CardTitle>
                <CardDescription className="text-gray-600">Sécurisez vos emprunts</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">50 000 FCFA</div>
                <div className="text-sm text-gray-500 mb-4">/ an</div>
                <div className="space-y-2 mb-6">
                  <div className="text-sm text-gray-700">✓ Décès et invalidité</div>
                  <div className="text-sm text-gray-700">✓ Perte d'emploi</div>
                  <div className="text-sm text-gray-700">✓ Incapacité de travail</div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-red-600 text-red-600 hover:bg-red-50 font-semibold"
                  onClick={() => trackEvent('service_click', { service: 'assurance_pret', location: 'services_grid' })}
                >
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>

            {/* Énergie */}
            <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-yellow-600">Énergie</CardTitle>
                <CardDescription className="text-gray-600">Électricité et Gaz</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">8 fournisseurs</div>
                <div className="text-sm text-gray-500 mb-4">comparés</div>
                <div className="space-y-2 mb-6">
                  <div className="text-sm text-gray-700">✓ Meilleurs tarifs</div>
                  <div className="text-sm text-gray-700">✓ Service client</div>
                  <div className="text-sm text-gray-700">✓ Offres promotionnelles</div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-semibold"
                  onClick={() => trackEvent('service_click', { service: 'energie', location: 'services_grid' })}
                >
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Comment ça marche ?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              En 3 étapes simples, trouvez l'assurance auto qui vous correspond au meilleur prix
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">1</div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Remplissez le formulaire</h3>
              <p className="text-sm sm:text-base text-gray-600">Renseignez vos informations personnelles et celles de votre véhicule en quelques minutes</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">2</div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Comparez les offres</h3>
              <p className="text-sm sm:text-base text-gray-600">Découvrez les meilleures offres adaptées à votre profil et à votre budget</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">3</div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Choisissez et souscrivez</h3>
              <p className="text-sm sm:text-base text-gray-600">Sélectionnez l'offre qui vous convient et recevez votre devis gratuitement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Pourquoi choisir NOLI */}
      <section id="pourquoi" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Pourquoi choisir NOLI ?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Nous vous offrons la meilleure expérience pour comparer et souscrire votre assurance auto
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Gain de temps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 text-center">Plus besoin de contacter chaque assureur individuellement. Tout en un seul endroit.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Star className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Meilleur prix</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 text-center">Accès aux tarifs négociés avec nos partenaires assureurs pour vous faire économiser.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 text-center">Vos données personnelles sont protégées et cryptées selon les normes les plus strictes.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Simplicité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 text-center">Interface intuitive et facile à utiliser, même pour les débutants en assurance.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Partenaires */}
      <section id="partenaires" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Nos partenaires assureurs</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Nous travaillons avec les meilleurs assureurs de Côte d'Ivoire pour vous offrir les meilleures offres
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {['NSIA Assurance', 'Atlantique Assurance', 'Saham Assurance', 'Allianz CI', 'AXA Assurance', 'Sunu Assurance'].map((insurer, index) => (
              <div key={index} className="flex items-center justify-center group">
                <div className="bg-gray-100 rounded-xl p-4 sm:p-6 w-full h-24 sm:h-32 flex items-center justify-center group-hover:shadow-lg transition-all duration-300 border border-gray-200">
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm text-gray-700">{insurer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Avis */}
      <section id="avis" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de nos utilisateurs satisfaits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Excellent service ! J'ai économisé 35% sur mon assurance auto en seulement 5 minutes. L'interface est très intuitive."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">MK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Marie K.</p>
                    <p className="text-xs text-gray-500">Abidjan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Très simple à utiliser et les offres sont claires. J'ai pu comparer plusieurs assureurs et trouver la meilleure offre pour moi."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">JP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Jean P.</p>
                    <p className="text-xs text-gray-500">Yamoussoukro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Le comparateur m'a permis de trouver une meilleure couverture pour moins cher. Je recommande vivement NOLI !"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">AT</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ahmed T.</p>
                    <p className="text-xs text-gray-500">Bouaké</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Prêt à économiser sur votre assurance auto ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez des milliers d'utilisateurs qui ont déjà économisé avec NOLI
            </p>
            <Link href="/comparateur">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 h-14"
                onClick={() => trackEvent('cta_click', { cta: 'final_compare', location: 'bottom_cta' })}
              >
                <Car className="mr-2 h-5 w-5" />
                Commencer la comparaison
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">NOLI</h4>
                  <p className="text-xs text-gray-400">Assurance Auto</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Votre comparateur d'assurance auto en Côte d'Ivoire. Simple, rapide et efficace.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Produits</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Assurance Auto</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Assurance Moto</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Assurance Camion</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">À propos</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Qui sommes-nous ?</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partenaires</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Légal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-sm text-gray-400">
            <p>© 2025 NOLI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}