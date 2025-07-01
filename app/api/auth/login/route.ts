import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Extract name from email
    const name = email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase())

    const userId = await createUser(email, name, role || "Requester")

    return NextResponse.json({
      success: true,
      user: { id: userId, email, name, role: role || "Requester" },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
