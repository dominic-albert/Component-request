import { createClient } from "@supabase/supabase-js"

// Check if we have all required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a proper mock client that matches Supabase's API
function createMockClient() {
  const mockResult = { data: [], error: null }
  const mockSingleResult = { data: null, error: null }

  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve(mockSingleResult),
      }),
    }),
    update: () => mockQueryBuilder,
    delete: () => Promise.resolve(mockResult),
    eq: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    single: () => Promise.resolve(mockSingleResult),
    then: (resolve: any) => Promise.resolve(mockResult).then(resolve),
  }

  return {
    from: () => mockQueryBuilder,
    rpc: () => Promise.resolve(mockSingleResult),
  }
}

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase environment variables missing. Using mock client.")
}

if (!supabaseServiceKey) {
  console.warn("⚠️ Supabase service role key missing. API routes will use mock client.")
}

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
  denial_reason?: string
  category: "Form" | "Navigation" | "Display" | "Input" | "Layout"
  severity: "Low" | "Medium" | "High" | "Urgent"
  project: string
  figma_link?: string
  figma_file_key?: string
  figma_file_name?: string
  figma_node_id?: string
  image_data?: string
  selection_data?: any
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
  expires_at?: string
  is_active: boolean
}
