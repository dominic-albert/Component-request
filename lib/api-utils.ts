import { supabaseAdmin } from "./supabase"
import type { ComponentRequest, User, ApiKey } from "./supabase"
import { createHash } from "crypto"

// Request management functions
export async function getAllRequests(): Promise<ComponentRequest[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("component_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching requests:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllRequests:", error)
    return []
  }
}

export async function getRequestById(id: string): Promise<ComponentRequest | null> {
  try {
    const { data, error } = await supabaseAdmin.from("component_requests").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching request:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getRequestById:", error)
    return null
  }
}

export async function createRequest(
  requestData: Omit<ComponentRequest, "id" | "created_at" | "updated_at">,
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.from("component_requests").insert(requestData).select("id").single()

    if (error) {
      console.error("Error creating request:", error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error("Error in createRequest:", error)
    return null
  }
}

export async function updateRequestStatus(
  id: string,
  status: ComponentRequest["status"],
  denialReason?: string,
): Promise<boolean> {
  try {
    // Try using RPC function first
    const { data, error } = await supabaseAdmin.rpc("update_request_status", {
      p_request_id: id,
      p_status: status,
      p_denial_reason: denialReason || null,
    })

    if (error) {
      console.error("RPC error, falling back to direct update:", error)
      // Fallback to direct update
      const updateData: any = { status, updated_at: new Date().toISOString() }
      if (denialReason) updateData.denial_reason = denialReason

      const { error: updateError } = await supabaseAdmin.from("component_requests").update(updateData).eq("id", id)

      if (updateError) {
        console.error("Error updating request status:", updateError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error in updateRequestStatus:", error)
    return false
  }
}

export async function deleteRequest(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("component_requests").delete().eq("id", id)

    if (error) {
      console.error("Error deleting request:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteRequest:", error)
    return false
  }
}

export async function generateNextRequestId(): Promise<string> {
  try {
    // Try RPC function first
    const { data, error } = await supabaseAdmin.rpc("generate_next_request_id")

    if (error) {
      console.error("RPC error, generating fallback ID:", error)
      // Fallback: generate a simple ID
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 1000)
      return `REQ-${timestamp}-${random}`
    }

    return data || `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  } catch (error) {
    console.error("Error generating request ID:", error)
    // Fallback ID generation
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `REQ-${timestamp}-${random}`
  }
}

// User management functions with better error handling
export async function getOrCreateUser(
  email: string,
  name: string,
  role: User["role"] = "Requester",
): Promise<User | null> {
  try {
    // First try to get existing user
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (existingUser && !getUserError) {
      return existingUser
    }

    // If user doesn't exist, create new one
    const newUser = {
      email,
      name: name || email.split("@")[0],
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: createdUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert(newUser)
      .select("*")
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return null
    }

    return createdUser
  } catch (error) {
    console.error("Error in getOrCreateUser:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

    if (error) {
      console.error("Error fetching user by email:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getUserByEmail:", error)
    return null
  }
}

export async function createUser(email: string, name?: string, role = "Requester") {
  return getOrCreateUser(email, name || email.split("@")[0], role as User["role"])
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

    // Try RPC function first
    const { data, error } = await supabaseAdmin.rpc("validate_api_key", {
      p_key_hash: keyHash,
    })

    if (error || !data || data.length === 0) {
      console.error("API key validation failed:", error)
      return null
    }

    const { user_id, email, name, role } = data[0]
    return { user_id, email, name, role }
  } catch (error) {
    console.error("Error validating API key:", error)
    return null
  }
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  try {
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
  } catch (error) {
    console.error("Error in getUserApiKeys:", error)
    return []
  }
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("api_keys").update({ is_active: false }).eq("id", keyId)

    if (error) {
      console.error("Error revoking API key:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in revokeApiKey:", error)
    return false
  }
}

// Statistics functions
export async function getRequestStats() {
  try {
    // Try RPC function first
    const { data, error } = await supabaseAdmin.rpc("get_request_stats")

    if (error) {
      console.error("RPC error, calculating stats manually:", error)
      // Fallback: calculate stats manually
      const { data: requests, error: requestsError } = await supabaseAdmin.from("component_requests").select("status")

      if (requestsError) {
        console.error("Error fetching requests for stats:", requestsError)
        return {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
        }
      }

      const stats = {
        total: requests?.length || 0,
        pending: requests?.filter((r) => r.status === "Pending").length || 0,
        in_progress: requests?.filter((r) => r.status === "In Progress").length || 0,
        completed: requests?.filter((r) => r.status === "Completed").length || 0,
        cancelled: requests?.filter((r) => r.status === "Cancelled").length || 0,
      }

      return stats
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
  } catch (error) {
    console.error("Error in getRequestStats:", error)
    return {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    }
  }
}
