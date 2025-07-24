import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Log environment variable status
console.log("Supabase Environment Check:", {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing required Supabase environment variables")
}

// Client for browser/client-side operations
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Admin client for server-side operations
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

// Types
export interface User {
  id: string
  email: string
  name: string
  role: "Requester" | "Creator"
  created_at: string
  updated_at: string
}

export interface ComponentRequest {
  id: string
  title: string
  description: string
  priority: "Low" | "Medium" | "High"
  status: "Pending" | "In Progress" | "Completed" | "Cancelled"
  requester_id: string
  creator_id?: string
  denial_reason?: string
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  key_hash: string
  name: string
  is_active: boolean
  created_at: string
  last_used_at?: string
}
