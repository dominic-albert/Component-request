"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Building, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LoginScreenProps {
  onLogin: (user: { email: string; role: string; name: string }) => void
}

const USER_OPTIONS = [
  { value: "name1", label: "Name 1", email: "name1@company.com" },
  { value: "name2", label: "Name 2", email: "name2@company.com" },
  { value: "name3", label: "Name 3", email: "name3@company.com" },
  { value: "name4", label: "Name 4", email: "name4@company.com" },
  { value: "name5", label: "Name 5", email: "name5@company.com" },
  { value: "name6", label: "Name 6", email: "name6@company.com" },
  { value: "name7", label: "Name 7", email: "name7@company.com" },
  { value: "name8", label: "Name 8", email: "name8@company.com" },
  { value: "name9", label: "Name 9", email: "name9@company.com" },
  { value: "name10", label: "Name 10", email: "name10@company.com" },
]

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [role, setRole] = useState<string>("Requester")
  const [saveForNext, setSaveForNext] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  // Load saved preferences on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("savedUser")
    const savedRole = localStorage.getItem("savedRole")

    if (savedUser) {
      setSelectedUser(savedUser)
      setSaveForNext(true)
    }
    if (savedRole) {
      setRole(savedRole)
    }
  }, [])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedUser) {
      toast({
        title: "Selection Required",
        description: "Please select a user name.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const selectedUserData = USER_OPTIONS.find((user) => user.value === selectedUser)

      if (!selectedUserData) {
        throw new Error("Invalid user selection")
      }

      // Save preferences if requested
      if (saveForNext) {
        localStorage.setItem("savedUser", selectedUser)
        localStorage.setItem("savedRole", role)
      } else {
        localStorage.removeItem("savedUser")
        localStorage.removeItem("savedRole")
      }

      // Simulate login process
      await new Promise((resolve) => setTimeout(resolve, 500))

      const userData = {
        email: selectedUserData.email,
        name: selectedUserData.label,
        role: role,
      }

      console.log("Logging in user:", userData)
      onLogin(userData)

      toast({
        title: "Login Successful",
        description: `Welcome, ${selectedUserData.label}!`,
      })
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserChange = (value: string) => {
    console.log("User selected:", value)
    setSelectedUser(value)
  }

  const handleRoleChange = (value: string) => {
    console.log("Role selected:", value)
    setRole(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Building className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Component Request System</CardTitle>
          <CardDescription className="text-gray-600">
            Select your name and role to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="user" className="text-sm font-medium text-gray-700">
                Select User *
              </Label>
              <Select value={selectedUser} onValueChange={handleUserChange}>
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1">
                  <SelectValue placeholder="Choose your name" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-60">
                  {USER_OPTIONS.map((user) => (
                    <SelectItem key={user.value} value={user.value} className="hover:bg-gray-50">
                      {user.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Login as *
              </Label>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl">
                  <SelectItem value="Requester" className="hover:bg-gray-50">
                    Requester
                  </SelectItem>
                  <SelectItem value="Creator" className="hover:bg-gray-50">
                    Creator
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveForNext"
                checked={saveForNext}
                onCheckedChange={(checked) => setSaveForNext(checked as boolean)}
              />
              <Label htmlFor="saveForNext" className="text-sm text-gray-600 cursor-pointer">
                Save this selection for next login
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !selectedUser}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              {saveForNext && selectedUser
                ? "Your selection will be remembered"
                : "Quick access - no password required"}
            </p>
            {selectedUser && (
              <p className="text-xs text-blue-600 mt-1">
                Selected: {USER_OPTIONS.find((u) => u.value === selectedUser)?.label}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
