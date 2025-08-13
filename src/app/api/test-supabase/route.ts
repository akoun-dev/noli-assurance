import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: 'Supabase connection failed', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      sampleData: data
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error', details: err },
      { status: 500 }
    );
  }
}