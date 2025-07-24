import { NextResponse } from "next/server"
import { debugSupabaseConnection } from "@/lib/supabase"

export async function GET() {
  try {
    const result = await debugSupabaseConnection()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Debug endpoint failed",
      details: String(error),
    })
  }
}
