'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, easeInOut } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Filter, Star, Shield, Check, Phone, Mail, MessageCircle, Info, X, Heart, Eye, Zap, GitCompare } from "lucide-react"
import Link from "next/link"
import { UserProfile } from "@/components/UserProfile"
import { useToast } from "@/hooks/use-toast"

interface InsuranceOffer {
  id: string
  insurer: string
  logo: string
  monthlyPrice: number
  annualPrice: number
  coverageLevel: string
  rating: number
  features: string[]
  franchise: number
  description: string
  includedOptions: string[]
  additionalOptions: string[]
}

const filterOptions = {
  insurers: ['NSIA Assurance', 'Atlantique Assurance', 'Saham Assurance', 'Allianz CI', 'AXA Assurance', 'Sunu Assurance'],
  coverageLevels: ['Tiers', 'Tiers +', 'Tous risques'],
  franchiseLevels: ['Faible', 'Standard', 'Élevé'],
  features: ['Assistance 24/7', 'Véhicule de remplacement', 'Protection juridique', 'Individuel Accident Passager', 'Individuel Accident Conducteur']
}

export default function ResultatsPage() {
  const { toast } = useToast()
  const [offers, setOffers] = useState<InsuranceOffer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<InsuranceOffer[]>([])
  const [sortBy, setSortBy] = useState<string>('price-asc')
  const [selectedFilters, setSelectedFilters] = useState({
    insurers: [] as string[],
    coverageLevels: [] as string[],
    franchiseLevels: [] as string[],
    features: [] as string[]
  })
  const [selectedOffer, setSelectedOffer] = useState<InsuranceOffer | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMethod, setContactMethod] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparisonOffers, setComparisonOffers] = useState<InsuranceOffer[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const trackEvent = (eventType: string, eventData?: any) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        eventData
      })
    }).catch(console.error)
  }

  useEffect(() => {
    // Récupérer les résultats de la comparaison depuis sessionStorage
    const storedResults = sessionStorage.getItem('comparisonResults')
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults)
        if (Array.isArray(parsedResults) && parsedResults.length > 0) {
          const transformed = parsedResults.map((offer: any) => ({
            ...offer,
            insurer: offer.insurer?.nomEntreprise || offer.insurer || 'Assureur'
          }))
          setOffers(transformed)
          setFilteredOffers(transformed)
          setLoading(false)
          
          trackEvent('page_view', { page: 'results', offers_count: transformed.length })
          return
        }
      } catch (error) {
        console.error('Error parsing stored results:', error)
      }
    }
    
    // Si pas de résultats valides stockés, essayer de charger les offres directement
    const loadOffersDirectly = async () => {
      try {
        const response = await fetch('/api/comparateur/offers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        const result = await response.json()
        if (result.success && result.offers) {
          // Transformer les données au format attendu
          const transformedOffers = result.offers.map((offer: any) => ({
            id: offer.id,
            insurer: offer.insurer?.nomEntreprise || 'Assureur',
            monthlyPrice: offer.monthlyPrice || 0,
            annualPrice: offer.annualPrice || (offer.monthlyPrice || 0) * 12,
            coverageLevel: offer.coverageLevel || 'Tiers',
            rating: offer.rating || 4.0,
            features: offer.features || [],
            franchise: offer.franchise || 50000,
            description: offer.description || `Offre ${offer.coverageLevel}`,
            includedOptions: offer.includedOptions || [],
            additionalOptions: offer.additionalOptions || []
          }))
          
          setOffers(transformedOffers)
          setFilteredOffers(transformedOffers)
          setLoading(false)
          
          trackEvent('page_view', { page: 'results', offers_count: transformedOffers.length })
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading offers directly:', error)
        setLoading(false)
      }
    }
    
    loadOffersDirectly()
  }, [])

  const applyFilters = () => {
    let filtered = [...offers]

    // Filter by insurers
    if (selectedFilters.insurers.length > 0) {
      filtered = filtered.filter(offer => selectedFilters.insurers.includes(offer.insurer))
    }

    // Filter by coverage levels
    if (selectedFilters.coverageLevels.length > 0) {
      filtered = filtered.filter(offer => selectedFilters.coverageLevels.includes(offer.coverageLevel))
    }

    // Filter by franchise levels
    if (selectedFilters.franchiseLevels.length > 0) {
      filtered = filtered.filter(offer => {
        if (selectedFilters.franchiseLevels.includes('Faible') && offer.franchise <= 75000) return true
        if (selectedFilters.franchiseLevels.includes('Standard') && offer.franchise > 75000 && offer.franchise <= 125000) return true
        if (selectedFilters.franchiseLevels.includes('Élevé') && offer.franchise > 125000) return true
        return false
      })
    }

    // Filter by features
    if (selectedFilters.features.length > 0) {
      filtered = filtered.filter(offer => 
        selectedFilters.features.every(feature => offer.features.includes(feature))
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.monthlyPrice - b.monthlyPrice)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.monthlyPrice - a.monthlyPrice)
        break
      case 'coverage-desc':
        filtered.sort((a, b) => {
          const coverageOrder = { 'Tous risques': 3, 'Tiers +': 2, 'Tiers': 1 }
          return coverageOrder[b.coverageLevel as keyof typeof coverageOrder] - coverageOrder[a.coverageLevel as keyof typeof coverageOrder]
        })
        break
      case 'coverage-asc':
        filtered.sort((a, b) => {
          const coverageOrder = { 'Tous risques': 3, 'Tiers +': 2, 'Tiers': 1 }
          return coverageOrder[a.coverageLevel as keyof typeof coverageOrder] - coverageOrder[b.coverageLevel as keyof typeof coverageOrder]
        })
        break
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating)
        break
    }

    setFilteredOffers(filtered)
  }

  const handleFilterChange = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[category]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      const updated = { ...prev, [category]: newValues }
      return updated
    })
  }

  const handleContactRequest = (offer: InsuranceOffer, method: string) => {
    setSelectedOffer(offer)
    setContactMethod(method)
    setShowContactModal(true)
    
    trackEvent('contact_request', { 
      insurer: offer.insurer, 
      method: method,
      offer_id: offer.id 
    })
  }

  const handleReceiveQuote = (offer: InsuranceOffer) => {
    setSelectedOffer(offer)
    setShowContactModal(true)
    
    trackEvent('quote_request', { 
      insurer: offer.insurer, 
      action: 'receive_quote',
      offer_id: offer.id 
    })
  }

  const toggleFavorite = (offerId: string) => {
    setFavorites(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    )
  }

  const toggleComparison = (offer: InsuranceOffer) => {
    setComparisonOffers(prev => {
      const exists = prev.find(o => o.id === offer.id)
      if (exists) {
        return prev.filter(o => o.id !== offer.id)
      } else if (prev.length < 5) {
        return [...prev, offer]
      }
      return prev
    })
  }

  const getCoverageColor = (level: string) => {
    switch (level) {
      case 'Tiers': return 'bg-green-100 text-green-800 border-green-200'
      case 'Tiers +': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Tous risques': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFranchiseLevel = (franchise: number) => {
    if (franchise <= 75000) return 'Faible'
    if (franchise <= 125000) return 'Standard'
    return 'Élevé'
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        ease: easeInOut
      }
    }
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    hover: {
      scale: 1.02
    }
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50
    }
  }

  // Transitions
  const cardTransition = {
    duration: 0.5,
    ease: easeInOut
  }

  const modalTransition = {
    duration: 0.3,
    ease: easeInOut
  }

  const hoverTransition = {
    duration: 0.2
  }

  // Apply filters whenever filters or sort changes
  useEffect(() => {
    if (!loading) {
      applyFilters()
    }
  }, [selectedFilters, sortBy, offers, loading])

  const ComparisonView = () => (
    <AnimatePresence>
      {showComparison && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowComparison(false)}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <motion.h2 
                className="text-2xl font-bold text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Comparaison des offres
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="ghost" size="sm" onClick={() => setShowComparison(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <motion.div 
                className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitCompare className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">
                      {comparisonOffers.length} offre{comparisonOffers.length > 1 ? 's' : ''} sélectionnée{comparisonOffers.length > 1 ? 's' : ''} pour comparaison
                    </span>
                  </div>
                  <Badge variant="outline" className="border-blue-600 text-blue-600">
                    Maximum 5 offres
                  </Badge>
                </div>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={containerVariants}
                transition={{ ease: easeInOut }}
                initial="hidden"
                animate="visible"
              >
                {comparisonOffers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    variants={cardVariants}
                    transition={cardTransition}
                    whileHover="hover"
                  >
                    <Card className="border-2 border-blue-200 bg-blue-50 relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => toggleComparison(offer)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{offer.insurer}</h3>
                              <Badge className={getCoverageColor(offer.coverageLevel)}>
                                {offer.coverageLevel}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm ml-1">{offer.rating}</span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {offer.monthlyPrice.toLocaleString()} FCFA
                          </div>
                          <div className="text-sm text-gray-600">
                            {offer.annualPrice.toLocaleString()} FCFA/an
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Garanties incluses</h4>
                          <div className="space-y-1">
                            {offer.features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <Check className="h-3 w-3 text-green-600 mr-2" />
                                {feature}
                              </div>
                            ))}
                            {offer.features.length > 4 && (
                              <div className="text-xs text-gray-500">
                                +{offer.features.length - 4} autres garanties
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Franchise:</span>
                            <span className="font-medium">{offer.franchise.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Niveau franchise:</span>
                            <Badge variant="outline" className="text-xs">
                              {getFranchiseLevel(offer.franchise)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 pt-4">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleReceiveQuote(offer)}
                            >
                              Recevoir le devis
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleContactRequest(offer, 'telephone')}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Être rappelé
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">NOLI</h1>
                <p className="text-xs text-gray-500">Assurance Auto</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-blue-600 text-blue-600 h-10 px-4">
                {filteredOffers.length} offres
              </Badge>
              {comparisonOffers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-blue-600 text-blue-600 relative"
                  onClick={() => setShowComparison(true)}
                >
                  <GitCompare className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Comparer</span>
                  <span className="sm:ml-1">({comparisonOffers.length}/5)</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                </Button>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-blue-600" />
                  Filtres
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFilters({
                    insurers: [],
                    coverageLevels: [],
                    franchiseLevels: [],
                    features: []
                  })}
                >
                  Réinitialiser
                </Button>
              </div>

              {/* Comparison Section */}
              {comparisonOffers.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-800 flex items-center">
                      <GitCompare className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Comparaison</span>
                      <span className="sm:ml-1">({comparisonOffers.length}/5)</span>
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComparison(true)}
                      className="text-blue-600 hover:text-blue-800 h-8"
                    >
                      <span className="hidden sm:inline">Voir</span>
                      <Eye className="sm:hidden h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {comparisonOffers.map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-blue-800 font-medium truncate">{offer.insurer}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComparison(offer)}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block text-gray-700">Trier par</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="coverage-desc">Couverture la + complète</SelectItem>
                    <SelectItem value="coverage-asc">Couverture la - complète</SelectItem>
                    <SelectItem value="rating-desc">Meilleure note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-6" />

              {/* Insurers Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block text-gray-700">Assureurs</label>
                <div className="space-y-3">
                  {filterOptions.insurers.map(insurer => (
                    <div key={insurer} className="flex items-center space-x-2">
                      <Checkbox
                        id={insurer}
                        checked={selectedFilters.insurers.includes(insurer)}
                        onCheckedChange={() => handleFilterChange('insurers', insurer)}
                      />
                      <label htmlFor={insurer} className="text-sm text-gray-700 cursor-pointer">{insurer}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage Levels Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block text-gray-700">Niveau de couverture</label>
                <div className="space-y-3">
                  {filterOptions.coverageLevels.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={selectedFilters.coverageLevels.includes(level)}
                        onCheckedChange={() => handleFilterChange('coverageLevels', level)}
                      />
                      <label htmlFor={level} className="text-sm text-gray-700 cursor-pointer">{level}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Franchise Levels Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block text-gray-700">Niveau de franchise</label>
                <div className="space-y-3">
                  {filterOptions.franchiseLevels.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={selectedFilters.franchiseLevels.includes(level)}
                        onCheckedChange={() => handleFilterChange('franchiseLevels', level)}
                      />
                      <label htmlFor={level} className="text-sm text-gray-700 cursor-pointer">{level}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block text-gray-700">Options</label>
                <div className="space-y-3">
                  {filterOptions.features.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={selectedFilters.features.includes(feature)}
                        onCheckedChange={() => handleFilterChange('features', feature)}
                      />
                      <label htmlFor={feature} className="text-sm text-gray-700 cursor-pointer">{feature}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={applyFilters} className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                Appliquer les filtres
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div 
                  className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.h3 
                  className="text-lg font-semibold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Chargement des offres...
                </motion.h3>
                <motion.p 
                  className="text-gray-600"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Nous recherchons les meilleures offres pour vous
                </motion.p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                transition={{ ease: easeInOut }}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredOffers.map((offer) => (
                    <motion.div
                      key={offer.id}
                      variants={cardVariants}
                      transition={cardTransition}
                      whileHover="hover"
                      layout
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Left side - Insurer info */}
                            <div className="flex items-center space-x-4 min-w-0">
                              <motion.div 
                                className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Shield className="h-8 w-8 text-blue-600" />
                              </motion.div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 truncate">{offer.insurer}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.2 }}
                                      >
                                        <Star
                                          className={`h-4 w-4 ${
                                            i < Math.floor(offer.rating)
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      </motion.div>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">({offer.rating})</span>
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Badge className={`mt-2 ${getCoverageColor(offer.coverageLevel)}`}>
                                    {offer.coverageLevel}
                                  </Badge>
                                </motion.div>
                              </div>
                            </div>

                            {/* Middle - Features */}
                            <div className="flex-1 min-w-0 mx-6">
                              <div className="flex flex-wrap gap-2 mb-3">
                                {offer.features.slice(0, 3).map((feature, index) => (
                                  <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {feature}
                                    </Badge>
                                  </motion.div>
                                ))}
                                {offer.features.length > 3 && (
                                  <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                    +{offer.features.length - 3} options
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Franchise:</span>
                                  <span className="font-medium ml-1">{offer.franchise.toLocaleString()} FCFA</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Niveau:</span>
                                  <Badge variant="outline" className="text-xs ml-1">
                                    {getFranchiseLevel(offer.franchise)}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Right side - Price and Actions */}
                            <div className="text-right flex-shrink-0">
                              <motion.div 
                                className="mb-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <div className="text-3xl font-bold text-blue-600">
                                  {offer.monthlyPrice.toLocaleString()} FCFA
                                </div>
                                <div className="text-sm text-gray-600">
                                  {offer.annualPrice.toLocaleString()} FCFA/an
                                </div>
                              </motion.div>
                              
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleFavorite(offer.id)}
                                      className={`p-2 ${favorites.includes(offer.id) ? 'text-red-500' : 'text-gray-400'}`}
                                      aria-label={favorites.includes(offer.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                                    >
                                      <Heart className={`h-4 w-4 ${favorites.includes(offer.id) ? 'fill-current' : ''}`} />
                                    </Button>
                                  </motion.div>
                                  <div className="relative group">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleComparison(offer)}
                                        className={`p-2 relative ${comparisonOffers.find(o => o.id === offer.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600'}`}
                                        disabled={comparisonOffers.length >= 5 && !comparisonOffers.find(o => o.id === offer.id)}
                                        aria-label={comparisonOffers.find(o => o.id === offer.id) ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
                                      >
                                        <GitCompare className="h-4 w-4" />
                                        {comparisonOffers.find(o => o.id === offer.id) && (
                                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                                        )}
                                      </Button>
                                    </motion.div>
                                    {comparisonOffers.length >= 5 && !comparisonOffers.find(o => o.id === offer.id) && (
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="hidden sm:inline">Maximum 5 offres pour la comparaison</span>
                                        <span className="sm:hidden">Max 5</span>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                      </div>
                                    )}
                                  </div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="p-2">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>{offer.insurer} - {offer.coverageLevel}</DialogTitle>
                                          <DialogDescription>
                                            {offer.description}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="font-semibold mb-2">Garanties incluses</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                              {offer.features.map((feature, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                  <Check className="h-4 w-4 text-green-600" />
                                                  <span className="text-sm">{feature}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold mb-2">Options disponibles</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                              {offer.additionalOptions.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                  <Check className="h-4 w-4 text-blue-600" />
                                                  <span className="text-sm">{option}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                              <div>
                                                <p className="text-sm text-gray-600">Franchise</p>
                                                <p className="font-semibold">{offer.franchise.toLocaleString()} FCFA</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-sm text-gray-600">Prix mensuel</p>
                                                <p className="font-bold text-xl text-blue-600">
                                                  {offer.monthlyPrice.toLocaleString()} FCFA
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </motion.div>
                                </div>
                                
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <Button
                                    size="sm"
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-10"
                                    onClick={() => handleReceiveQuote(offer)}
                                  >
                                    <Zap className="mr-2 h-4 w-4" />
                                    Recevoir le devis
                                  </Button>
                                </motion.div>
                                
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-10"
                                    onClick={() => handleContactRequest(offer, 'telephone')}
                                  >
                                    <Phone className="mr-2 h-4 w-4" />
                                    Être rappelé
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
            
            {!loading && filteredOffers.length === 0 && (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 3 
                  }}
                >
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                </motion.div>
                <motion.h3 
                  className="text-lg font-semibold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Aucune offre trouvée
                </motion.h3>
                <motion.p 
                  className="text-gray-600 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Essayez de modifier vos filtres pour voir plus d'options
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFilters({
                      insurers: [],
                      coverageLevels: [],
                      franchiseLevels: [],
                      features: []
                    })}
                  >
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOffer ? `${selectedOffer.insurer} - Contact` : 'Contact'}
            </DialogTitle>
            <DialogDescription>
              Choisissez comment vous souhaitez être contacté
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  trackEvent('contact_method_selected', { 
                    method: 'email', 
                    insurer: selectedOffer?.insurer 
                  })
                  toast({
                    title: "Devis envoyé par email",
                    description: "Vous recevrez un email dans les prochaines minutes avec votre devis.",
                    variant: "default",
                  })
                  setShowContactModal(false)
                }}
              >
                <Mail className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Recevoir par email</p>
                  <p className="text-sm text-gray-600">Devis PDF envoyé immédiatement</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  trackEvent('contact_method_selected', { 
                    method: 'whatsapp', 
                    insurer: selectedOffer?.insurer 
                  })
                  toast({
                    title: "Devis envoyé par WhatsApp",
                    description: "Vous recevrez votre devis par WhatsApp dans les prochaines minutes.",
                    variant: "default",
                  })
                  setShowContactModal(false)
                }}
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Recevoir par WhatsApp</p>
                  <p className="text-sm text-gray-600">Devis PDF envoyé instantanément</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  trackEvent('contact_method_selected', { 
                    method: 'telephone', 
                    insurer: selectedOffer?.insurer 
                  })
                  toast({
                    title: "Conseiller contacté",
                    description: "Un conseiller vous contactera dans les 48h pour discuter de votre devis.",
                    variant: "default",
                  })
                  setShowContactModal(false)
                }}
              >
                <Phone className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Être contacté par téléphone</p>
                  <p className="text-sm text-gray-600">Conseiller vous appelle sous 48h</p>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Modal */}
      {showComparison && <ComparisonView />}
    </div>
  )
}