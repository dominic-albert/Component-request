"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { User, Settings } from "lucide-react"

interface LoginScreenProps {
  onLogin: (user: { email: string; role: string }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("Requester")
  const [saveSelection, setSaveSelection] = useState<boolean>(false)

  // Load saved preferences on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("savedUser")
    const savedRole = localStorage.getItem("savedRole")

    if (savedUser) {
      setSelectedUser(savedUser)
      console.log("Loaded saved user:", savedUser)
    }
    if (savedRole) {
      setSelectedRole(savedRole)
      console.log("Loaded saved role:", savedRole)
    }
  }, [])

  const handleUserChange = (value: string) => {
    console.log("User selected:", value)
    setSelectedUser(value)
  }

  const handleRoleChange = (value: string) => {
    console.log("Role selected:", value)
    setSelectedRole(value)
  }

  const handleLogin = () => {
    if (!selectedUser) {
      console.error("No user selected")
      return
    }

    // Save preferences if requested
    if (saveSelection) {
      localStorage.setItem("savedUser", selectedUser)
      localStorage.setItem("savedRole", selectedRole)
      console.log("Saved preferences:", { user: selectedUser, role: selectedRole })
    } else {
      // Clear saved preferences if not saving
      localStorage.removeItem("savedUser")
      localStorage.removeItem("savedRole")
    }

    // Create user object with email format
    const userEmail = `${selectedUser.toLowerCase().replace(" ", "")}@company.com`

    onLogin({
      email: userEmail,
      role: selectedRole,
    })
  }

  const userOptions = [
    "Name 1",
    "Name 2",
    "Name 3",
    "Name 4",
    "Name 5",
    "Name 6",
    "Name 7",
    "Name 8",
    "Name 9",
    "Name 10",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome</CardTitle>
          <CardDescription className="text-gray-600">Select your name and role to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-select" className="text-sm font-medium text-gray-700">
              Select Your Name
            </Label>
            <Select value={selectedUser} onValueChange={handleUserChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your name..." />
              </SelectTrigger>
              <SelectContent>
                {userOptions.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-select" className="text-sm font-medium text-gray-700">
              Select Your Role
            </Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Requester">Requester</SelectItem>
                <SelectItem value="Creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="save-selection"
              checked={saveSelection}
              onCheckedChange={(checked) => setSaveSelection(checked as boolean)}
            />
            <Label htmlFor="save-selection" className="text-sm text-gray-600 cursor-pointer">
              Save this selection for next login
            </Label>
          </div>

          {selectedUser && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {selectedUser} ({selectedRole})
              </p>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium transition-colors duration-200"
          >
            <Settings className="mr-2 h-4 w-4" />
            Access Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
