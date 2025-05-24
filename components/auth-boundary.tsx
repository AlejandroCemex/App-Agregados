"use client"

import { useAuth } from "@/hooks/use-auth"

interface AuthBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function AuthBoundary({ 
  children, 
  fallback,
  requireAuth = true 
}: AuthBoundaryProps) {
  const { loading, isAuthenticated } = useAuth()

  // Show loading state - consistent between server and client
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0001B5] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, let middleware handle redirect
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0001B5] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // If auth is not required or user is authenticated, render children
  return <>{children}</>
} 