import { supabaseAdmin } from "./supabase"
import crypto from "crypto"

// Generate a unique API key
export function generateApiKey(email: string): string {
  const timestamp = Date.now().toString(36)
  const randomBytes = crypto.randomBytes(16).toString("hex")
  const emailHash = crypto.createHash("md5").update(email).digest("hex").substring(0, 8)

  return `crs_${emailHash}_${timestamp}_${randomBytes}`
}

// Hash an API key for storage
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

// Validate an API key
export async function validateApiKey(apiKey: string) {
  try {
    const keyHash = hashApiKey(apiKey)

    const { data, error } = await supabaseAdmin.rpc("validate_api_key", { p_key_hash: keyHash })

    if (error) {
      console.error("API key validation error:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("API key validation error:", error)
    return null
  }
}

// Generate next request ID
export async function generateNextRequestId(): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc("generate_next_request_id")

    if (error) {
      console.error("Error generating request ID:", error)
      throw new Error("Failed to generate request ID")
    }

    return data
  } catch (error) {
    console.error("Error generating request ID:", error)
    throw new Error("Failed to generate request ID")
  }
}

// Create or get user
export async function createUser(email: string, name?: string, role = "Requester"): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc("create_or_get_user", {
      p_email: email,
      p_name: name,
      p_role: role,
    })

    if (error) {
      console.error("Error creating/getting user:", error)
      throw new Error("Failed to create/get user")
    }

    return data
  } catch (error) {
    console.error("Error creating/getting user:", error)
    throw new Error("Failed to create/get user")
  }
}
