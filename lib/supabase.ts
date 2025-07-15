import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * When the necessary Supabase env-vars are present we create real clients.
 * Otherwise we return a tiny mock so local preview / Storybook doesn’t crash.
 */

/* -------------------------------------------------------------------------- */
/*                               Helper Types                                 */
/* -------------------------------------------------------------------------- */

type MockQuery<T = any> = {
  select: () => Promise<{ data: T[]; error: null }>
  insert: () => Promise<{ data: T | null; error: null }>
  order: () => MockQuery<T>
}

type MockClient = {
  from: <T = any>() => MockQuery<T>
  rpc: () => Promise<{ data: null; error: Error }>
}

/* -------------------------------------------------------------------------- */
/*                             Mock Client Factory                            */
/* -------------------------------------------------------------------------- */

function createMockClient(): MockClient {
  const ok = async <T = any>(d: T) => ({ data: d, error: null })

  const query: MockQuery = {
    select: () => ok([]),
    insert: () => ok(null),
    order: () => query,
  }

  return {
    from: () => query,
    rpc: async () => ({ data: null, error: new Error("Supabase not configured") }),
  }
}

/* -------------------------------------------------------------------------- */
/*                              Real or Mock?                                 */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: SupabaseClient | MockClient
let supabaseAdmin: SupabaseClient | MockClient

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Using mock client so the app can still render.",
  )
  supabase = createMockClient()
}

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
} else {
  // Service-role key isn’t available in browser previews, that’s fine.
  supabaseAdmin = createMockClient()
}

export { supabase, supabaseAdmin }
