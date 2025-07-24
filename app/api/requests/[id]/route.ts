import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    console.log(`PUT /api/requests/${id} - updating request:`, body)

    // In a real app, this would update the database
    // For now, just return success response
    const updatedRequest = {
      id,
      status: body.status,
      denial_reason: body.denial_reason || "",
      updated_at: new Date().toISOString(),
    }

    console.log("Request updated successfully:", updatedRequest)
    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error(`Error updating request ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log(`DELETE /api/requests/${id} - deleting request`)

    // In a real app, this would delete from database
    // For now, just return success response
    console.log("Request deleted successfully:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting request ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
