import { supabaseAdmin } from "./supabase"
import type { ComponentRequest, User, ApiKey } from "./supabase"
import crypto from "crypto"

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

export async function createRequest(
  requestData: Omit<ComponentRequest, "id" | "created_at" | "updated_at">,
): Promise<string | null> {
  const { data, error } = await supabaseAdmin.rpc("create_component_request", {
    p_request_name: requestData.request_name,
    p_justification: requestData.justification,
    p_requester_name: requestData.requester_name,
    p_requester_email: requestData.requester_email,
    p_category: requestData.category,
    p_severity: requestData.severity,
    p_project: requestData.project,
    p_figma_link: requestData.figma_link,
    p_source: requestData.source,
  })

  if (error) {
    console.error("Error creating request:", error)
    return null
  }

  return data
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

// User management functions
export async function getOrCreateUser(
  email: string,
  name: string,
  role: User["role"] = "Requester",
): Promise<User | null> {
  const { data, error } = await supabaseAdmin.rpc("get_or_create_user", {
    p_email: email,
    p_name: name,
    p_role: role,
  })

  if (error) {
    console.error("Error getting/creating user:", error)
    return null
  }

  // Fetch the complete user record
  const { data: userData, error: userError } = await supabaseAdmin.from("users").select("*").eq("id", data).single()

  if (userError) {
    console.error("Error fetching user data:", userError)
    return null
  }

  return userData
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

// API Key management functions
export async function generateApiKey(userId: string, name: string): Promise<{ key: string; keyData: ApiKey } | null> {
  // Generate a random API key
  const apiKey = `crs_${crypto.randomBytes(32).toString("hex")}`
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
  const keyPrefix = apiKey.substring(0, 8)

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .insert({
      user_id: userId,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: name,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating API key:", error)
    return null
  }

  return {
    key: apiKey,
    keyData: data,
  }
}

export async function validateApiKey(apiKey: string): Promise<User | null> {
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select(`
      *,
      users (*)
    `)
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return null
  }

  // Update last_used_at
  await supabaseAdmin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id)

  return data.users as User
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
