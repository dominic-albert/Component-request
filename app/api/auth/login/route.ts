import { type NextRequest, NextResponse } from "next/server"

// Simple login endpoint that just validates the request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // For the simplified version, we just return success
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: `user_${Date.now()}`,
        email,
        name,
        role: role || "Requester",
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
