import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { validateApiKey } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from("component_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching requests:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("API error in GET /api/requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    let userId: string | null = null
    // Validate API key if provided
    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.substring(7)
      const user = await validateApiKey(apiKey)
      if (user) {
        userId = user.user_id
      }
    }

    // Generate next request ID
    const { data: requestId, error: idError } = await supabaseAdmin.rpc("generate_next_request_id")
    if (idError) {
      console.error("Error generating request ID via RPC:", idError)
      return NextResponse.json({ error: "Failed to generate request ID" }, { status: 500 })
    }
    if (!requestId) {
      console.error("Generated request ID is null or undefined.")
      return NextResponse.json({ error: "Failed to generate request ID: ID is null" }, { status: 500 })
    }

    // Create or get user if email is provided and userId is not already set by API key
    if (body.requesterEmail && !userId) {
      const { data: newUserId, error: userError } = await supabaseAdmin.rpc("create_or_get_user", {
        p_email: body.requesterEmail,
        p_name: body.requesterName,
        p_role: "Requester",
      })

      if (userError) {
        console.error("Error creating or getting user via RPC:", userError)
        // Decide if you want to fail the request here or proceed without a linked user_id
        // For now, we'll proceed, but requester_id will be null.
      } else {
        userId = newUserId
      }
    }

    // Prepare request data
    const requestData = {
      id: requestId,
      request_name: body.requestName,
      justification: body.justification,
      requester_id: userId, // This can be null if user creation failed or no API key
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

    const { data, error } = await supabaseAdmin.from("component_requests").insert(requestData).select().single()

    if (error) {
      console.error("Database insert error for new request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/requests:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
