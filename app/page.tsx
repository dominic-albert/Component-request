"use client"

import { useState, useEffect } from "react"
import { ComponentRequestDashboard } from "@/components/component-request-dashboard"
import { LoginScreen } from "@/components/login-screen"
import { Loader2 } from "lucide-react"

interface UserInfo {
  email: string
  name: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, try to load user from session storage
    const storedUser = sessionStorage.getItem("currentUser")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user from session storage", e)
        sessionStorage.removeItem("currentUser")
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (loggedInUser: UserInfo) => {
    setUser(loggedInUser)
    sessionStorage.setItem("currentUser", JSON.stringify(loggedInUser))
  }

  const handleLogout = () => {
    setUser(null)
    sessionStorage.removeItem("currentUser")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading application...</span>
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
