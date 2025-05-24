"use client"

import type React from "react"
import { AuthBoundary } from "@/components/auth-boundary"
import { DashboardNavigation } from "@/components/dashboard-navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthBoundary requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <DashboardNavigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthBoundary>
  )
}
