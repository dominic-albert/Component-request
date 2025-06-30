"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { ComponentRequestDashboard } from "@/components/component-request-dashboard"

interface UserInfo {
  email: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null)

  const handleLogin = (userInfo: UserInfo) => {
    setUser(userInfo)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      <ComponentRequestDashboard user={user} onLogout={handleLogout} />
    </div>
  )
}
