import { supabaseAdmin } from "./supabase"
import type { ComponentRequest, User, ApiKey } from "./supabase"
import { createHash } from "crypto"

// Check if Supabase is properly configured
const isSupabaseConfigured = !!supabaseAdmin

// Request management functions
export async function getAllRequests(): Promise<ComponentRequest[]> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty array")
    return []
  }

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return null
  }

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return null
  }

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return false
  }

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (denialReason) {
      updateData.denial_reason = denialReason
    }

    const { error } = await supabaseAdmin.from("component_requests").update(updateData).eq("id", id)

    if (error) {
      console.error("Error updating request status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateRequestStatus:", error)
    return false
  }
}

export async function deleteRequest(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return false
  }

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
  // Generate a simple ID without database dependency
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")

  return `REQ-${today}-${timestamp}-${random}`
}

// Simplified user management - no database required for basic functionality
export async function getOrCreateUser(
  email: string,
  name: string,
  role: User["role"] = "Requester",
): Promise<User | null> {
  // For the simplified version, we'll just return a mock user object
  // In a real application, you might still want to store this in the database
  return {
    id: `user_${Date.now()}`,
    email,
    name,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return getOrCreateUser(email, email.split("@")[0], "Requester")
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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return null
  }

  try {
    const keyHash = hashApiKey(apiKey)

    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select(`
        user_id,
        users!inner(
          id,
          email,
          name,
          role
        )
      `)
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      console.error("API key validation failed:", error)
      return null
    }

    await supabaseAdmin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", keyHash)

    const user = data.users as any
    return {
      user_id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } catch (error) {
    console.error("Error validating API key:", error)
    return null
  }
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return []
  }

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return false
  }

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    }
  }

  try {
    const { data: requests, error } = await supabaseAdmin.from("component_requests").select("status")

    if (error) {
      console.error("Error fetching requests for stats:", error)
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
