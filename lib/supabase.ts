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

  // --- a tiny “builder” that supports .select().order() chains ------------
  const builder: any = {
    select() {
      return builder
    },
    order() {
      return builder
    },
    insert() {
      return {
        select: () => Promise.resolve({ data: null, error: null }),
      }
    },
    delete() {
      return Promise.resolve(okResult)
    },
    update() {
      return builder
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
    rpc() {
      return Promise.resolve({ data: null, error: null })
    },
  }
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
