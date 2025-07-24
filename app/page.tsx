"use client"

import { useState, useEffect } from "react"
import { ComponentRequestDashboard } from "@/components/component-request-dashboard"
import { LoginScreen } from "@/components/login-screen"

interface UserInfo {
  email: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for remembered user
    const remembered = localStorage.getItem("rememberedUser")
    if (remembered) {
      try {
        const userData = JSON.parse(remembered)
        console.log("Loading remembered user:", userData)
        setUser(userData)
      } catch (e) {
        console.error("Failed to parse remembered user:", e)
        localStorage.removeItem("rememberedUser")
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (loggedInUser: UserInfo) => {
    console.log("User logged in:", loggedInUser)
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    console.log("User logged out")
    setUser(null)
    localStorage.removeItem("rememberedUser")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <span>Loading CRs...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {user ? <ComponentRequestDashboard user={user} onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} />}
    </>
  )
}
