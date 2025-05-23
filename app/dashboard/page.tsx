"use client"

import { useRouter } from "next/navigation"
import { PageTitle } from "@/components/page-title"
import { FileText, Home, DollarSign, Truck, LogOut, User, Shield, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, loading, signOut, hasRole, getUserZone } = useAuth()
  const [activeStep, setActiveStep] = useState<number | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const menuItems = [
    {
      id: 1,
      title: "Cotización de Flete",
      description: "Crear cotizaciones de flete para clientes",
      path: "/cotizacion-flete",
      icon: <Truck className="h-6 w-6" />,
    },
    {
      id: 2,
      title: "Generar Cotización",
      description: "Crear cotizaciones para clientes",
      path: "/generar-cotizacion",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      id: 3,
      title: "Alta de Precio",
      description: "Crear una nueva alta de precio",
      path: "/nueva-cotizacion",
      icon: <DollarSign className="h-6 w-6" />,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0001B5] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect to login
  }

  const userZone = getUserZone()

  return (
    <div className="space-y-8">
      {/* User info section */}
      <Card className="bg-gradient-to-r from-[#0001B5] to-[#0001B5]/80 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-white">
                  Bienvenido, {user.role?.nombre || user.email}
                </CardTitle>
                <CardDescription className="text-white/80">
                  Sesión iniciada correctamente
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">Email: {user.email}</span>
            </div>
            {user.role?.Roles && (
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {user.role.Roles.nombre}
                </Badge>
              </div>
            )}
            {userZone && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <Badge variant="outline" className="border-white/20 text-white">
                  {userZone.nombre}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PageTitle
        title="Menú Principal"
        subtitle="En esta plataforma tendrá la posibilidad de generar las altas de precios y las cotizaciones del sector de agregados"
        icon={<Home className="h-6 w-6" />}
      />

      <div className="mt-12 relative">
        {/* Contenedor principal del flujo */}
        <div className="relative py-8">
          {/* Línea central del flujo - visible solo en pantallas medianas y grandes */}
          <div className="absolute top-0 left-1/2 h-full w-2 bg-gradient-to-b from-[#0001B5] to-[#FB2230] transform -translate-x-1/2 rounded-full md:block hidden"></div>

          {/* Línea vertical para móviles - visible solo en pantallas pequeñas */}
          <div className="absolute top-0 left-6 h-full w-2 bg-gradient-to-b from-[#0001B5] to-[#FB2230] rounded-full md:hidden"></div>

          {menuItems.map((item, index) => (
            <div key={item.id} className="relative mb-20 last:mb-0">
              {/* Nodo en la línea de tiempo - posición diferente en móvil */}
              <div className="absolute top-0 md:left-1/2 left-6 w-12 h-12 bg-white border-4 border-[#0001B5] rounded-full transform md:-translate-x-1/2 -translate-x-1/2 z-10 shadow-md flex items-center justify-center">
                <span className="text-[#0001B5] font-bold">{item.id}</span>
              </div>

              {/* Tarjeta del paso - en móvil siempre a la derecha, en desktop alternando */}
              <div
                className={`flex ${
                  // En móvil siempre a la derecha de la línea, en desktop alternando como antes
                  index % 2 === 0
                    ? "md:justify-end md:pr-[calc(50%+1rem)] justify-start pl-16"
                    : "md:justify-start md:pl-[calc(50%+1rem)] justify-start pl-16"
                } mt-5`}
              >
                {/* Tarjeta */}
                <div
                  className={`
                    w-full md:w-[calc(100%-2rem)] bg-white rounded-lg shadow-lg overflow-hidden 
                    border-2 transition-all duration-300 cursor-pointer
                    ${activeStep === item.id ? "border-[#FB2230] shadow-xl scale-[1.02]" : "border-transparent"}
                  `}
                  onMouseEnter={() => setActiveStep(item.id)}
                  onMouseLeave={() => setActiveStep(null)}
                  onClick={() => router.push(item.path)}
                >
                  {/* Encabezado */}
                  <div className="bg-gradient-to-r from-[#0001B5] to-[#0001B5]/80 p-4">
                    <h3 className="text-xl font-bold text-white truncate">{item.title}</h3>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 flex items-center">
                    <div
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                      ${activeStep === item.id ? "bg-[#FB2230] text-white" : "bg-gray-100 text-[#0001B5]"}
                      transition-all duration-300
                    `}
                    >
                      {item.icon}
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </div>

                  {/* Indicador de progreso */}
                  <div className="w-full h-1 bg-gray-200">
                    <div
                      className="h-full bg-[#FB2230] transition-all duration-500"
                      style={{ width: activeStep === item.id ? "100%" : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
