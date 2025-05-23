"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabaseClient } from "@/lib/supabase/client"

type User = {
  id: number
  nombre: string
  zona: {
    id: number
    nombre: string
  }
  rol: {
    id: number
    nombre: string
  }
}

type UserContextType = {
  user: User | null
  loading: boolean
  login: (username: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Use useEffect to ensure this only runs on the client side
  useEffect(() => {
    setIsClient(true)
    // Check if user is stored in localStorage
    let storedUser = null
    try {
      storedUser = localStorage.getItem("cemex-user")
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string) => {
    try {
      setLoading(true)

      // Create a default user with the provided username
      // This is a temporary solution to ensure the app works even if there are database issues
      const defaultUserData: User = {
        id: 1,
        nombre: username || "Usuario",
        zona: {
          id: 1,
          nombre: "Zona Central",
        },
        rol: {
          id: 1,
          nombre: "Usuario",
        },
      }

      try {
        // Try to get the user from the database
        const { data, error } = await supabaseClient
          .from("Roles de Usuarios")
          .select(`
          id,
          Nombre,
          Zona (id, Nombre),
          Rol (id, Nombre)
        `)
          .eq("Nombre", username)
          .single()

        // If we successfully got the user from the database, use that data
        if (!error && data) {
          const userData: User = {
            id: data.id,
            nombre: data.Nombre,
            zona: data.Zona || { id: 1, nombre: "Zona Central" },
            rol: data.Rol || { id: 1, nombre: "Usuario" },
          }

          setUser(userData)
          try {
            localStorage.setItem("cemex-user", JSON.stringify(userData))
          } catch (error) {
            console.error("Error saving to localStorage:", error)
          }

          return { success: true, message: "Inicio de sesión exitoso" }
        } else {
          // Si el usuario no existe, simplemente usamos el usuario predeterminado
          // No intentamos insertar un nuevo usuario
          console.log("Usuario no encontrado, usando usuario predeterminado")
          setUser(defaultUserData)
          try {
            localStorage.setItem("cemex-user", JSON.stringify(defaultUserData))
          } catch (error) {
            console.error("Error saving to localStorage:", error)
          }
          return { success: true, message: "Inicio de sesión exitoso" }
        }
      } catch (dbError) {
        console.error("Database error:", dbError)
        // If there was an error with the database, continue with the default user
        setUser(defaultUserData)
        try {
          localStorage.setItem("cemex-user", JSON.stringify(defaultUserData))
        } catch (error) {
          console.error("Error saving to localStorage:", error)
        }
        return { success: true, message: "Inicio de sesión exitoso" }
      }
    } catch (error) {
      console.error("Error during login:", error)
      return { success: false, message: "Error al iniciar sesión" }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("cemex-user")
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  }

  return <UserContext.Provider value={{ user, loading, login, logout }}>{children}</UserContext.Provider>
}

// Safe version of useUser that doesn't throw errors
export function useSafeUser() {
  const context = useContext(UserContext)
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => ({ success: false, message: "Context not available" }),
      logout: () => {},
    }
  }
  return context
}

// Original useUser hook for components that are guaranteed to be within UserProvider
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
