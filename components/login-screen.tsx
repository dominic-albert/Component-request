"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Building } from "lucide-react"

interface LoginScreenProps {
  onLogin: (userInfo: {
    email: string
    role: string
  }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loginForm, setLoginForm] = useState({
    email: "",
    role: "Requester",
  })

  const handleLogin = () => {
    if (loginForm.email) {
      onLogin(loginForm)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Component Request System</CardTitle>
          <CardDescription>Welcome! Please enter your details to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role">Login as *</Label>
            <Select value={loginForm.role} onValueChange={(value) => setLoginForm({ ...loginForm, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Requester">Requester</SelectItem>
                <SelectItem value="Creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleLogin} disabled={!loginForm.email} className="w-full">
            Access Dashboard
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>No password required - just enter your email to continue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
