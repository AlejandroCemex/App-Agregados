import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Type for the client (works in both browser and server)
type SupabaseClient = ReturnType<typeof createClient> | Awaited<ReturnType<typeof createServerClient>>

export type UserRole = {
  id: string
  email: string
  nombre: string | null
  id_rol: number | null
  id_zona: number | null
  Roles?: { id: number; nombre: string } | null
  Zonas?: { id: number; nombre: string } | null
}

// Create a single browser client instance to avoid creating multiple clients
let browserClient: ReturnType<typeof createClient> | null = null

// Helper function to get client for browser components
export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

// Auth service - simplified for login only
export const authService = {
  // Check if user is authenticated
  async getCurrentUser(client: SupabaseClient) {
    try {
      const { data: { user }, error } = await client.auth.getUser()
      if (error) throw error
      return user
    } catch (error: any) {
      throw error
    }
  },

  // Get current user with role information from the database
  async getCurrentUserWithRole(client: SupabaseClient) {
    const user = await this.getCurrentUser(client)
    if (!user) {
      return null
    }

    try {
      // Using quoted table name to handle spaces
      const { data: userRole, error } = await client
        .from('Roles de Usuarios')
        .select(`
          *,
          Roles!id_rol(id, nombre),
          Zonas!id_zona(id, nombre)
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        // If user doesn't have a role assigned, that's okay - they might be a new user
        if (error.code === 'PGRST116') {
          return {
            user,
            role: null
          }
        }
        
        // Don't throw here - return user without role instead
        return {
          user,
          role: null
        }
      }

      return {
        user,
        role: userRole as UserRole
      }
    } catch (error: any) {
      // Don't throw here - return user without role instead
      return {
        user,
        role: null
      }
    }
  },

  // Sign in with email and password
  async signIn(client: SupabaseClient, email: string, password: string) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  // Sign out
  async signOut(client: SupabaseClient) {
    try {
      const { error } = await client.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      throw error
    }
  },

  // Check if user has specific role
  async userHasRole(client: SupabaseClient, roleName: string) {
    const response = await this.getCurrentUserWithRole(client)
    return response?.role?.Roles?.nombre === roleName
  },

  // Get user's zone
  async getUserZone(client: SupabaseClient) {
    const response = await this.getCurrentUserWithRole(client)
    return response?.role?.Zonas || null
  }
} 