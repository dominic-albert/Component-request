"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { ComponentRequestDashboard } from "@/components/component-request-dashboard"

interface User {
  name: string
  email: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for remembered login
    const rememberedLogin = localStorage.getItem("rememberedLogin")
    if (rememberedLogin) {
      try {
        const userData = JSON.parse(rememberedLogin)
        console.log("Found remembered login:", userData)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing remembered login:", error)
        localStorage.removeItem("rememberedLogin")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    console.log("User logged in:", userData)
    setUser(userData)
  }

  const handleLogout = () => {
    console.log("User logged out")
    setUser(null)
    localStorage.removeItem("rememberedLogin")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <ComponentRequestDashboard user={user} onLogout={handleLogout} />
}
