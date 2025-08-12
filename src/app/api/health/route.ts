
import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { error } = await supabase.from('users').select('id', { count: 'exact', head: true })
    if (error) throw error
    return NextResponse.json({
      status: 'healthy',
      database: 'connected'
    })
  } catch (error: any) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error?.message || 'Unknown database error'
      },
      { status: 500 }
    )
  }
}
