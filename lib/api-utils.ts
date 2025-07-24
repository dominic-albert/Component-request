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
    // Direct update instead of RPC to avoid JSON parsing issues
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
  // Always generate a fallback ID to avoid dependency on RPC functions
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const fallbackId = `REQ-${timestamp}-${random}`

  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, using fallback ID")
    return fallbackId
  }

  try {
    // Try to get existing requests to generate a proper sequential ID
    const { data, error } = await supabaseAdmin
      .from("component_requests")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching last request, using fallback ID:", error)
      return fallbackId
    }

    // Generate sequential ID based on existing requests
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const { data: todayRequests } = await supabaseAdmin
      .from("component_requests")
      .select("id")
      .like("id", `REQ-${today}-%`)

    const nextNumber = (todayRequests?.length || 0) + 1
    return `REQ-${today}-${nextNumber.toString().padStart(4, "0")}`
  } catch (error) {
    console.error("Error generating request ID, using fallback:", error)
    return fallbackId
  }
}

// User management functions with direct table operations instead of RPC
export async function getOrCreateUser(
  email: string,
  name: string,
  role: User["role"] = "Requester",
): Promise<User | null> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return null
  }

  try {
    console.log("Attempting to get or create user:", { email, name, role })

    // First try to get existing user
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (existingUser && !getUserError) {
      console.log("Found existing user:", existingUser)
      return existingUser
    }

    console.log("User not found, creating new user")

    // If user doesn't exist, create new one
    const newUser = {
      email,
      name: name || email.split("@")[0],
      role,
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

    console.log("Successfully created user:", createdUser)
    return createdUser
  } catch (error) {
    console.error("Error in getOrCreateUser:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return null
  }

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return null
  }

  try {
    const keyHash = hashApiKey(apiKey)

    // Direct table join instead of RPC
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

    // Update last_used_at
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

// Statistics functions with direct table queries
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
    // Direct query instead of RPC
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
