"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import React, { useState, useEffect, useCallback } from "react"
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
import { Clock, CheckCircle, AlertCircle, Plus, Eye, LogOut, User, Edit, Trash2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
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

interface ComponentRequest {
  id: string
  requestName: string
  justification: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  status: "Pending" | "In Progress" | "Completed"
  denialReason: string
  requestedAt: string
  updatedAt: string
  frameData: {
    fileId: string
    nodeId: string
    thumbnailUrl: string
  }
  project: string
  severity: "Low" | "Medium" | "High" | "Urgent"
  category: "Form" | "Navigation" | "Display" | "Input" | "Layout"
  figmaLink: string
}

const statusColors = {
  Pending: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  "In Progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Completed: "bg-green-500/20 text-green-300 border-green-500/30",
}

const priorityColors = {
  Low: "bg-green-500/20 text-green-300 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  High: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Urgent: "bg-red-500/20 text-red-300 border-red-500/30",
}

const statusIcons = {
  Pending: AlertCircle,
  "In Progress": Clock,
  Completed: CheckCircle,
}

export function ComponentRequestDashboard({ user, onLogout }: ComponentRequestDashboardProps) {
  const [requests, setRequests] = useState<ComponentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ComponentRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
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
    category: "Display",
    requesterName: "",
    requesterEmail: user.email,
    figmaLink: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)

  // Load requests on component mount
  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      // Replace with your actual API endpoint
      // const response = await fetch('/api/requests')
      // const data = await response.json()
      // setRequests(data)

      // For now, start with empty array
      setRequests([])
    } catch (error) {
      console.error("Failed to load requests:", error)
    } finally {
      setLoading(false)
    }
  }

  // Generate next ID
  const generateNextId = () => {
    const existingIds = requests.map((r) => Number.parseInt(r.id.replace("CR", "")))
    const maxId = Math.max(...existingIds, 0)
    const nextId = maxId + 1
    return `CR${nextId.toString().padStart(4, "0")}`
  }

  // Extract name from email for display
  const getUserName = (email: string) => {
    return email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const sortedAndFilteredRequests = requests
    .filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesCategory = categoryFilter === "all" || request.category === categoryFilter
      const matchesSearch =
        request.requestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      // Sort by status priority: Pending (newest first), In Progress (newest first), Completed (oldest first)
      const statusOrder = { Pending: 0, "In Progress": 1, Completed: 2 }
      const statusDiff =
        statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]

      if (statusDiff !== 0) return statusDiff

      // Within same status, sort by date
      const dateA = new Date(a.requestedAt).getTime()
      const dateB = new Date(b.requestedAt).getTime()

      if (a.status === "Completed") {
        return dateA - dateB // Completed: oldest first
      } else {
        return dateB - dateA // Pending & In Progress: newest first
      }
    })

  const totalPages = Math.ceil(sortedAndFilteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = sortedAndFilteredRequests.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, categoryFilter, searchTerm])

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return

    try {
      // Replace with your actual API endpoint
      // await fetch(`/api/requests/${selectedRequest.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     status: updateStatus,
      //     denialReason: updateStatus === "Denied" ? denialReason : "",
      //   })
      // })

      const updatedRequests = requests.map((request) => {
        if (request.id === selectedRequest.id) {
          return {
            ...request,
            status: updateStatus as ComponentRequest["status"],
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
    } catch (error) {
      console.error("Failed to update request:", error)
    }
  }

  const getStatusCounts = () => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      inProgress: requests.filter((r) => r.status === "In Progress").length,
      completed: requests.filter((r) => r.status === "Completed").length,
    }
  }

  const statusCounts = getStatusCounts()

  const handleManualRequestSubmit = async () => {
    try {
      const newRequest: ComponentRequest = {
        id: generateNextId(),
        requestName: manualRequestForm.requestName,
        justification: manualRequestForm.justification,
        requesterId: `manual_${Date.now()}`,
        requesterName: manualRequestForm.requesterName,
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
        severity: manualRequestForm.severity as ComponentRequest["severity"],
        category: manualRequestForm.category as ComponentRequest["category"],
        project: "Manual",
        figmaLink: manualRequestForm.figmaLink,
      }

      // Replace with your actual API endpoint
      // await fetch('/api/requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newRequest)
      // })

      setRequests([newRequest, ...requests])
      setIsManualRequestOpen(false)
      setManualRequestForm({
        requestName: "",
        justification: "",
        severity: "Medium",
        category: "Display",
        requesterName: "",
        requesterEmail: user.email,
        figmaLink: "",
      })
    } catch (error) {
      console.error("Failed to create request:", error)
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    try {
      // Replace with your actual API endpoint
      // await fetch(`/api/requests/${requestId}`, {
      //   method: 'DELETE'
      // })

      const updatedRequests = requests.filter((r) => r.id !== requestId)
      setRequests(updatedRequests)
    } catch (error) {
      console.error("Failed to delete request:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const generateApiKey = () => {
    setIsGeneratingKey(true)
    // Simulate API key generation
    setTimeout(() => {
      const newKey = `crs_${user.email.split("@")[0]}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`
      setApiKey(newKey)
      setIsGeneratingKey(false)
    }, 1500)
  }

  const handleCopyApiKey = useCallback(() => {
    navigator.clipboard.writeText(apiKey)
  }, [apiKey])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
      style={{ fontFamily: "Google Sans, Roboto, Arial, sans-serif" }}
    >
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
            <p className="text-slate-300 mt-2">Manage and track component requests.</p>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{getUserName(user.email)}</span>
                    <span className="text-xs text-slate-400">{user.role}</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl min-w-[200px]"
              >
                <DropdownMenuLabel className="font-semibold px-4 py-2 text-white">Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="border-t border-white/10" />
                <DropdownMenuItem disabled className="px-4 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{getUserName(user.email)}</span>
                    <span className="text-xs text-slate-300">{user.email}</span>
                    <span className="text-xs text-slate-300">{user.role}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-t border-white/10" />
                <DropdownMenuItem
                  className="px-4 py-2 cursor-pointer hover:bg-white/10 text-slate-300 hover:text-white transition-colors duration-200"
                  onClick={() => setIsApiKeyDialogOpen(true)}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h-6m6 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6z"
                    />
                  </svg>
                  API Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onLogout}
                  className="px-4 py-2 cursor-pointer hover:bg-white/10 text-slate-300 hover:text-white transition-colors duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3 overflow-x-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/10 min-w-[140px] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-slate-300">Total requests</div>
              <div className="text-xl font-semibold text-white">{statusCounts.total}</div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/10 min-w-[140px] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="text-xs font-medium text-slate-300">Pending</div>
                <AlertCircle className="h-3 w-3 text-gray-400" />
              </div>
              <div className="text-xl font-semibold text-white">{statusCounts.pending}</div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/10 min-w-[140px] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="text-xs font-medium text-slate-300">In progress</div>
                <Clock className="h-3 w-3 text-blue-400" />
              </div>
              <div className="text-xl font-semibold text-white">{statusCounts.inProgress}</div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/10 min-w-[140px] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="text-xs font-medium text-slate-300">Completed</div>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <div className="text-xl font-semibold text-white">{statusCounts.completed}</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl shadow-blue-500/10">
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">Component requests</h2>
                <p className="text-slate-300 mt-1">Review and manage component requests from your design team</p>
              </div>
              <Button
                onClick={() => setIsManualRequestOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create request
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm [&>span]:text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
                  <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
                    All status
                  </SelectItem>
                  <SelectItem value="Pending" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Pending
                  </SelectItem>
                  <SelectItem value="In Progress" className="text-white hover:bg-white/10 focus:bg-white/10">
                    In progress
                  </SelectItem>
                  <SelectItem value="Completed" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm [&>span]:text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
                  <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
                    All categories
                  </SelectItem>
                  <SelectItem value="Form" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Form
                  </SelectItem>
                  <SelectItem value="Navigation" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Navigation
                  </SelectItem>
                  <SelectItem value="Display" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Display
                  </SelectItem>
                  <SelectItem value="Input" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Input
                  </SelectItem>
                  <SelectItem value="Layout" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Layout
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value="newest" onValueChange={() => {}}>
                <SelectTrigger className="w-[140px] px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm [&>span]:text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
                  <SelectItem value="newest" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Newest first
                  </SelectItem>
                  <SelectItem value="oldest" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Oldest first
                  </SelectItem>
                  <SelectItem value="name-asc" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Name A-Z
                  </SelectItem>
                  <SelectItem value="name-desc" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Name Z-A
                  </SelectItem>
                  <SelectItem value="priority" className="text-white hover:bg-white/10 focus:bg-white/10">
                    Priority
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requests Table */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No requests yet</h3>
                  <p className="text-slate-400 mb-6">Get started by creating your first component request.</p>
                  <Button
                    onClick={() => setIsManualRequestOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first request
                  </Button>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                        <TableHead className="px-6 py-4 text-left text-xs text-slate-300 uppercase tracking-wider font-semibold">
                          ID
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-xs text-slate-300 uppercase tracking-wider font-semibold">
                          Component name
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Requester
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Category
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Status
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Priority
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Created
                        </TableHead>
                        <TableHead className="px-6 py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Actions
                        </TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/10">
                      {paginatedRequests.map((request) => {
                        const StatusIcon = statusIcons[request.status as keyof typeof statusIcons]
                        return (
                          <TableRow key={request.id} className="hover:bg-white/5 transition-colors duration-200">
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-slate-300">{request.id}</div>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{request.requestName}</div>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm text-white">{request.requesterName}</div>
                                <div className="text-xs bg-white/10 px-2 py-1 rounded-full w-fit mt-1 text-white">
                                  {request.project}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-300">{request.category}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status as keyof typeof statusColors]}`}
                              >
                                {StatusIcon && <StatusIcon className="mr-1.5 h-3 w-3" />}
                                {request.status}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[request.severity as keyof typeof priorityColors]}`}
                              >
                                {request.severity}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-300">{formatDate(request.requestedAt)}</span>
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
                                className="px-4 py-2 text-xs border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm rounded-lg"
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
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-200"
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
                                  className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl min-w-[120px]"
                                >
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="px-3 py-2 cursor-pointer hover:bg-white/10 text-slate-300 hover:text-white text-sm transition-colors duration-200"
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                      </DropdownMenuItem>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-blue-500/20">
                                      <DialogHeader className="px-6 py-4 border-b border-white/10">
                                        <DialogTitle className="text-xl font-semibold text-white">
                                          {request.requestName}
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-300">
                                          {request.id} • Requested by {request.requesterName} on{" "}
                                          {formatDate(request.requestedAt)}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="px-6 py-4 space-y-4">
                                        <div>
                                          <Label className="text-sm font-medium text-slate-300">Status</Label>
                                          <div className="mt-1">
                                            <span
                                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status as keyof typeof statusColors]}`}
                                            >
                                              {StatusIcon && <StatusIcon className="mr-1.5 h-3 w-3" />}
                                              {request.status}
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-slate-300">Priority</Label>
                                          <div className="mt-1">
                                            <span
                                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[request.severity as keyof typeof priorityColors]}`}
                                            >
                                              {request.severity}
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-slate-300">Category</Label>
                                          <p className="mt-1 text-sm text-white">{request.category}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-slate-300">Requester email</Label>
                                          <p className="mt-1 text-sm text-white">{request.requesterEmail}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-slate-300">Project</Label>
                                          <div className="mt-1">
                                            <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full">
                                              {request.project}
                                            </span>
                                          </div>
                                        </div>
                                        {request.figmaLink && (
                                          <div>
                                            <Label className="text-sm font-medium text-slate-300">Figma link</Label>
                                            <div className="mt-1">
                                              <a
                                                href={request.figmaLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
                                              >
                                                {request.figmaLink}
                                              </a>
                                            </div>
                                          </div>
                                        )}
                                        <div>
                                          <Label className="text-sm font-medium text-slate-300">Description</Label>
                                          <p className="mt-1 text-sm text-white">{request.justification}</p>
                                        </div>
                                        {request.frameData?.thumbnailUrl && (
                                          <div>
                                            <Label className="text-sm font-medium text-slate-300">Design preview</Label>
                                            <div className="mt-2">
                                              <img
                                                src={request.frameData.thumbnailUrl || "/placeholder.svg"}
                                                alt={`Preview of ${request.requestName}`}
                                                className="rounded-lg border border-white/20 max-w-full h-auto"
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
                                    className="px-3 py-2 cursor-pointer hover:bg-white/10 text-slate-300 hover:text-white text-sm transition-colors duration-200"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => handleDeleteRequest(request.id)}
                                    className="px-3 py-2 cursor-pointer hover:bg-white/10 text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
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

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 px-6 pb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-300">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(startIndex + itemsPerPage, sortedAndFilteredRequests.length)} of{" "}
                          {sortedAndFilteredRequests.length} results
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-300">Show:</span>
                          <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => setItemsPerPage(Number(value))}
                          >
                            <SelectTrigger className="w-20 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm [&>span]:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl text-white">
                              <SelectItem value="10" className="text-white hover:bg-white/10 focus:bg-white/10">
                                10
                              </SelectItem>
                              <SelectItem value="20" className="text-white hover:bg-white/10 focus:bg-white/10">
                                20
                              </SelectItem>
                              <SelectItem value="30" className="text-white hover:bg-white/10 focus:bg-white/10">
                                30
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-xs border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 p-0 text-xs rounded-lg transition-all duration-200 ${
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                                    : "border border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-xs border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-blue-500/20 max-w-md">
            <DialogHeader className="px-6 py-4 border-b border-white/10">
              <DialogTitle className="text-xl font-semibold text-white">Update request status</DialogTitle>
              <DialogDescription className="text-slate-300">
                Update the status of "{selectedRequest?.requestName}"
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-slate-300">
                  Status
                </Label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm mt-1 [&>span]:text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                className="px-4 py-2 border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40"
              >
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Request Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-blue-500/20">
            <DialogHeader className="px-6 py-4 border-b border-white/10">
              <DialogTitle className="text-xl font-semibold text-white">Edit request</DialogTitle>
              <DialogDescription className="text-slate-300">
                Edit the details of "{selectedRequest?.requestName}"
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category" className="text-sm font-medium text-slate-300">
                    Category *
                  </Label>
                  <Select
                    value={selectedRequest?.category || ""}
                    onValueChange={(value) => {
                      if (!selectedRequest) return
                      const updatedRequests = requests.map((r) =>
                        r.id === selectedRequest.id
                          ? {
                              ...r,
                              category: value as ComponentRequest["category"],
                              updatedAt: new Date().toISOString(),
                            }
                          : r,
                      )
                      setRequests(updatedRequests)
                      setSelectedRequest({ ...selectedRequest, category: value as ComponentRequest["category"] })
                    }}
                  >
                    <SelectTrigger className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm mt-1 [&>span]:text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
                      <SelectItem value="Form">Form</SelectItem>
                      <SelectItem value="Navigation">Navigation</SelectItem>
                      <SelectItem value="Display">Display</SelectItem>
                      <SelectItem value="Input">Input</SelectItem>
                      <SelectItem value="Layout">Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-severity" className="text-sm font-medium text-slate-300">
                    Priority *
                  </Label>
                  <Select
                    value={selectedRequest?.severity || ""}
                    onValueChange={(value) => {
                      if (!selectedRequest) return
                      const updatedRequests = requests.map((r) =>
                        r.id === selectedRequest.id
                          ? {
                              ...r,
                              severity: value as ComponentRequest["severity"],
                              updatedAt: new Date().toISOString(),
                            }
                          : r,
                      )
                      setRequests(updatedRequests)
                      setSelectedRequest({ ...selectedRequest, severity: value as ComponentRequest["severity"] })
                    }}
                  >
                    <SelectTrigger className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm mt-1 [&>span]:text-white">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-component-name" className="text-sm font-medium text-slate-300">
                  Component title *
                </Label>
                <Input
                  id="edit-component-name"
                  placeholder="e.g., Advanced Data Table, Multi-step Form Wizard"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-justification" className="text-sm font-medium text-slate-300">
                  Description *
                </Label>
                <Textarea
                  id="edit-justification"
                  placeholder="Describe the component requirements, use cases, and specific features needed..."
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm mt-1 min-h-[100px] resize-vertical"
                />
              </div>

              <div>
                <Label htmlFor="edit-figma-link" className="text-sm font-medium text-slate-300">
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm mt-1"
                />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedRequest(null)
                }}
                className="px-4 py-2 border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Request Dialog */}
        <Dialog open={isManualRequestOpen} onOpenChange={setIsManualRequestOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-blue-500/20">
            <DialogHeader className="px-6 py-4 border-b border-white/10">
              <DialogTitle className="text-xl font-semibold text-white">Create request</DialogTitle>
              <DialogDescription className="text-slate-300">
                Submit a new component request for development.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-slate-300">
                    Category *
                  </Label>
                  <Select
                    value={manualRequestForm.category}
                    onValueChange={(value) => setManualRequestForm({ ...manualRequestForm, category: value })}
                  >
                    <SelectTrigger className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm mt-1 [&>span]:text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl text-white">
                      <SelectItem value="Form" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Form
                      </SelectItem>
                      <SelectItem value="Navigation" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Navigation
                      </SelectItem>
                      <SelectItem value="Display" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Display
                      </SelectItem>
                      <SelectItem value="Input" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Input
                      </SelectItem>
                      <SelectItem value="Layout" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Layout
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity" className="text-sm font-medium text-slate-300">
                    Priority *
                  </Label>
                  <Select
                    value={manualRequestForm.severity}
                    onValueChange={(value) => setManualRequestForm({ ...manualRequestForm, severity: value })}
                  >
                    <SelectTrigger className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm mt-1 [&>span]:text-white">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl text-white">
                      <SelectItem value="Low" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Low
                      </SelectItem>
                      <SelectItem value="Medium" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Medium
                      </SelectItem>
                      <SelectItem value="High" className="text-white hover:bg-white/10 focus:bg-white/10">
                        High
                      </SelectItem>
                      <SelectItem value="Urgent" className="text-white hover:bg-white/10 focus:bg-white/10">
                        Urgent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="component-name" className="text-sm font-medium text-slate-300">
                  Component title *
                </Label>
                <Input
                  id="component-name"
                  placeholder="e.g., Advanced Data Table, Multi-step Form Wizard"
                  value={manualRequestForm.requestName}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, requestName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm mt-1"
                />
              </div>

              <div>
                <Label htmlFor="requester-name" className="text-sm font-medium text-slate-300">
                  Requester name *
                </Label>
                <Input
                  id="requester-name"
                  placeholder="Your full name"
                  value={manualRequestForm.requesterName}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, requesterName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm mt-1"
                />
              </div>

              <div>
                <Label htmlFor="justification" className="text-sm font-medium text-slate-300">
                  Description *
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Describe the component requirements, use cases, and specific features needed..."
                  value={manualRequestForm.justification}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, justification: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm mt-1 min-h-[100px] resize-vertical"
                />
              </div>

              <div>
                <Label htmlFor="figma-link" className="text-sm font-medium text-slate-300">
                  Figma link (optional)
                </Label>
                <Input
                  id="figma-link"
                  type="url"
                  placeholder="https://figma.com/file/..."
                  value={manualRequestForm.figmaLink || ""}
                  onChange={(e) => setManualRequestForm({ ...manualRequestForm, figmaLink: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm mt-1"
                />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsManualRequestOpen(false)}
                className="px-4 py-2 border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualRequestSubmit}
                disabled={
                  !manualRequestForm.requestName || !manualRequestForm.justification || !manualRequestForm.requesterName
                }
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Key Management Dialog */}
        <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
          <DialogContent className="max-w-md bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-blue-500/20">
            <DialogHeader className="px-6 py-4 border-b border-white/10">
              <DialogTitle className="text-xl font-semibold text-white">API Settings</DialogTitle>
              <DialogDescription className="text-slate-300">
                Manage your API key for Figma plugin integration
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-300 mb-1">Figma Plugin Integration</h4>
                    <p className="text-xs text-blue-200/80">
                      Use this API key in the Figma plugin to automatically create component requests from selected
                      frames or components.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-300">Your API Key</Label>
                <div className="mt-2 space-y-3">
                  {apiKey ? (
                    <div className="relative">
                      <Input
                        value={apiKey}
                        readOnly
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-mono text-sm pr-20"
                      />
                      <Button
                        onClick={handleCopyApiKey}
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        Copy
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-slate-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h-6m6 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6z"
                        />
                      </svg>
                      <p className="text-slate-400 text-sm mb-4">No API key generated yet</p>
                    </div>
                  )}

                  <Button
                    onClick={generateApiKey}
                    disabled={isGeneratingKey}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 disabled:opacity-50"
                  >
                    {isGeneratingKey ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </div>
                    ) : (
                      <>{apiKey ? "Regenerate API Key" : "Generate API Key"}</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-amber-300 mb-1">Security Notice</h4>
                    <p className="text-xs text-amber-200/80">
                      Keep your API key secure. Don't share it publicly or commit it to version control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-white/10 flex justify-end">
              <Button
                onClick={() => setIsApiKeyDialogOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
