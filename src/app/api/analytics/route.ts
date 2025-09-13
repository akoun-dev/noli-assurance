import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

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
    const { data: analyticsEvent, error } = await supabase
      .from('UserAnalytics')
      .insert({
        id: uuidv4(),
        eventType,
        eventData: eventData ? JSON.stringify(eventData) : null,
        userId: userId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || request.headers.get('user-agent') || null
      })
      .select()
      .single()

    if (error) throw error
    
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
    
    let query = supabase
      .from('UserAnalytics')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(1000)

    if (eventType) {
      query = query.eq('eventType', eventType)
    }
    if (userId) {
      query = query.eq('userId', userId)
    }
    if (startDate) {
      query = query.gte('createdAt', startDate)
    }
    if (endDate) {
      query = query.lte('createdAt', endDate)
    }

    const { data: events, error } = await query
    if (error) throw error
    
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
      const day = new Date(event.createdAt).toISOString().split('T')[0]
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
