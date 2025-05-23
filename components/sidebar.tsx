"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth"
import { X, Home, FileText, LogOut, User, MapPin, DollarSign, Truck, Shield } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, getUserZone } = useAuth()

  const closeSidebar = () => setIsOpen(false)

  const handleLogout = async () => {
    try {
      await signOut()
      closeSidebar()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Cambiar el orden de los elementos del menú y eliminar "Historial de Altas de Precio"
  const menuItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/cotizacion-flete", label: "Cotización de Flete", icon: Truck },
    { href: "/generar-cotizacion", label: "Generar Cotización", icon: FileText },
    { href: "/nueva-cotizacion", label: "Alta de Precio", icon: DollarSign },
  ]

  const userZone = getUserZone()
  const userRole = user?.role?.Roles?.nombre
  const userName = user?.role?.nombre || 'Usuario'

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <Logo className="h-10" />
            <Button variant="ghost" size="icon" onClick={closeSidebar}>
              <X className="h-6 w-6" />
              <span className="sr-only">Cerrar menú</span>
            </Button>
          </div>

          {user && (
            <div className="p-6 border-b bg-gray-50">
              {/* Información Principal del Usuario */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#0001B5] p-3 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">{userName}</p>
                  <p className="text-sm text-gray-500">Bienvenido al sistema</p>
                </div>
              </div>
              
              {/* Información de Rol y Zona */}
              <div className="space-y-3">
                {userRole && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-[#0001B5]" />
                      <span className="text-sm font-semibold text-gray-700">ROL</span>
                    </div>
                    <Badge variant="default" className="bg-[#0001B5] text-white text-sm px-3 py-1">
                      {userRole}
                    </Badge>
                  </div>
                )}
                
                {userZone && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-[#FB2230]" />
                      <span className="text-sm font-semibold text-gray-700">ZONA DE TRABAJO</span>
                    </div>
                    <Badge variant="outline" className="border-[#FB2230] text-[#FB2230] text-sm px-3 py-1 bg-red-50">
                      {userZone.nombre}
                    </Badge>
                  </div>
                )}

                {/* Si no hay rol o zona, mostrar mensaje informativo */}
                {!userRole && !userZone && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-amber-600" />
                      <span className="text-sm text-amber-700">
                        Perfil en configuración
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Estado de conexión */}
              <div className="mt-4 flex items-center justify-center space-x-2 bg-green-50 p-2 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Sesión Activa</span>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href} onClick={closeSidebar}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                      isActive ? "bg-[#0001B5] text-white" : "hover:bg-slate-100",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-base">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-600 py-3" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={closeSidebar} />}
    </>
  )
}
