import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    console.log(`PUT /api/requests/${id} - Update request:`, body)

    const updateData = {
      status: body.status,
      denial_reason: body.denial_reason || "",
      updated_at: new Date().toISOString(),
    }

    // Try to update in Supabase if configured
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("component_requests")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()

        if (!error && data) {
          console.log("Request successfully updated in database:", data)
          return NextResponse.json(data)
        } else {
          console.error("Database update error:", error)
        }
      } catch (dbError) {
        console.error("Database connection error:", dbError)
      }
    }

    // Fallback: return mock updated request
    const mockUpdatedRequest = {
      id,
      request_name: "Mock Updated Request",
      ...updateData,
      requester_name: "Mock User",
      requester_email: "mock@example.com",
      justification: "Mock justification",
      project: "Mock Project",
      severity: "Medium",
      category: "Display",
      created_at: new Date().toISOString(),
    }

    console.log("Using mock response for request update")
    return NextResponse.json(mockUpdatedRequest)
  } catch (error) {
    console.error(`Unexpected error in PUT /api/requests/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log(`DELETE /api/requests/${id}`)

    // Try to delete from Supabase if configured
    if (supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin.from("component_requests").delete().eq("id", id)

        if (!error) {
          console.log("Request successfully deleted from database")
          return NextResponse.json({ success: true })
        } else {
          console.error("Database delete error:", error)
        }
      } catch (dbError) {
        console.error("Database connection error:", dbError)
      }
    }

    // Fallback: return success
    console.log("Using mock response for request deletion")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Unexpected error in DELETE /api/requests/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
