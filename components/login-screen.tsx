"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // Import useToast
import { Toaster } from "@/components/ui/toaster" // Import Toaster

interface LoginScreenProps {
  onLogin: (user: { email: string; role: string }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Requester")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast() // Initialize useToast

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user)
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.user.email}!`,
        })
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "An unexpected error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-md border border-white/20 text-white shadow-2xl shadow-blue-500/20">
        <CardHeader className="text-center">
          <img src="/placeholder-logo.svg" alt="Logo" className="mx-auto h-16 w-16 mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-slate-300">Sign in to manage your component requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium text-slate-300">
                Login as *
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value)}>
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
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster /> {/* Add Toaster component at the root of your app */}
    </div>
  )
}
