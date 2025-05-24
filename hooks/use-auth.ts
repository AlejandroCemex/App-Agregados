'use client'

import { useState, useEffect, useRef } from 'react'
import { authService, type UserRole } from '@/lib/services/auth'
import type { User } from '@supabase/supabase-js'

// Define our application user type
type AppUser = {
  user: User | null
  role: UserRole | null
}

export function useAuth() {
  const [userData, setUserData] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const initialized = useRef(false)

  // Handle client-side mounting first
  useEffect(() => {
    setMounted(true)
  }, [])

  // Main auth effect - only runs after mounting
  useEffect(() => {
    if (!mounted) {
      return
    }
    
    if (initialized.current) {
      return
    }
    
    initialized.current = true
    
    let isCancelled = false

    // Dynamic import to avoid SSR issues
    const initializeAuth = async () => {
      try {
        // Import browser client only on client side
        const { getBrowserClient } = await import('@/lib/services/auth')
        const client = getBrowserClient()
        
        const { data: { session } } = await client.auth.getSession()
        
        if (isCancelled) {
          return
        }
        
        if (session?.user) {
          await getUserWithRole(client)
        } else {
          setUserData(null)
          setLoading(false)
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message)
          setUserData(null)
          setLoading(false)
        }
      }
    }

    const setupAuthListener = async () => {
      try {
        const { getBrowserClient } = await import('@/lib/services/auth')
        const client = getBrowserClient()

        // Set up auth state listener
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (event, session) => {
            if (isCancelled) {
              return
            }
            
            if (event === 'SIGNED_IN' && session?.user) {
              await getUserWithRole(client)
            } else if (event === 'SIGNED_OUT') {
              setUserData(null)
              setLoading(false)
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              // Only refresh user data if we don't have it or user changed
              if (!userData?.user || userData.user.id !== session.user.id) {
                await getUserWithRole(client)
              }
            }
          }
        )

        return subscription
      } catch (err) {
        return null
      }
    }

    const getUserWithRole = async (client: any) => {
      if (isCancelled) {
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        const result = await authService.getCurrentUserWithRole(client)
        
        if (!isCancelled) {
          setUserData(result ? { user: result.user, role: result.role } : null)
          setLoading(false)
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message)
          setUserData(null)
          setLoading(false)
        }
      }
    }

    let subscription: any = null
    
    Promise.all([
      initializeAuth(),
      setupAuthListener()
    ]).then(([, sub]) => {
      subscription = sub
    }).catch(() => {
      // Error handled in individual functions
    })

    return () => {
      isCancelled = true
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [mounted]) // Depend on mounted state

  const signIn = async (email: string, password: string) => {
    if (!mounted) {
      throw new Error('Auth not initialized')
    }
    
    try {
      setError(null)
      
      const { getBrowserClient } = await import('@/lib/services/auth')
      const client = getBrowserClient()
      const result = await authService.signIn(client, email, password)
      
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    if (!mounted) {
      throw new Error('Auth not initialized')
    }
    
    try {
      setError(null)
      const { getBrowserClient } = await import('@/lib/services/auth')
      const client = getBrowserClient()
      await authService.signOut(client)
      setUserData(null)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const isAuthenticated = !!userData?.user
  const user = userData?.user || null
  const role = userData?.role || null

  const hasRole = (roleName: string): boolean => {
    return role?.Roles?.nombre === roleName
  }

  const getUserZone = () => {
    return role?.Zonas || null
  }

  const refresh = async () => {
    if (!mounted) return
    
    try {
      setError(null)
      const { getBrowserClient } = await import('@/lib/services/auth')
      const client = getBrowserClient()
      
      const result = await authService.getCurrentUserWithRole(client)
      setUserData(result ? { user: result.user, role: result.role } : null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return {
    user,
    role,
    loading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    hasRole,
    getUserZone,
    refresh,
    mounted
  }
} 