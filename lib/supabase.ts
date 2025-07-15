import { createClient } from "@supabase/supabase-js"

// Check if we have all required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/* -------------------------------------------------------------------------- */
/*                             Mock Client Factory                            */
/* -------------------------------------------------------------------------- */

/**
 * A minimal, chain-able, await-able query builder that mimics the parts of the
 * Supabase JS API we use in our API routes. It always resolves to
 * `{ data: [], error: null }` so the app can render without a database.
 */
function createMockClient() {
  // --- the final result every query returns -------------------------------
  const okResult = { data: [] as any[], error: null }
  const okSingleResult = { data: null, error: null }

  // A simple counter for mock IDs
  let mockRequestIdCounter = 0

  // --- a tiny “builder” that supports .select().order() chains ------------
  const builder: any = {
    select() {
      return builder
    },
    insert() {
      // For insert, we need to return a chainable object that eventually resolves to a single result
      return {
        select: () => ({
          single: () => Promise.resolve(okSingleResult),
        }),
      }
    },
    update() {
      return builder
    },
    delete() {
      return Promise.resolve(okResult)
    },
    eq() {
      return builder
    },
    order() {
      return builder
    },
    single() {
      return Promise.resolve(okSingleResult)
    },
    // await supabase.from(...).select(...) ➜ we need to be then-able
    then(onFulfilled: (v: typeof okResult) => any) {
      return Promise.resolve(okResult).then(onFulfilled)
    },
  }

  return {
    from() {
      return builder
    },
    rpc: (functionName: string, args: any) => {
      if (functionName === "generate_next_request_id") {
        mockRequestIdCounter++
        const mockId = `CR${mockRequestIdCounter.toString().padStart(4, "0")}`
        return Promise.resolve({ data: mockId, error: null })
      }
      if (functionName === "create_or_get_user") {
        // Return a consistent mock UUID for user creation
        return Promise.resolve({ data: "00000000-0000-0000-0000-000000000001", error: null })
      }
      // For other RPCs, return default mock single result
      return Promise.resolve(okSingleResult)
    },
  }
}

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase environment variables missing. Using mock client for browser.")
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
