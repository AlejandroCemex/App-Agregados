"use client"

import { useRouter } from "next/navigation"
import { PageTitle } from "@/components/page-title"
import { FileText, Home, DollarSign, Truck } from "lucide-react"
import { useSafeUser } from "@/components/user-context"
import { useState } from "react"

export default function Dashboard() {
  const router = useRouter()
  const { user } = useSafeUser()
  const [activeStep, setActiveStep] = useState<number | null>(null)

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

  return (
    <div className="space-y-8">
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
