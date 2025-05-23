'use client'

import { useState, useEffect } from 'react'
import { authService, getBrowserClient } from '@/lib/services/auth'
import type { User } from '@supabase/supabase-js'

interface UserWithRole extends User {
  role?: {
    id: string
    email: string
    nombre: string | null
    id_rol: number | null
    id_zona: number | null
    Roles?: { id: number; nombre: string } | null
    Zonas?: { id: number; nombre: string } | null
  } | null
}

export function useAuth() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const client = getBrowserClient()

  useEffect(() => {
    // Get initial session
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await getUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userWithRole = await authService.getCurrentUserWithRole(client)
      setUser(userWithRole)
    } catch (err: any) {
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await authService.signIn(client, email, password)
      await getUser() // Refresh user data
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await authService.signOut(client)
      setUser(null)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const hasRole = (roleName: string): boolean => {
    return user?.role?.Roles?.nombre === roleName
  }

  const getUserZone = () => {
    return user?.role?.Zonas || null
  }

  const isAuthenticated = !!user

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    hasRole,
    getUserZone,
    isAuthenticated,
    refresh: getUser
  }
} 