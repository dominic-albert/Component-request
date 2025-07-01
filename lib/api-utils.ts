import { supabaseAdmin } from "./supabase"
import { createHash } from "crypto"

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

export function generateApiKey(userEmail: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  const username = userEmail.split("@")[0]
  return `crs_${username}_${timestamp}_${random}`
}

export async function validateApiKey(apiKey: string) {
  const keyHash = hashApiKey(apiKey)

  const { data, error } = await supabaseAdmin.rpc("validate_api_key", { p_key_hash: keyHash })

  if (error || !data || data.length === 0) {
    return null
  }

  return data[0]
}

export async function createUser(email: string, name?: string, role = "Requester") {
  const { data, error } = await supabaseAdmin.rpc("create_or_get_user", {
    p_email: email,
    p_name: name,
    p_role: role,
  })

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return data
}

export async function generateNextRequestId(): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("generate_next_request_id")

  if (error) {
    throw new Error(`Failed to generate request ID: ${error.message}`)
  }

  return data
}
