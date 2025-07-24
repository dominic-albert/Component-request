"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Shield, Users } from "lucide-react"

interface LoginScreenProps {
  onLogin: (user: { email: string; role: string }) => void
}

const mockUsers = [
  { name: "Sarah Chen", email: "sarah.chen@company.com", role: "Designer" },
  { name: "Mike Johnson", email: "mike.johnson@company.com", role: "Developer" },
  { name: "Emily Davis", email: "emily.davis@company.com", role: "Product Manager" },
  { name: "Alex Rodriguez", email: "alex.rodriguez@company.com", role: "Admin" },
  { name: "Jessica Kim", email: "jessica.kim@company.com", role: "Designer" },
]

const roles = [
  { value: "Admin", label: "Admin", icon: Shield },
  { value: "Developer", label: "Developer", icon: User },
  { value: "Designer", label: "Designer", icon: Users },
  { value: "Product Manager", label: "Product Manager", icon: User },
]

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = () => {
    if (!selectedUser || !selectedRole) return

    const user = mockUsers.find((u) => u.email === selectedUser)
    if (!user) return

    const loginData = {
      email: user.email,
      role: selectedRole,
    }

    console.log("Login attempt:", loginData)

    if (rememberMe) {
      localStorage.setItem("rememberedUser", JSON.stringify(loginData))
    }

    onLogin(loginData)
  }

  const isFormValid = selectedUser && selectedRole

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
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
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                {mockUsers.map((user) => (
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
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Choose your role..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                {roles.map((role) => {
                  const IconComponent = role.icon
                  return (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              className="border-white/20 data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">
              Remember my selection
            </Label>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!isFormValid}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Access Dashboard
          </Button>

          <div className="text-center">
            <p className="text-xs text-slate-400">Demo system - Select any user and role combination</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
