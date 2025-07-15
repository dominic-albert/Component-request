import { type NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // In a real application, you'd use Supabase Auth's signInWithOtp or similar.
    // For this example, we're simulating a login by getting/creating a user.
    const user = await getOrCreateUser(email, email.split("@")[0], "Requester") // Default role

    if (!user) {
      return NextResponse.json({ error: "Failed to authenticate user" }, { status: 500 })
    }

    // In a real app, you'd return a session token or similar.
    // For this example, we return basic user info.
    return NextResponse.json({
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
        id: user.id,
      },
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Internal server error during login" }, { status: 500 })
  }
}
