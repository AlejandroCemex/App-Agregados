"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { isAuthenticated, loading, signOut } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  // Función para ir al login limpiando cualquier sesión existente
  const handleOpenApp = async () => {
    try {
      // Siempre intentar cerrar sesión, independientemente del estado
      await signOut()
    } catch (error) {
      console.log('Error al cerrar sesión:', error)
    } finally {
      // Siempre ir al login
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0001B5] mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white p-4"
    >
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <Logo width={200} height={70} />
          </div>
          <h1 className="text-3xl font-bold text-[#0001B5] mb-4">App Agregados</h1>
          <p className="text-lg text-gray-600">Sistema de gestión de agregados</p>
        </div>

        <Button 
          onClick={handleOpenApp}
          className="w-full bg-[#0001B5] hover:bg-[#00018c] text-white text-lg py-3"
          size="lg"
        >
          Abrir App
        </Button>
      </div>
    </div>
  )
}
