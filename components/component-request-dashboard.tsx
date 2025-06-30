"use client"

import { Button } from "@/components/ui/button"

interface ComponentRequestDashboardProps {
  user: {
    email: string
    role: string
  }
  onLogout: () => void
}

export function ComponentRequestDashboard({ user, onLogout }: ComponentRequestDashboardProps) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user.email} ({user.role})
      </h1>
      <p className="mb-4">This is the component request dashboard.</p>
      <Button onClick={onLogout}>Logout</Button>
    </div>
  )
}
