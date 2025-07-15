import { createClient } from "@supabase/supabase-js"

// Check if we have all required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a mock client for development when env vars are missing
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
  }),
  rpc: () => Promise.resolve({ data: null, error: null }),
})

// Client-side Supabase client (for browser)
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createMockClient()

// Server-side Supabase client with service role (for API routes)
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : createMockClient()

// Type definitions
export interface User {
  id: string
  email: string
  name: string
  role: "Admin" | "Creator" | "Requester"
  created_at: string
  updated_at: string
}

export interface ComponentRequest {
  id: string
  request_name: string
  justification: string
  requester_id?: string
  requester_name: string
  requester_email: string
  status: "Pending" | "In Progress" | "Completed" | "Cancelled"
  category?: string
  severity: "Low" | "Medium" | "High" | "Urgent"
  project?: string
  figma_link?: string
  source: "manual" | "figma-plugin"
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  key_hash: string
  key_prefix: string
  name: string
  created_at: string
  last_used_at?: string
  is_active: boolean
}
