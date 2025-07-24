"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, User, Shield } from "lucide-react"

interface LoginScreenProps {
  onLogin: (user: { email: string; role: string }) => void
}

const users = [
  { name: "Sarah Chen", email: "sarah.chen@company.com", role: "Designer" },
  { name: "Mike Johnson", email: "mike.johnson@company.com", role: "Developer" },
  { name: "Emily Davis", email: "emily.davis@company.com", role: "Product Manager" },
  { name: "Alex Rodriguez", email: "alex.rodriguez@company.com", role: "Designer" },
  { name: "Jessica Kim", email: "jessica.kim@company.com", role: "Developer" },
]

const roles = ["Admin", "Developer", "Designer", "Product Manager", "Requester"]

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load saved preferences on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser")
    const savedRole = localStorage.getItem("selectedRole")
    const savedRemember = localStorage.getItem("rememberMe") === "true"

    if (savedRemember && savedUser && savedRole) {
      setSelectedUser(savedUser)
      setSelectedRole(savedRole)
      setRememberMe(true)
      console.log("Loaded saved preferences:", { savedUser, savedRole })
    }
  }, [])

  const handleUserSelect = (userEmail: string) => {
    console.log("User selected:", userEmail)
    setSelectedUser(userEmail)

    // Auto-select role based on user
    const user = users.find((u) => u.email === userEmail)
    if (user) {
      setSelectedRole(user.role)
      console.log("Auto-selected role:", user.role)
    }
  }

  const handleRoleSelect = (role: string) => {
    console.log("Role selected:", role)
    setSelectedRole(role)
  }

  const handleLogin = async () => {
    if (!selectedUser || !selectedRole) {
      console.log("Login attempted without complete selection")
      return
    }

    setIsLoading(true)
    console.log("Starting login process...")

    // Save preferences if remember me is checked
    if (rememberMe) {
      localStorage.setItem("selectedUser", selectedUser)
      localStorage.setItem("selectedRole", selectedRole)
      localStorage.setItem("rememberMe", "true")
      console.log("Saved login preferences")
    } else {
      localStorage.removeItem("selectedUser")
      localStorage.removeItem("selectedRole")
      localStorage.removeItem("rememberMe")
      console.log("Cleared login preferences")
    }

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Login successful:", { email: selectedUser, role: selectedRole })
    onLogin({ email: selectedUser, role: selectedRole })
    setIsLoading(false)
  }

  const selectedUserData = users.find((u) => u.email === selectedUser)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl shadow-blue-500/20">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to CRs</CardTitle>
          <CardDescription className="text-slate-300">
            Component Request System - Select your profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-select" className="text-sm font-medium text-slate-300">
              Select User
            </Label>
            <Select value={selectedUser} onValueChange={handleUserSelect}>
              <SelectTrigger className="w-full bg-white/5 border-white/20 text-white [&>span]:text-white">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 backdrop-blur-md border-white/20">
                {users.map((user) => (
                  <SelectItem
                    key={user.email}
                    value={user.email}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-slate-400">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-select" className="text-sm font-medium text-slate-300">
              Select Role
            </Label>
            <Select value={selectedRole} onValueChange={handleRoleSelect}>
              <SelectTrigger className="w-full bg-white/5 border-white/20 text-white [&>span]:text-white">
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 backdrop-blur-md border-white/20">
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="text-white hover:bg-white/10 focus:bg-white/10">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {role}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && selectedRole && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{selectedUserData?.name}</p>
                  <p className="text-blue-300 text-sm">{selectedRole}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">
              Remember my selection
            </Label>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!selectedUser || !selectedRole || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
