import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { validateApiKey, generateNextRequestId, createUser } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from("component_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    // Validate API key if provided
    let userId = null
    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.substring(7)
      const user = await validateApiKey(apiKey)
      if (user) {
        userId = user.user_id
      }
    }

    // Generate next request ID
    const requestId = await generateNextRequestId()

    // Create or get user if email is provided
    if (body.requesterEmail && !userId) {
      userId = await createUser(body.requesterEmail, body.requesterName)
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

    const { data, error } = await supabaseAdmin.from("component_requests").insert(requestData).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
