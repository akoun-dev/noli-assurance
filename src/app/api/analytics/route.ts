import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
const db: any = supabase

interface AnalyticsEvent {
  eventType: 'page_view' | 'cta_click' | 'form_start' | 'form_complete' | 'quote_request' | 'contact_request'
  eventData?: any
  userId?: string
  ipAddress?: string
  userAgent?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsEvent = await request.json()
    const { eventType, eventData, userId, ipAddress, userAgent } = body
    
    // Créer l'événement analytics
    const analyticsEvent = await db.userAnalytics.create({
      data: {
        eventType,
        eventData: eventData ? JSON.stringify(eventData) : null,
        userId: userId || null,
        ipAddress: ipAddress || request.ip || null,
        userAgent: userAgent || request.headers.get('user-agent') || null
      }
    })
    
    return NextResponse.json({
      success: true,
      eventId: analyticsEvent.id
    })

  } catch (error) {
    console.error('Error tracking analytics event:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('eventType')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const whereClause: any = {}
    
    if (eventType) {
      whereClause.eventType = eventType
    }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }
    
    const events = await db.userAnalytics.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 1000 // Limiter à 1000 événements pour éviter les surcharges
    })
    
    // Agréger les données pour le dashboard
    const aggregatedData = {
      totalEvents: events.length,
      eventsByType: {} as Record<string, number>,
      eventsByDay: {} as Record<string, number>,
      uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size
    }
    
    events.forEach(event => {
      // Compter par type d'événement
      aggregatedData.eventsByType[event.eventType] = 
        (aggregatedData.eventsByType[event.eventType] || 0) + 1
      
      // Compter par jour
      const day = event.createdAt.toISOString().split('T')[0]
      aggregatedData.eventsByDay[day] = 
        (aggregatedData.eventsByDay[day] || 0) + 1
    })
    
    return NextResponse.json({
      success: true,
      events: events,
      aggregated: aggregatedData
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}