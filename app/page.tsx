"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { ComponentRequestDashboard } from "@/components/component-request-dashboard"

interface User {
  email: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    console.log("User logged in:", userData)
    setUser(userData)
  }

  const handleLogout = () => {
    console.log("User logged out")
    setUser(null)
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <ComponentRequestDashboard user={user} onLogout={handleLogout} />
}
