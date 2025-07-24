"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface LoginScreenProps {
  onLogin: (user: { name: string; email: string; role: string }) => void
}

const users = [
  { name: "Sarah Chen", email: "sarah.chen@company.com", role: "Designer" },
  { name: "Mike Johnson", email: "mike.johnson@company.com", role: "Product Manager" },
  { name: "Emily Davis", email: "emily.davis@company.com", role: "Developer" },
  { name: "Alex Rodriguez", email: "alex.rodriguez@company.com", role: "Designer" },
  { name: "Jessica Kim", email: "jessica.kim@company.com", role: "Product Manager" },
]

const roles = ["Designer", "Developer", "Product Manager", "QA Engineer", "Admin"]

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)

  const handleLogin = () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please select both a user and a role.",
        variant: "destructive",
      })
      return
    }

    const user = users.find((u) => u.name === selectedUser)
    if (!user) {
      toast({
        title: "Error",
        description: "Selected user not found.",
        variant: "destructive",
      })
      return
    }

    const loginData = {
      name: user.name,
      email: user.email,
      role: selectedRole,
    }

    console.log("Login attempt:", loginData)

    if (rememberMe) {
      localStorage.setItem("rememberedLogin", JSON.stringify(loginData))
      console.log("Login saved to localStorage")
    }

    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.name}!`,
    })

    onLogin(loginData)
  }

  const debugSupabase = async () => {
    setIsDebugging(true)
    try {
      console.log("Starting Supabase debug...")
      const response = await fetch("/api/debug/supabase")
      const result = await response.json()

      console.log("Supabase debug result:", result)

      if (result.success) {
        toast({
          title: "Supabase Connection ✅",
          description: "Database connection is working properly",
        })
      } else {
        toast({
          title: "Supabase Connection ❌",
          description: result.error || "Connection failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Debug failed:", error)
      toast({
        title: "Debug Failed",
        description: "Could not test Supabase connection",
        variant: "destructive",
      })
    } finally {
      setIsDebugging(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CRs</CardTitle>
          <CardDescription>Component Request System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.email} value={user.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{user.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {user.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" checked={rememberMe} onCheckedChange={setRememberMe} />
            <label htmlFor="remember" className="text-sm">
              Remember me
            </label>
          </div>

          <Button onClick={handleLogin} className="w-full" disabled={!selectedUser || !selectedRole}>
            Access Dashboard
          </Button>

          <div className="pt-4 border-t">
            <Button onClick={debugSupabase} variant="outline" className="w-full bg-transparent" disabled={isDebugging}>
              {isDebugging ? "Testing Connection..." : "🔧 Debug Supabase"}
            </Button>
          </div>

          {selectedUser && (
            <div className="text-xs text-gray-500 text-center">
              Selected: {selectedUser} ({selectedRole})
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
