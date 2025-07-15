import { supabaseAdmin } from "./supabase"
import type { ComponentRequest, User, ApiKey } from "./supabase"
import { createHash } from "crypto"

// Request management functions
export async function getAllRequests(): Promise<ComponentRequest[]> {
  const { data, error } = await supabaseAdmin
    .from("component_requests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching requests:", error)
    return []
  }

  return data || []
}

export async function getRequestById(id: string): Promise<ComponentRequest | null> {
  const { data, error } = await supabaseAdmin.from("component_requests").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching request:", error)
    return null
  }

  return data
}

// This function is not directly used by the POST route, but kept for completeness
export async function createRequest(
  requestData: Omit<ComponentRequest, "id" | "created_at" | "updated_at">,
): Promise<string | null> {
  // Note: The actual POST route in app/api/requests/route.ts handles ID generation and user creation
  // before inserting. This function is a simplified wrapper if you were to use it directly.
  const { data, error } = await supabaseAdmin.from("component_requests").insert(requestData).select("id").single()

  if (error) {
    console.error("Error creating request:", error)
    return null
  }

  return data?.id || null
}

export async function updateRequestStatus(id: string, status: ComponentRequest["status"]): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("update_request_status", {
    p_request_id: id,
    p_status: status,
  })

  if (error) {
    console.error("Error updating request status:", error)
    return false
  }

  return data
}

export async function deleteRequest(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("component_requests").delete().eq("id", id)

  if (error) {
    console.error("Error deleting request:", error)
    return false
  }

  return true
}

export async function generateNextRequestId(): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc("generate_next_request_id")

    if (error) {
      throw new Error(`Failed to generate request ID: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error generating request ID:", error)
    throw error
  }
}

// User management functions
export async function getOrCreateUser(
  email: string,
  name: string,
  role: User["role"] = "Requester",
): Promise<User | null> {
  const { data, error } = await supabaseAdmin.rpc("create_or_get_user", {
    p_email: email,
    p_name: name,
    p_role: role,
  })

  if (error) {
    console.error("Error getting/creating user:", error)
    return null
  }

  // Fetch the complete user record using the returned ID
  const { data: userData, error: userError } = await supabaseAdmin.from("users").select("*").eq("id", data).single()

  if (userError) {
    console.error("Error fetching user data after creation/retrieval:", userError)
    return null
  }

  return userData
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

  if (error) {
    console.error("Error fetching user by email:", error)
    return null
  }

  return data
}

// This function is not directly used by the POST route, but kept for completeness
export async function createUser(email: string, name?: string, role = "Requester") {
  try {
    const { data, error } = await supabaseAdmin.rpc("create_or_get_user", {
      p_email: email,
      p_name: name,
      p_role: role,
    })

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in createUser RPC call:", error)
    throw error
  }
}

// API Key management functions
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
  try {
    const keyHash = hashApiKey(apiKey)

    const { data, error } = await supabaseAdmin.rpc("validate_api_key", {
      p_key_hash: keyHash,
    })

    if (error || !data || data.length === 0) {
      return null
    }

    // The RPC returns a table of api_keys, but we need the user info from the join
    // Assuming the RPC returns user_id, email, name, role directly as per the SQL function
    const { user_id, email, name, role } = data[0]
    return { user_id, email, name, role } // Return the user object
  } catch (error) {
    console.error("Error validating API key:", error)
    return null
  }
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching API keys:", error)
    return []
  }

  return data || []
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("api_keys").update({ is_active: false }).eq("id", keyId)

  if (error) {
    console.error("Error revoking API key:", error)
    return false
  }

  return true
}

// Statistics functions
export async function getRequestStats() {
  const { data, error } = await supabaseAdmin.rpc("get_request_stats")

  if (error) {
    console.error("Error fetching request stats:", error)
    return {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    }
  }

  return (
    data || {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    }
  )
}
