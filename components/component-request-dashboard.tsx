"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle, XCircle, AlertCircle, Plus, Eye, Edit } from "lucide-react"

// Mock data - replace with Firebase integration
const mockRequests = [
  {
    id: "1",
    requestName: "SocialProfileCard",
    justification:
      "This card will be reused across the user dashboard and public profile pages. It has several states: default, hover, and loading.",
    requesterId: "designer_user_123",
    requesterName: "Sarah Chen",
    status: "Pending",
    denialReason: "",
    requestedAt: "2024-10-26T10:00:00Z",
    updatedAt: "2024-10-26T10:00:00Z",
    frameData: {
      fileId: "figma_file_abc",
      nodeId: "1:23",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
    },
  },
  {
    id: "2",
    requestName: "PrimaryButton-WithIcon",
    justification:
      "Need a primary button variant that includes an icon for call-to-action sections. Current button component doesn't support icons.",
    requesterId: "designer_user_456",
    requesterName: "Mike Rodriguez",
    status: "InProgress",
    denialReason: "",
    requestedAt: "2024-10-25T14:30:00Z",
    updatedAt: "2024-10-26T09:15:00Z",
    frameData: {
      fileId: "figma_file_def",
      nodeId: "2:45",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
    },
  },
  {
    id: "3",
    requestName: "DataVisualizationChart",
    justification:
      "Complex chart component for analytics dashboard. Needs to support multiple chart types and interactive features.",
    requesterId: "designer_user_789",
    requesterName: "Emma Thompson",
    status: "Done",
    denialReason: "",
    requestedAt: "2024-10-20T11:00:00Z",
    updatedAt: "2024-10-25T16:45:00Z",
    frameData: {
      fileId: "figma_file_ghi",
      nodeId: "3:67",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
    },
  },
  {
    id: "4",
    requestName: "CustomTooltip",
    justification: "Need a custom tooltip that matches our design system. Current tooltip is too basic.",
    requesterId: "designer_user_101",
    requesterName: "Alex Kim",
    status: "Denied",
    denialReason:
      "This functionality already exists in the 'InfoPopover' component. Please use that instead and refer to the design system documentation.",
    requestedAt: "2024-10-24T09:20:00Z",
    updatedAt: "2024-10-25T10:30:00Z",
    frameData: {
      fileId: "figma_file_jkl",
      nodeId: "4:89",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
    },
  },
]

type ComponentRequest = (typeof mockRequests)[0] & {
  severity?: string
  requesterEmail?: string
}

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200",
  Done: "bg-green-100 text-green-800 border-green-200",
  Denied: "bg-red-100 text-red-800 border-red-200",
}

const statusIcons = {
  Pending: AlertCircle,
  InProgress: Clock,
  Done: CheckCircle,
  Denied: XCircle,
}

export function ComponentRequestDashboard() {
  const [requests, setRequests] = useState<ComponentRequest[]>(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<ComponentRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState("")
  const [denialReason, setDenialReason] = useState("")
  const [isManualRequestOpen, setIsManualRequestOpen] = useState(false)
  const [manualRequestForm, setManualRequestForm] = useState({
    requestName: "",
    justification: "",
    severity: "Medium",
    requesterName: "",
    requesterEmail: "",
  })

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesSearch =
      request.requestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleStatusUpdate = () => {
    if (!selectedRequest) return

    const updatedRequests = requests.map((request) => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: updateStatus,
          denialReason: updateStatus === "Denied" ? denialReason : "",
          updatedAt: new Date().toISOString(),
        }
      }
      return request
    })

    setRequests(updatedRequests)
    setIsUpdateDialogOpen(false)
    setSelectedRequest(null)
    setUpdateStatus("")
    setDenialReason("")
  }

  const getStatusCounts = () => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      inProgress: requests.filter((r) => r.status === "InProgress").length,
      done: requests.filter((r) => r.status === "Done").length,
      denied: requests.filter((r) => r.status === "Denied").length,
    }
  }

  const statusCounts = getStatusCounts()

  const handleManualRequestSubmit = () => {
    const newRequest: ComponentRequest = {
      id: (requests.length + 1).toString(),
      requestName: manualRequestForm.requestName,
      justification: manualRequestForm.justification,
      requesterId: `manual_${Date.now()}`,
      requesterName: manualRequestForm.requesterName,
      status: "Pending",
      denialReason: "",
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      frameData: {
        fileId: "",
        nodeId: "",
        thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Manual+Request",
      },
      severity: manualRequestForm.severity,
      requesterEmail: manualRequestForm.requesterEmail,
    }

    setRequests([newRequest, ...requests])
    setIsManualRequestOpen(false)
    setManualRequestForm({
      requestName: "",
      justification: "",
      severity: "Medium",
      requesterName: "",
      requesterEmail: "",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Component Request Dashboard</h1>
          <p className="text-muted-foreground">Manage and track component requests from your design team</p>
        </div>
        <Button onClick={() => setIsManualRequestOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Manual Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.done}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.denied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Component Requests</CardTitle>
          <CardDescription>Review and manage component requests from your design team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by component name or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="Denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component Name</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const StatusIcon = statusIcons[request.status as keyof typeof statusIcons]
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.requestName}</TableCell>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[request.status as keyof typeof statusColors]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.severity && (
                          <Badge
                            variant="outline"
                            className={
                              request.severity === "Critical"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : request.severity === "High"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : request.severity === "Medium"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                            }
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-1 ${
                                request.severity === "Critical"
                                  ? "bg-red-500"
                                  : request.severity === "High"
                                    ? "bg-orange-500"
                                    : request.severity === "Medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }`}
                            ></div>
                            {request.severity}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(request.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{request.requestName}</DialogTitle>
                                <DialogDescription>
                                  Requested by {request.requesterName} on{" "}
                                  {new Date(request.requestedAt).toLocaleDateString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="mt-1">
                                    <Badge
                                      variant="outline"
                                      className={statusColors[request.status as keyof typeof statusColors]}
                                    >
                                      <StatusIcon className="mr-1 h-3 w-3" />
                                      {request.status}
                                    </Badge>
                                  </div>
                                </div>
                                {request.severity && (
                                  <div>
                                    <Label className="text-sm font-medium">Priority</Label>
                                    <div className="mt-1">
                                      <Badge
                                        variant="outline"
                                        className={
                                          request.severity === "Critical"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : request.severity === "High"
                                              ? "bg-orange-50 text-orange-700 border-orange-200"
                                              : request.severity === "Medium"
                                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                : "bg-green-50 text-green-700 border-green-200"
                                        }
                                      >
                                        <div
                                          className={`w-2 h-2 rounded-full mr-1 ${
                                            request.severity === "Critical"
                                              ? "bg-red-500"
                                              : request.severity === "High"
                                                ? "bg-orange-500"
                                                : request.severity === "Medium"
                                                  ? "bg-yellow-500"
                                                  : "bg-green-500"
                                          }`}
                                        ></div>
                                        {request.severity}
                                      </Badge>
                                    </div>
                                  </div>
                                )}
                                {request.requesterEmail && (
                                  <div>
                                    <Label className="text-sm font-medium">Requester Email</Label>
                                    <p className="mt-1 text-sm text-muted-foreground">{request.requesterEmail}</p>
                                  </div>
                                )}
                                <div>
                                  <Label className="text-sm font-medium">Justification</Label>
                                  <p className="mt-1 text-sm text-muted-foreground">{request.justification}</p>
                                </div>
                                {request.status === "Denied" && request.denialReason && (
                                  <div>
                                    <Label className="text-sm font-medium">Denial Reason</Label>
                                    <p className="mt-1 text-sm text-red-600">{request.denialReason}</p>
                                  </div>
                                )}
                                {request.frameData?.thumbnailUrl && (
                                  <div>
                                    <Label className="text-sm font-medium">Design Preview</Label>
                                    <div className="mt-2">
                                      <img
                                        src={request.frameData.thumbnailUrl || "/placeholder.svg"}
                                        alt={`Preview of ${request.requestName}`}
                                        className="rounded-lg border max-w-full h-auto"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setUpdateStatus(request.status)
                              setDenialReason(request.denialReason)
                              setIsUpdateDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>Update the status of "{selectedRequest?.requestName}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {updateStatus === "Denied" && (
              <div>
                <Label htmlFor="denial-reason">Denial Reason</Label>
                <Textarea
                  id="denial-reason"
                  placeholder="Please provide a reason for denying this request..."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Request Dialog */}
      <Dialog open={isManualRequestOpen} onOpenChange={setIsManualRequestOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Manual Component Request</DialogTitle>
            <DialogDescription>
              Create a component request manually on behalf of a designer or for internal development needs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requester-name">Requester Name *</Label>
                <Input
                  id="requester-name"
                  placeholder="e.g., Sarah Chen"
                  value={manualRequestForm.requesterName}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, requesterName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="requester-email">Requester Email</Label>
                <Input
                  id="requester-email"
                  type="email"
                  placeholder="sarah.chen@company.com"
                  value={manualRequestForm.requesterEmail}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, requesterEmail: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="component-name">Component Name *</Label>
              <Input
                id="component-name"
                placeholder="e.g., SocialProfileCard, PrimaryButton-WithIcon"
                value={manualRequestForm.requestName}
                onChange={(e) => setManualRequestForm({ ...manualRequestForm, requestName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="severity">Priority/Severity</Label>
              <Select
                value={manualRequestForm.severity}
                onValueChange={(value) => setManualRequestForm({ ...manualRequestForm, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Low - Nice to have
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Medium - Important for workflow
                    </div>
                  </SelectItem>
                  <SelectItem value="High">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      High - Blocking current work
                    </div>
                  </SelectItem>
                  <SelectItem value="Critical">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Critical - Production issue
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="justification">Why is this component needed? *</Label>
              <Textarea
                id="justification"
                placeholder="Explain the need for this component, where it will be used, what problem it solves, and any specific requirements or states it should have..."
                value={manualRequestForm.justification}
                onChange={(e) => setManualRequestForm({ ...manualRequestForm, justification: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">💡 Tips for a good request:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be specific about where the component will be used</li>
                <li>• Mention any different states (hover, loading, disabled, etc.)</li>
                <li>• Include any accessibility requirements</li>
                <li>• Reference existing components if this extends or replaces them</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualRequestOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualRequestSubmit}
              disabled={
                !manualRequestForm.requestName || !manualRequestForm.justification || !manualRequestForm.requesterName
              }
            >
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
