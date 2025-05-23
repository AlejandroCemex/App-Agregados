"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useSafeUser } from "@/components/user-context"
import { X, Home, FileText, LogOut, User, MapPin, DollarSign, Truck } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  // Use the safe version of useUser that doesn't throw errors
  const { user, logout } = useSafeUser()

  const closeSidebar = () => setIsOpen(false)

  const handleLogout = () => {
    logout()
    closeSidebar()
    // Añadir redirección a la página de inicio
    window.location.href = "/"
  }

  // Cambiar el orden de los elementos del menú y eliminar "Historial de Altas de Precio"
  const menuItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/cotizacion-flete", label: "Cotización de Flete", icon: Truck },
    { href: "/generar-cotizacion", label: "Generar Cotización", icon: FileText },
    { href: "/nueva-cotizacion", label: "Alta de Precio", icon: DollarSign },
  ]

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
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-[#0001B5]" />
                </div>
                <div>
                  <p className="font-medium">{user.nombre || "Usuario"}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Zona: {user.zona?.nombre || "No especificada"}</span>
                  </div>
                </div>
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
