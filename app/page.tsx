"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { ComponentRequestDashboard } from "@/components/component-request-dashboard"

interface UserInfo {
  email: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for saved login on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser")
    const savedRole = localStorage.getItem("selectedRole")
    const rememberMe = localStorage.getItem("rememberMe") === "true"

    if (rememberMe && savedUser && savedRole) {
      setUser({ email: savedUser, role: savedRole })
      console.log("Auto-logged in user:", { email: savedUser, role: savedRole })
    }

    setIsLoading(false)
  }, [])

  const handleLogin = (userInfo: UserInfo) => {
    console.log("User logged in:", userInfo)
    setUser(userInfo)
  }

  const handleLogout = () => {
    console.log("User logged out")
    setUser(null)
    // Clear saved preferences
    localStorage.removeItem("selectedUser")
    localStorage.removeItem("selectedRole")
    localStorage.removeItem("rememberMe")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <ComponentRequestDashboard user={user} onLogout={handleLogout} />
}
