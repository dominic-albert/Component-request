import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateApiKey, hashApiKey, createUser } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Create or get user
    const userId = await createUser(email, name)

    // Generate new API key
    const apiKey = generateApiKey(email)
    const keyHash = hashApiKey(apiKey)
    const keyPrefix = apiKey.substring(0, 12) + "..."

    // Store API key
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        user_id: userId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: "Dashboard API Key",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      apiKey,
      keyInfo: data,
    })
  } catch (error) {
    console.error("Error generating API key:", error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}
