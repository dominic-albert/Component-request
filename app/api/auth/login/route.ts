import { type NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called")

    const body = await request.json()
    console.log("Request body:", body)

    const { email, role } = body

    if (!email) {
      console.log("Email missing from request")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Attempting to get or create user:", { email, role })

    // Extract name from email for user creation
    const name = email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase())

    const user = await getOrCreateUser(email, name, role || "Requester")

    if (!user) {
      console.log("Failed to get or create user")
      return NextResponse.json({ error: "Failed to authenticate user" }, { status: 500 })
    }

    console.log("Successfully authenticated user:", user)

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error during login",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
