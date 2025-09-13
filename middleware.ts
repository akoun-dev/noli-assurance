import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting simple en mémoire (pour la production, utiliser Redis)
const rateLimit = new Map<string, { count: number; lastReset: number }>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // max 100 requêtes par fenêtre

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') || 
             'unknown'
  const url = request.nextUrl.pathname
  
  // Skip rate limiting for static assets and health check
  if (url.startsWith('/_next') || url.startsWith('/api/health')) {
    return NextResponse.next()
  }

  // Rate limiting pour les API
  if (url.startsWith('/api/')) {
    const now = Date.now()
    const userLimit = rateLimit.get(ip)
    
    if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
      rateLimit.set(ip, { count: 1, lastReset: now })
    } else {
      userLimit.count++
      if (userLimit.count > RATE_LIMIT_MAX_REQUESTS) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
  }

  // Security headers
  const response = NextResponse.next()
  
  // Ajouter des en-têtes de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP (Content Security Policy)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;"
  )

  // Protection contre le clickjacking
  if (url.includes('/admin') || url.includes('/dashboard')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
