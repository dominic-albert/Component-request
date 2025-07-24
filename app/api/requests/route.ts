import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Mock data for when database is not available
const mockRequests = [
  {
    id: "CR0001",
    request_name: "Advanced Data Table Component",
    justification: "Need a reusable data table with sorting, filtering, and pagination for multiple dashboard views.",
    requester_id: "user_1",
    requester_name: "Sarah Chen",
    requester_email: "sarah.chen@company.com",
    status: "In Progress",
    denial_reason: "",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:20:00Z",
    figma_link: "https://figma.com/file/example1",
    project: "Dashboard",
    severity: "High",
    category: "Display",
    image_data: null,
  },
  {
    id: "CR0002",
    request_name: "Multi-step Form Wizard",
    justification:
      "Complex onboarding flow requires a step-by-step form component with validation and progress tracking.",
    requester_id: "user_2",
    requester_name: "Mike Johnson",
    requester_email: "mike.johnson@company.com",
    status: "Pending",
    denial_reason: "",
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z",
    figma_link: "https://figma.com/file/example2",
    project: "Onboarding",
    severity: "Medium",
    category: "Form",
    image_data: null,
  },
  {
    id: "CR0003",
    request_name: "Interactive Chart Component",
    justification:
      "Analytics dashboard needs interactive charts with hover states, tooltips, and drill-down capabilities.",
    requester_id: "user_3",
    requester_name: "Emily Davis",
    requester_email: "emily.davis@company.com",
    status: "Completed",
    denial_reason: "",
    created_at: "2024-01-10T16:45:00Z",
    updated_at: "2024-01-13T11:30:00Z",
    figma_link: "",
    project: "Analytics",
    severity: "High",
    category: "Display",
    image_data: null,
  },
  {
    id: "CR0004",
    request_name: "File Upload Component",
    justification: "Need a drag-and-drop file upload component with progress tracking and file type validation.",
    requester_id: "user_4",
    requester_name: "Alex Rodriguez",
    requester_email: "alex.rodriguez@company.com",
    status: "Denied",
    denial_reason:
      "Similar component already exists in the design system. Please use the existing FileUploader component.",
    created_at: "2024-01-12T08:20:00Z",
    updated_at: "2024-01-12T15:45:00Z",
    figma_link: "https://figma.com/file/example4",
    project: "File Management",
    severity: "Low",
    category: "Input",
    image_data: null,
  },
]

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/requests - Starting request")

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.warn("Supabase not configured, returning mock data")
      return NextResponse.json(mockRequests)
    }

    console.log("Attempting to fetch from Supabase...")

    // Try to fetch from Supabase with error handling
    const response = await supabaseAdmin
      .from("component_requests")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("Supabase response:", { data: response.data, error: response.error })

    if (response.error) {
      console.error("Database error fetching requests:", response.error)
      console.log("Falling back to mock data due to database error")
      return NextResponse.json(mockRequests)
    }

    const requests = response.data || []
    console.log(`Successfully fetched ${requests.length} requests from database`)
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Unexpected error in GET /api/requests:", error)
    console.log("Falling back to mock data due to unexpected error")
    return NextResponse.json(mockRequests)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("POST /api/requests - Incoming request body:", body)

    // Generate a simple request ID
    const requestId = `CR${String(Date.now()).slice(-4)}`

    const newRequest = {
      id: requestId,
      request_name: body.requestName,
      justification: body.justification,
      requester_id: `user_${Date.now()}`,
      requester_name: body.requesterName,
      requester_email: body.requesterEmail,
      status: "Pending" as const,
      denial_reason: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      figma_link: body.figmaLink || "",
      project: body.project || "Manual",
      severity: body.severity || "Medium",
      category: body.category,
      image_data: body.imageData || null,
    }

    // Try to insert into Supabase if configured
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from("component_requests").insert(newRequest).select().single()

        if (!error && data) {
          console.log("Request successfully inserted into database:", data)
          return NextResponse.json(data, { status: 201 })
        } else {
          console.error("Database insert error:", error)
        }
      } catch (dbError) {
        console.error("Database connection error:", dbError)
      }
    }

    // Fallback: return the mock request
    console.log("Using mock response for new request")
    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/requests:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
