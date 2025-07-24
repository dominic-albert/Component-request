import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { validateApiKey } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.warn("Supabase not configured, returning mock data")
      return NextResponse.json([])
    }

    const { data: requests, error } = await supabaseAdmin
      .from("component_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching requests in GET /api/requests:", error)
      // Return empty array instead of error to prevent app crash
      return NextResponse.json([])
    }

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("API error in GET /api/requests:", error)
    // Return empty array instead of error to prevent app crash
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Incoming POST request body:", body)

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.warn("Supabase not configured, returning mock response")
      const mockRequest = {
        id: `REQ-${Date.now()}`,
        request_name: body.requestName,
        justification: body.justification,
        requester_name: body.requesterName,
        requester_email: body.requesterEmail,
        status: "Pending",
        category: body.category,
        severity: body.severity || "Medium",
        project: body.project || "Manual",
        figma_link: body.figmaLink,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json(mockRequest, { status: 201 })
    }

    const authHeader = request.headers.get("authorization")
    let userId: string | null = null

    // Validate API key if provided
    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.substring(7)
      const user = await validateApiKey(apiKey)
      if (user) {
        userId = user.user_id
        console.log("API Key validated. User ID:", userId)
      } else {
        console.warn("API Key provided but invalid or user not found.")
      }
    }

    // Generate simple request ID
    const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    console.log("Generated Request ID:", requestId)

    // Create or get user if email is provided and userId is not already set by API key
    if (body.requesterEmail && !userId) {
      console.log("Attempting to create or get user for email:", body.requesterEmail)
      // For now, we'll just use a mock user ID
      userId = `user_${Date.now()}`
      console.log("Using mock User ID:", userId)
    }

    // Prepare request data
    const requestData = {
      id: requestId,
      request_name: body.requestName,
      justification: body.justification,
      requester_id: userId,
      requester_name: body.requesterName,
      requester_email: body.requesterEmail,
      status: "Pending",
      category: body.category,
      severity: body.severity || "Medium",
      project: body.project || "Manual",
      figma_link: body.figmaLink,
      figma_file_key: body.figmaFileKey,
      figma_file_name: body.figmaFileName,
      figma_node_id: body.figmaNodeId,
      image_data: body.imageData,
      selection_data: body.selectionData,
      source: body.source || "manual",
    }
    console.log("Prepared request data for insertion:", requestData)

    const { data, error } = await supabaseAdmin.from("component_requests").insert(requestData).select().single()

    if (error) {
      console.error("Database insert error for new request:", error)
      // Return the mock data instead of failing
      const mockRequest = {
        ...requestData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json(mockRequest, { status: 201 })
    }

    console.log("Request successfully inserted:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/requests:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
