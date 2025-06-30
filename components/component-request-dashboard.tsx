"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle, XCircle, AlertCircle, Plus, Eye, LogOut, User, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserInfo {
  email: string
  role: string
}

interface ComponentRequestDashboardProps {
  user: UserInfo
  onLogout: () => void
}

// Mock data - replace with Firebase integration
const mockRequests = [
  {
    id: "1",
    requestName: "SocialProfileCard",
    justification:
      "This card will be reused across the user dashboard and public profile pages. It has several states: default, hover, and loading.",
    requesterId: "designer_user_123",
    requesterName: "Sarah Chen",
    requesterEmail: "sarah.chen@company.com",
    status: "Pending",
    denialReason: "",
    requestedAt: "2024-10-26T10:00:00Z",
    updatedAt: "2024-10-26T10:00:00Z",
    frameData: {
      fileId: "figma_file_abc",
      nodeId: "1:23",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
    },
    project: "CATT",
    severity: "Medium",
    figmaLink: "https://figma.com/file/abc123/social-profile-card",
  },
  {
    id: "2",
    requestName: "PrimaryButton-WithIcon",
    justification:
      "Need a primary button variant that includes an icon for call-to-action sections. Current button component doesn't support icons.",
    requesterId: "designer_user_456",
    requesterName: "Mike Rodriguez",
    requesterEmail: "mike.rodriguez@company.com",
    status: "InProgress",
    denialReason: "",
    requestedAt: "2024-10-25T14:30:00Z",
    updatedAt: "2024-10-26T09:15:00Z",
    frameData: {
      fileId: "figma_file_def",
      nodeId: "2:45",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
    },
    project: "PTP",
    severity: "High",
    figmaLink: "https://figma.com/file/def456/primary-button-icon",
  },
  {
    id: "3",
    requestName: "DataVisualizationChart",
    justification:
      "Complex chart component for analytics dashboard. Needs to support multiple chart types and interactive features.",
    requesterId: "designer_user_789",
    requesterName: "Emma Thompson",
    requesterEmail: "emma.thompson@company.com",
    status: "Done",
    denialReason: "",
    requestedAt: "2024-10-20T11:00:00Z",
    updatedAt: "2024-10-25T16:45:00Z",
    frameData: {
      fileId: "figma_file_ghi",
      nodeId: "3:67",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
    },
    project: "FX",
    severity: "Low",
    figmaLink: "",
  },
  {
    id: "4",
    requestName: "CustomTooltip",
    justification: "Need a custom tooltip that matches our design system. Current tooltip is too basic.",
    requesterId: "designer_user_101",
    requesterName: "Alex Kim",
    requesterEmail: "alex.kim@company.com",
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
    project: "Reference data",
    severity: "Critical",
    figmaLink: "",
  },
]

type ComponentRequest = (typeof mockRequests)[0]

const statusColors = {
  Pending: "bg-orange-50 text-orange-700 border-orange-200",
  InProgress: "bg-blue-50 text-blue-700 border-blue-200",
  Done: "bg-green-50 text-green-700 border-green-200",
  Denied: "bg-red-50 text-red-700 border-red-200",
}

const statusIcons = {
  Pending: AlertCircle,
  InProgress: Clock,
  Done: CheckCircle,
  Denied: XCircle,
}

export function ComponentRequestDashboard({ user, onLogout }: ComponentRequestDashboardProps) {
  const [requests, setRequests] = useState<ComponentRequest[]>(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<ComponentRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState("")
  const [denialReason, setDenialReason] = useState("")
  const [isManualRequestOpen, setIsManualRequestOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [manualRequestForm, setManualRequestForm] = useState({
    requestName: "",
    justification: "",
    severity: "Medium",
    requesterEmail: user.email,
    project: "",
    figmaLink: "",
  })

  // Extract name from email for display
  const getUserName = (email: string) => {
    return email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesProject = projectFilter === "all" || request.project === projectFilter
    const matchesSearch =
      request.requestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesProject && matchesSearch
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
      requesterName: getUserName(user.email),
      requesterEmail: manualRequestForm.requesterEmail,
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
      project: manualRequestForm.project,
      figmaLink: manualRequestForm.figmaLink,
    }

    setRequests([newRequest, ...requests])
    setIsManualRequestOpen(false)
    setManualRequestForm({
      requestName: "",
      justification: "",
      severity: "Medium",
      requesterEmail: user.email,
      project: "",
      figmaLink: "",
    })
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Google Sans, Roboto, Arial, sans-serif" }}>
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-normal text-gray-900">Component Request Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and track component requests from your design team</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsManualRequestOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create request
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm font-medium bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  {getUserName(user.email)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]"
              >
                <DropdownMenuLabel className="font-medium px-4 py-2 text-gray-900">Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="border-t border-gray-100" />
                <DropdownMenuItem disabled className="px-4 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{getUserName(user.email)}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                    <span className="text-xs text-gray-500">{user.role}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-t border-gray-100" />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Total requests</h3>
            </div>
            <div className="text-2xl font-normal text-gray-900">{statusCounts.total}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-normal text-gray-900">{statusCounts.pending}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">In progress</h3>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-normal text-gray-900">{statusCounts.inProgress}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Completed</h3>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-normal text-gray-900">{statusCounts.done}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Denied</h3>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-normal text-gray-900">{statusCounts.denied}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-normal text-gray-900">Component requests</h2>
            <p className="text-sm text-gray-600 mt-1">Review and manage component requests from your design team</p>
          </div>
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="InProgress">In progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Denied">Denied</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="all">All projects</SelectItem>
                  <SelectItem value="CATT">CATT</SelectItem>
                  <SelectItem value="PTP">PTP</SelectItem>
                  <SelectItem value="FX">FX</SelectItem>
                  <SelectItem value="Reference data">Reference data</SelectItem>
                  <SelectItem value="Credit risk">Credit risk</SelectItem>
                  <SelectItem value="Collateral">Collateral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requests Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component name
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requester
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const StatusIcon = statusIcons[request.status as keyof typeof statusIcons]
                    return (
                      <TableRow key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{request.requestName}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm text-gray-900">{request.requesterName}</div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit mt-1">
                              {request.project}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status as keyof typeof statusColors]}`}
                          >
                            <StatusIcon className="mr-1.5 h-3 w-3" />
                            {request.status === "InProgress" ? "In progress" : request.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          {request.severity && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.severity === "Critical"
                                  ? "bg-red-100 text-red-800"
                                  : request.severity === "High"
                                    ? "bg-orange-100 text-orange-800"
                                    : request.severity === "Medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                              }`}
                            >
                              {request.severity}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setUpdateStatus(request.status)
                              setDenialReason(request.denialReason)
                              setIsUpdateDialogOpen(true)
                            }}
                            className="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                          >
                            Update
                          </Button>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                              >
                                <svg
                                  width="4"
                                  height="16"
                                  viewBox="0 0 4 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                >
                                  <circle cx="2" cy="2" r="2" fill="currentColor" />
                                  <circle cx="2" cy="8" r="2" fill="currentColor" />
                                  <circle cx="2" cy="14" r="2" fill="currentColor" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]"
                            >
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 text-sm"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
                                  <DialogHeader className="px-6 py-4 border-b border-gray-200">
                                    <DialogTitle className="text-lg font-medium text-gray-900">
                                      {request.requestName}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-gray-600">
                                      Requested by {request.requesterName} on{" "}
                                      {new Date(request.requestedAt).toLocaleDateString()}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="px-6 py-4 space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                                      <div className="mt-1">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status as keyof typeof statusColors]}`}
                                        >
                                          <StatusIcon className="mr-1.5 h-3 w-3" />
                                          {request.status === "InProgress" ? "In progress" : request.status}
                                        </span>
                                      </div>
                                    </div>
                                    {request.severity && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Priority</Label>
                                        <div className="mt-1">
                                          <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              request.severity === "Critical"
                                                ? "bg-red-100 text-red-800"
                                                : request.severity === "High"
                                                  ? "bg-orange-100 text-orange-800"
                                                  : request.severity === "Medium"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                          >
                                            {request.severity}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {request.requesterEmail && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Requester email</Label>
                                        <p className="mt-1 text-sm text-gray-600">{request.requesterEmail}</p>
                                      </div>
                                    )}
                                    {request.project && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Project</Label>
                                        <div className="mt-1">
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {request.project}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {request.figmaLink && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Figma link</Label>
                                        <div className="mt-1">
                                          <a
                                            href={request.figmaLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                                          >
                                            {request.figmaLink}
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Justification</Label>
                                      <p className="mt-1 text-sm text-gray-600">{request.justification}</p>
                                    </div>
                                    {request.status === "Denied" && request.denialReason && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Denial reason</Label>
                                        <p className="mt-1 text-sm text-red-600">{request.denialReason}</p>
                                      </div>
                                    )}
                                    {request.frameData?.thumbnailUrl && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Design preview</Label>
                                        <div className="mt-2">
                                          <img
                                            src={request.frameData.thumbnailUrl || "/placeholder.svg"}
                                            alt={`Preview of ${request.requestName}`}
                                            className="rounded-lg border border-gray-200 max-w-full h-auto"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setSelectedRequest(request)
                                  setIsEditDialogOpen(true)
                                }}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 text-sm"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  const updatedRequests = requests.filter((r) => r.id !== request.id)
                                  setRequests(updatedRequests)
                                }}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-red-600 text-sm"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-white border border-gray-200 rounded-lg shadow-xl max-w-md">
            <DialogHeader className="px-6 py-4 border-b border-gray-200">
              <DialogTitle className="text-lg font-medium text-gray-900">Update request status</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Update the status of "{selectedRequest?.requestName}"
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="InProgress">In progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {updateStatus === "Denied" && (
                <div>
                  <Label htmlFor="denial-reason" className="text-sm font-medium text-gray-700">
                    Denial reason
                  </Label>
                  <Textarea
                    id="denial-reason"
                    placeholder="Please provide a reason for denying this request..."
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 min-h-[80px] resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
              >
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Request Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
            <DialogHeader className="px-6 py-4 border-b border-gray-200">
              <DialogTitle className="text-lg font-medium text-gray-900">Edit request</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Edit the details of "{selectedRequest?.requestName}"
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-project" className="text-sm font-medium text-gray-700">
                    Project *
                  </Label>
                  <Select
                    value={selectedRequest?.project || ""}
                    onValueChange={(value) => {
                      if (!selectedRequest) return
                      const updatedRequests = requests.map((r) =>
                        r.id === selectedRequest.id ? { ...r, project: value, updatedAt: new Date().toISOString() } : r,
                      )
                      setRequests(updatedRequests)
                      setSelectedRequest({ ...selectedRequest, project: value })
                    }}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white mt-1">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="CATT">CATT</SelectItem>
                      <SelectItem value="PTP">PTP</SelectItem>
                      <SelectItem value="FX">FX</SelectItem>
                      <SelectItem value="Reference data">Reference data</SelectItem>
                      <SelectItem value="Credit risk">Credit risk</SelectItem>
                      <SelectItem value="Collateral">Collateral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-severity" className="text-sm font-medium text-gray-700">
                    Priority *
                  </Label>
                  <Select
                    value={selectedRequest?.severity || ""}
                    onValueChange={(value) => {
                      if (!selectedRequest) return
                      const updatedRequests = requests.map((r) =>
                        r.id === selectedRequest.id
                          ? { ...r, severity: value, updatedAt: new Date().toISOString() }
                          : r,
                      )
                      setRequests(updatedRequests)
                      setSelectedRequest({ ...selectedRequest, severity: value })
                    }}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white mt-1">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="Low">Low - Nice to have</SelectItem>
                      <SelectItem value="Medium">Medium - Important for workflow</SelectItem>
                      <SelectItem value="High">High - Blocking current work</SelectItem>
                      <SelectItem value="Critical">Critical - Production issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-component-name" className="text-sm font-medium text-gray-700">
                  Component name *
                </Label>
                <Input
                  id="edit-component-name"
                  placeholder="e.g., SocialProfileCard, PrimaryButton-WithIcon"
                  value={selectedRequest?.requestName || ""}
                  onChange={(e) => {
                    if (!selectedRequest) return
                    const updatedRequests = requests.map((r) =>
                      r.id === selectedRequest.id
                        ? {
                            ...r,
                            requestName: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }
                        : r,
                    )
                    setRequests(updatedRequests)
                    setSelectedRequest({ ...selectedRequest, requestName: e.target.value })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="edit-justification" className="text-sm font-medium text-gray-700">
                  Why is this component needed? *
                </Label>
                <Textarea
                  id="edit-justification"
                  placeholder="Describe where this component will be used, its purpose, and any specific requirements..."
                  value={selectedRequest?.justification || ""}
                  onChange={(e) => {
                    if (!selectedRequest) return
                    const updatedRequests = requests.map((r) =>
                      r.id === selectedRequest.id
                        ? {
                            ...r,
                            justification: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }
                        : r,
                    )
                    setRequests(updatedRequests)
                    setSelectedRequest({ ...selectedRequest, justification: e.target.value })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 min-h-[100px] resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="edit-figma-link" className="text-sm font-medium text-gray-700">
                  Figma link (optional)
                </Label>
                <Input
                  id="edit-figma-link"
                  type="url"
                  placeholder="https://figma.com/file/..."
                  value={selectedRequest?.figmaLink || ""}
                  onChange={(e) => {
                    if (!selectedRequest) return
                    const updatedRequests = requests.map((r) =>
                      r.id === selectedRequest.id
                        ? {
                            ...r,
                            figmaLink: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }
                        : r,
                    )
                    setRequests(updatedRequests)
                    setSelectedRequest({ ...selectedRequest, figmaLink: e.target.value })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedRequest(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Request Dialog */}
        <Dialog open={isManualRequestOpen} onOpenChange={setIsManualRequestOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
            <DialogHeader className="px-6 py-4 border-b border-gray-200">
              <DialogTitle className="text-lg font-medium text-gray-900">Create request</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Submit a new component request for development.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project" className="text-sm font-medium text-gray-700">
                    Project *
                  </Label>
                  <Select
                    value={manualRequestForm.project}
                    onValueChange={(value) => setManualRequestForm({ ...manualRequestForm, project: value })}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white mt-1">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="CATT">CATT</SelectItem>
                      <SelectItem value="PTP">PTP</SelectItem>
                      <SelectItem value="FX">FX</SelectItem>
                      <SelectItem value="Reference data">Reference data</SelectItem>
                      <SelectItem value="Credit risk">Credit risk</SelectItem>
                      <SelectItem value="Collateral">Collateral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity" className="text-sm font-medium text-gray-700">
                    Priority *
                  </Label>
                  <Select
                    value={manualRequestForm.severity}
                    onValueChange={(value) => setManualRequestForm({ ...manualRequestForm, severity: value })}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white mt-1">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="Low">Low - Nice to have</SelectItem>
                      <SelectItem value="Medium">Medium - Important for workflow</SelectItem>
                      <SelectItem value="High">High - Blocking current work</SelectItem>
                      <SelectItem value="Critical">Critical - Production issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="component-name" className="text-sm font-medium text-gray-700">
                  Component name *
                </Label>
                <Input
                  id="component-name"
                  placeholder="e.g., SocialProfileCard, PrimaryButton-WithIcon"
                  value={manualRequestForm.requestName}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, requestName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="justification" className="text-sm font-medium text-gray-700">
                  Why is this component needed? *
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Describe where this component will be used, its purpose, and any specific requirements..."
                  value={manualRequestForm.justification}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, justification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 min-h-[100px] resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="figma-link" className="text-sm font-medium text-gray-700">
                  Figma link (optional)
                </Label>
                <Input
                  id="figma-link"
                  type="url"
                  placeholder="https://figma.com/file/..."
                  value={manualRequestForm.figmaLink || ""}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, figmaLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsManualRequestOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualRequestSubmit}
                disabled={
                  !manualRequestForm.requestName || !manualRequestForm.justification || !manualRequestForm.project
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
