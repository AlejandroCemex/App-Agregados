"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

// Re-export the useAuth hook as useUser for backward compatibility
export function useUser() {
  return useAuth()
}

// Safe version that doesn't throw errors
export function useSafeUser() {
  try {
    return useAuth()
  } catch {
    return {
      user: null,
      loading: false,
      error: null,
      signIn: async () => ({ user: null, session: null }),
      signOut: async () => {},
      hasRole: () => false,
      getUserZone: () => null,
      isAuthenticated: false,
      refresh: async () => {}
    }
  }
}

// Provider component for backward compatibility
export function UserProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
