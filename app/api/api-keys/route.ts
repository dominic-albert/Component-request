import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateApiKey, hashApiKey, validateApiKey } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get or create the user
    const { data: user, error: userError } = await supabaseAdmin.rpc("create_or_get_user", {
      p_email: email,
      p_name: name,
      p_role: "Requester", // Default role for API key generation
    })

    if (userError || !user) {
      console.error("Error creating or getting user for API key:", userError)
      return NextResponse.json({ error: "Failed to get or create user" }, { status: 500 })
    }

    const userId = user as string // The RPC returns the user ID directly

    // Generate a new API key
    const newApiKey = generateApiKey(email)
    const keyHash = hashApiKey(newApiKey)
    const keyPrefix = newApiKey.substring(0, 8) // Store a prefix for lookup

    // Insert the new API key into the database
    const { data: insertedKey, error: insertError } = await supabaseAdmin
      .from("api_keys")
      .insert({
        user_id: userId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: `API Key for ${name || email}`,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting API key:", insertError)
      return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
    }

    return NextResponse.json({ apiKey: newApiKey }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in API key generation:", error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authorization header missing or malformed" }, { status: 401 })
  }

  const apiKey = authHeader.substring(7)
  const user = await validateApiKey(apiKey)

  if (!user) {
    return NextResponse.json({ error: "Invalid API Key" }, { status: 403 })
  }

  // For security, we don't return the actual API keys, just confirmation of validity
  return NextResponse.json({ message: "API Key is valid", user_id: user.user_id, email: user.email, role: user.role })
}
