import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Debug function to test Supabase connection
export async function debugSupabaseConnection() {
  console.log("=== SUPABASE DEBUG INFO ===")
  console.log("Environment Variables:")
  console.log("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
  console.log("- SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓ Set" : "✗ Missing")

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("❌ Supabase not configured - missing environment variables")
    return { success: false, error: "Missing environment variables" }
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Testing connection...")

    // Test basic connection
    const { data, error } = await client.from("component_requests").select("count", { count: "exact", head: true })

    if (error) {
      console.log("❌ Database connection failed:")
      console.log("Error code:", error.code)
      console.log("Error message:", error.message)
      console.log("Error details:", error.details)
      console.log("Error hint:", error.hint)
      return { success: false, error: error.message }
    }

    console.log("✅ Database connection successful")
    console.log("Table exists and accessible")
    return { success: true, count: data }
  } catch (error) {
    console.log("❌ Unexpected error testing connection:")
    console.log(error)
    return { success: false, error: String(error) }
  }
}

// Create admin client for server-side operations
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

// Log configuration status (server-side only)
if (typeof window === "undefined") {
  console.log("Supabase configuration:", {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    isConfigured: !!(supabaseUrl && supabaseServiceKey),
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "Not set",
  })
}
