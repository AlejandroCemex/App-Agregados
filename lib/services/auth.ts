import { createClient as createBrowserClient } from '@/lib/supabase-browser'
import { createClient as createServerClient } from '@/lib/supabase-server'

// Type for the client (works in both browser and server)
type SupabaseClient = ReturnType<typeof createBrowserClient> | ReturnType<typeof createServerClient>

// Helper function to get client for browser components
export function getBrowserClient() {
  return createBrowserClient()
}

// Auth service - simplified for login only
export const authService = {
  // Check if user is authenticated
  async getCurrentUser(client: SupabaseClient) {
    const { data: { user }, error } = await client.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current user with role information from the database
  async getCurrentUserWithRole(client: SupabaseClient) {
    const user = await this.getCurrentUser(client)
    if (!user) return null

    try {
      // Get user data from the "Roles de Usuarios" table
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
        // User might not have a role assigned yet
        return {
          ...user,
          role: null
        }
      }

      return {
        ...user,
        role: userRole
      }
    } catch (error) {
      // User might not have a role assigned yet
      return {
        ...user,
        role: null
      }
    }
  },

  // Sign in with email and password
  async signIn(client: SupabaseClient, email: string, password: string) {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Sign out
  async signOut(client: SupabaseClient) {
    const { error } = await client.auth.signOut()
    if (error) throw error
  },

  // Check if user has specific role
  async userHasRole(client: SupabaseClient, roleName: string) {
    const userWithRole = await this.getCurrentUserWithRole(client)
    if (!userWithRole?.role?.Roles) return false
    return userWithRole.role.Roles.nombre === roleName
  },

  // Get user's zone
  async getUserZone(client: SupabaseClient) {
    const userWithRole = await this.getCurrentUserWithRole(client)
    return userWithRole?.role?.Zonas || null
  }
} 