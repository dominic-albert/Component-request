import { type NextRequest, NextResponse } from "next/server"
import { getRequestById, updateRequestStatus, deleteRequest } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const requestData = await getRequestById(id)

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json(requestData)
  } catch (error) {
    console.error(`Error fetching request ${id}:`, error)
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { status, denial_reason } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const success = await updateRequestStatus(id, status, denial_reason)

    if (!success) {
      return NextResponse.json({ error: "Failed to update request status" }, { status: 500 })
    }

    // Fetch the updated request to return the latest state
    const updatedRequest = await getRequestById(id)
    if (!updatedRequest) {
      return NextResponse.json({ error: "Updated request not found" }, { status: 404 })
    }

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error(`Error updating request ${id}:`, error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const success = await deleteRequest(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
    }

    return NextResponse.json({ message: "Request deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error(`Error deleting request ${id}:`, error)
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
