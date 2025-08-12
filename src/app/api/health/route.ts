import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
const db: any = supabase;

export async function GET() {
  try {
    // Vérifier la connexion à la base de données
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "healthy",
      database: "connected"
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error?.message || 'Unknown database error'
      },
      { status: 500 }
    );
  }
}