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
        console.log('Auth state change:', event, session?.user?.email)
        
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
      console.log('Fetching current user with role...')
      
      const userWithRole = await authService.getCurrentUserWithRole(client)
      console.log('User fetched:', userWithRole?.email, 'Role:', userWithRole?.role?.Roles?.nombre)
      
      setUser(userWithRole)
    } catch (err: any) {
      console.error('Error fetching user:', err)
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      console.log('useAuth: Starting sign in process')
      
      const result = await authService.signIn(client, email, password)
      console.log('useAuth: Sign in successful, refreshing user data')
      
      await getUser() // Refresh user data
      return result
    } catch (err: any) {
      console.error('useAuth: Sign in error:', err)
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      console.log('useAuth: Signing out')
      
      await authService.signOut(client)
      setUser(null)
      console.log('useAuth: Sign out successful')
    } catch (err: any) {
      console.error('useAuth: Sign out error:', err)
      setError(err.message)
      throw err
    }
  }

  const hasRole = (roleName: string): boolean => {
    const hasRoleResult = user?.role?.Roles?.nombre === roleName
    console.log(`Checking role ${roleName}:`, hasRoleResult, 'User role:', user?.role?.Roles?.nombre)
    return hasRoleResult
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