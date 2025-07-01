import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Types
export interface User {
  id: string
  email: string
  name?: string
  role: "Requester" | "Creator" | "Admin"
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
  status: "Pending" | "In Progress" | "Completed" | "Denied"
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
  name?: string
  last_used_at?: string
  created_at: string
  expires_at?: string
  is_active: boolean
}
