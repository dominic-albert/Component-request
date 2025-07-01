"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Building } from "lucide-react"

interface LoginScreenProps {
  onLogin: (userInfo: { email: string; role: string }) => void
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
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4"
      style={{ fontFamily: "Google Sans, Roboto, Arial, sans-serif" }}
    >
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl shadow-blue-500/20">
        <CardHeader className="text-center px-6 py-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
            <Building className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-white">Component Request System</CardTitle>
          <CardDescription className="text-slate-300 mt-2">
            Welcome! Please enter your details to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email Address *
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-medium text-slate-300">
              Login as *
            </Label>
            <Select value={loginForm.role} onValueChange={(value) => setLoginForm({ ...loginForm, role: value })}>
              <SelectTrigger className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white backdrop-blur-sm mt-1 [&>span]:text-white">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
                <SelectItem value="Requester" className="text-white hover:bg-white/10 focus:bg-white/10">
                  Requester
                </SelectItem>
                <SelectItem value="Creator" className="text-white hover:bg-white/10 focus:bg-white/10">
                  Creator
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!loginForm.email}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Access Dashboard
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-400">No password required - just enter your email to continue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
