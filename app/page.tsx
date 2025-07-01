"use client"

import { useState } from "react"
import { ComponentRequestDashboard } from "@/components/component-request-dashboard"
import { LoginScreen } from "@/components/login-screen"

interface UserInfo {
  email: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null)

  const handleLogin = (email: string, password: string) => {
    // Simple demo authentication - replace with real auth
    if (email && password) {
      setUser({
        email,
        role: "Admin", // You can determine role based on email or other logic
      })
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <ComponentRequestDashboard user={user} onLogout={handleLogout} />
}
