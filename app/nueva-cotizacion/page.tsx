"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Truck, ArrowLeft, Check, DollarSign, Search, History } from "lucide-react"
import Link from "next/link"
import { PageTitle } from "@/components/page-title"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

// Tipo para las altas de precio guardadas en el historial
type AltaPrecioGuardada = {
  id: string
  fecha: string
  tipo: "cantera-propia" | "terceros"
  cantera: string
  material: string
  precioUnitario: number
  estado: "pendiente" | "aprobada" | "rechazada" | "completada"
}

export default function NuevaCotizacion() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState<string | null>(null)

  // Estado para controlar la vista activa
  const [vistaActiva, setVistaActiva] = useState<"nueva" | "historial-cantera" | "historial-terceros">("nueva")

  // Estado para búsqueda en el historial
  const [searchTermHistorial, setSearchTermHistorial] = useState("")

  // Datos de ejemplo para el historial de altas de precio - Cantera Propia
  const [historialAltasCantera, setHistorialAltasCantera] = useState<AltaPrecioGuardada[]>([
    {
      id: "ALTA-2023-001",
      fecha: "2023-05-15",
      tipo: "cantera-propia",
      cantera: "Cantera Norte",
      material: "Grava 3/4",
      precioUnitario: 450,
      estado: "aprobada",
    },
    {
      id: "ALTA-2023-003",
      fecha: "2023-06-10",
      tipo: "cantera-propia",
      cantera: "Cantera Sur",
      material: "Piedra Triturada",
      precioUnitario: 520,
      estado: "completada",
    },
    {
      id: "ALTA-2023-005",
      fecha: "2023-07-05",
      tipo: "cantera-propia",
      cantera: "Cantera Este",
      material: "Arena Gruesa",
      precioUnitario: 390,
      estado: "aprobada",
    },
  ])

  // Datos de ejemplo para el historial de altas de precio - Terceros
  const [historialAltasTerceros, setHistorialAltasTerceros] = useState<AltaPrecioGuardada[]>([
    {
      id: "ALTA-2023-002",
      fecha: "2023-06-02",
      tipo: "terceros",
      cantera: "Proveedor Externo S.A.",
      material: "Arena Fina",
      precioUnitario: 380,
      estado: "pendiente",
    },
    {
      id: "ALTA-2023-004",
      fecha: "2023-06-18",
      tipo: "terceros",
      cantera: "Agregados del Norte",
      material: "Grava 1/2",
      precioUnitario: 410,
      estado: "rechazada",
    },
  ])

  // Filtrar altas de precio por término de búsqueda
  const filteredHistorialAltasCantera = historialAltasCantera.filter(
    (alta) =>
      alta.id.toLowerCase().includes(searchTermHistorial.toLowerCase()) ||
      alta.cantera.toLowerCase().includes(searchTermHistorial.toLowerCase()) ||
      alta.material.toLowerCase().includes(searchTermHistorial.toLowerCase()),
  )

  const filteredHistorialAltasTerceros = historialAltasTerceros.filter(
    (alta) =>
      alta.id.toLowerCase().includes(searchTermHistorial.toLowerCase()) ||
      alta.cantera.toLowerCase().includes(searchTermHistorial.toLowerCase()) ||
      alta.material.toLowerCase().includes(searchTermHistorial.toLowerCase()),
  )

  const handleSelectType = (type: string) => {
    setSelectedType(type)

    // Pequeña pausa para la animación antes de redirigir
    setTimeout(() => {
      if (type === "cantera-propia") {
        router.push("/nueva-cotizacion/cantera-propia")
      } else if (type === "terceros") {
        router.push("/nueva-cotizacion/terceros")
      }
    }, 300)
  }

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Alta de Precio"
        subtitle="Selecciona el tipo de alta de precio que deseas generar"
        icon={<DollarSign className="h-6 w-6" />}
        action={
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center rounded-full w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Volver al Menú Principal</span>
            </Button>
          </Link>
        }
      />

      {/* Pestañas de navegación con el mismo estilo que Generar Cotización */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setVistaActiva("nueva")}
          className={`py-3 px-6 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
            vistaActiva === "nueva" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
          }`}
          style={{
            borderBottom: vistaActiva === "nueva" ? "2px solid #0001B5" : "none",
            boxShadow: "none",
          }}
        >
          <DollarSign className="mr-2 h-5 w-5" />
          Nueva Alta
        </button>
        <button
          onClick={() => setVistaActiva("historial-cantera")}
          className={`py-3 px-6 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
            vistaActiva === "historial-cantera" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
          }`}
          style={{
            borderBottom: vistaActiva === "historial-cantera" ? "2px solid #0001B5" : "none",
            boxShadow: "none",
          }}
        >
          <History className="mr-2 h-5 w-5" />
          Historial Altas - Cantera Propia
        </button>
        <button
          onClick={() => setVistaActiva("historial-terceros")}
          className={`py-3 px-6 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
            vistaActiva === "historial-terceros" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
          }`}
          style={{
            borderBottom: vistaActiva === "historial-terceros" ? "2px solid #0001B5" : "none",
            boxShadow: "none",
          }}
        >
          <Truck className="mr-2 h-5 w-5" />
          Historial Altas - Terceros
        </button>
      </div>

      {vistaActiva === "nueva" ? (
        <motion.div className="mt-12" variants={containerVariants} initial="hidden" animate="visible">
          {/* Contenedor principal con efecto de perspectiva */}
          <div className="relative max-w-5xl mx-auto">
            {/* Elemento decorativo central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-[#0001B5]/20 to-[#FB2230]/20 rounded-full blur-xl -z-10"></div>

            {/* Línea conectora */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#0001B5]/30 via-[#FB2230]/30 to-[#0001B5]/30 transform -translate-y-1/2 rounded-full hidden md:block"></div>

            <motion.div className="grid md:grid-cols-2 gap-8 md:gap-16 relative">
              {/* Opción 1: Cantera Propia */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="relative"
              >
                <Card
                  className={`h-full transition-all cursor-pointer overflow-hidden relative group ${
                    selectedType === "cantera-propia"
                      ? "border-[#0001B5] shadow-lg"
                      : isHovering === "cantera-propia"
                        ? "border-2 border-[#0001B5]/40 shadow-md"
                        : "border-2 border-transparent hover:border-[#0001B5]/20"
                  }`}
                  onClick={() => handleSelectType("cantera-propia")}
                  onMouseEnter={() => setIsHovering("cantera-propia")}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#0001B5]/5 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FB2230]/5 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <CardContent className="p-8 flex flex-col items-center text-center h-full">
                    {/* Círculo con icono */}
                    <div
                      className={`
                      w-24 h-24 rounded-full flex items-center justify-center mb-6
                      ${
                        selectedType === "cantera-propia"
                          ? "bg-[#0001B5] text-white"
                          : "bg-[#0001B5]/10 text-[#0001B5] group-hover:bg-[#0001B5]/20"
                      }
                      transition-all duration-300
                    `}
                    >
                      <FileText className="h-10 w-10" />
                    </div>

                    {/* Título */}
                    <h3 className="text-2xl font-bold text-[#0001B5] mb-4">Cantera Propia</h3>

                    {/* Descripción */}
                    <p className="text-gray-600 mb-6">Alta de precio para materiales de canteras propias de Cemex</p>

                    {/* Botón */}
                    <div className="mt-auto">
                      <Button
                        className={`
                          rounded-full px-6 transition-all
                          ${
                            selectedType === "cantera-propia"
                              ? "bg-[#0001B5] hover:bg-[#00018c]"
                              : "bg-[#0001B5]/80 hover:bg-[#0001B5]"
                          }
                        `}
                      >
                        Seleccionar
                        {selectedType === "cantera-propia" && <Check className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Indicador de selección */}
                    {selectedType === "cantera-propia" && (
                      <div className="absolute top-4 right-4 bg-[#0001B5] text-white p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    {/* Barra de progreso */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FB2230] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </CardContent>
                </Card>

                {/* Número de paso */}
                <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-[#0001B5] flex items-center justify-center z-10 shadow-lg">
                  <span className="text-[#0001B5] font-bold">1</span>
                </div>
              </motion.div>

              {/* Opción 2: Terceros */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="relative"
              >
                <Card
                  className={`h-full transition-all cursor-pointer overflow-hidden relative group ${
                    selectedType === "terceros"
                      ? "border-[#0001B5] shadow-lg"
                      : isHovering === "terceros"
                        ? "border-2 border-[#0001B5]/40 shadow-md"
                        : "border-2 border-transparent hover:border-[#0001B5]/20"
                  }`}
                  onClick={() => handleSelectType("terceros")}
                  onMouseEnter={() => setIsHovering("terceros")}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 left-0 w-40 h-40 bg-[#0001B5]/5 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FB2230]/5 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <CardContent className="p-8 flex flex-col items-center text-center h-full">
                    {/* Círculo con icono */}
                    <div
                      className={`
                      w-24 h-24 rounded-full flex items-center justify-center mb-6
                      ${
                        selectedType === "terceros"
                          ? "bg-[#0001B5] text-white"
                          : "bg-[#0001B5]/10 text-[#0001B5] group-hover:bg-[#0001B5]/20"
                      }
                      transition-all duration-300
                    `}
                    >
                      <Truck className="h-10 w-10" />
                    </div>

                    {/* Título */}
                    <h3 className="text-2xl font-bold text-[#0001B5] mb-4">Terceros</h3>

                    {/* Descripción */}
                    <p className="text-gray-600 mb-6">Alta de precio para materiales de proveedores externos</p>

                    {/* Botón */}
                    <div className="mt-auto">
                      <Button
                        className={`
                          rounded-full px-6 transition-all
                          ${
                            selectedType === "terceros"
                              ? "bg-[#0001B5] hover:bg-[#00018c]"
                              : "bg-[#0001B5]/80 hover:bg-[#0001B5]"
                          }
                        `}
                      >
                        Seleccionar
                        {selectedType === "terceros" && <Check className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Indicador de selección */}
                    {selectedType === "terceros" && (
                      <div className="absolute top-4 right-4 bg-[#0001B5] text-white p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    {/* Barra de progreso */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FB2230] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </CardContent>
                </Card>

                {/* Número de paso */}
                <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-[#0001B5] flex items-center justify-center z-10 shadow-lg">
                  <span className="text-[#0001B5] font-bold">2</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ) : vistaActiva === "historial-cantera" ? (
        /* Vista de Historial de Altas de Precio - Cantera Propia */
        <div className="space-y-6">
          <Card className="shadow-sm overflow-hidden relative border-2 border-[#0001B5]/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar alta de precio..."
                      className="pl-9 h-10"
                      value={searchTermHistorial}
                      onChange={(e) => setSearchTermHistorial(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setVistaActiva("nueva")} className="bg-[#0001B5] hover:bg-[#00018c]">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Nueva Alta de Precio
                  </Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">ID</TableHead>
                        <TableHead className="text-center">Fecha</TableHead>
                        <TableHead className="text-center">Cantera</TableHead>
                        <TableHead className="text-center">Material</TableHead>
                        <TableHead className="text-center">Precio Unitario</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistorialAltasCantera.length > 0 ? (
                        filteredHistorialAltasCantera.map((alta) => (
                          <TableRow key={alta.id}>
                            <TableCell className="font-medium text-center">{alta.id}</TableCell>
                            <TableCell className="text-center">{alta.fecha}</TableCell>
                            <TableCell>{alta.cantera}</TableCell>
                            <TableCell>{alta.material}</TableCell>
                            <TableCell className="text-center font-medium">
                              {formatCurrency(alta.precioUnitario)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`
                                  ${
                                    alta.estado === "aprobada"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : alta.estado === "pendiente"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : alta.estado === "rechazada"
                                          ? "bg-red-50 text-red-700 border-red-200"
                                          : "bg-blue-50 text-blue-700 border-blue-200"
                                  }
                                  rounded-full px-2 py-0.5 text-xs
                                `}
                              >
                                {alta.estado.charAt(0).toUpperCase() + alta.estado.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-2">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Ver</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No se encontraron altas de precio para cantera propia
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Vista de Historial de Altas de Precio - Terceros */
        <div className="space-y-6">
          <Card className="shadow-sm overflow-hidden relative border-2 border-[#0001B5]/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar alta de precio..."
                      className="pl-9 h-10"
                      value={searchTermHistorial}
                      onChange={(e) => setSearchTermHistorial(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setVistaActiva("nueva")} className="bg-[#0001B5] hover:bg-[#00018c]">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Nueva Alta de Precio
                  </Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">ID</TableHead>
                        <TableHead className="text-center">Fecha</TableHead>
                        <TableHead className="text-center">Proveedor</TableHead>
                        <TableHead className="text-center">Material</TableHead>
                        <TableHead className="text-center">Precio Unitario</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistorialAltasTerceros.length > 0 ? (
                        filteredHistorialAltasTerceros.map((alta) => (
                          <TableRow key={alta.id}>
                            <TableCell className="font-medium text-center">{alta.id}</TableCell>
                            <TableCell className="text-center">{alta.fecha}</TableCell>
                            <TableCell>{alta.cantera}</TableCell>
                            <TableCell>{alta.material}</TableCell>
                            <TableCell className="text-center font-medium">
                              {formatCurrency(alta.precioUnitario)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`
                                  ${
                                    alta.estado === "aprobada"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : alta.estado === "pendiente"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : alta.estado === "rechazada"
                                          ? "bg-red-50 text-red-700 border-red-200"
                                          : "bg-blue-50 text-blue-700 border-blue-200"
                                  }
                                  rounded-full px-2 py-0.5 text-xs
                                `}
                              >
                                {alta.estado.charAt(0).toUpperCase() + alta.estado.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-2">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Ver</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No se encontraron altas de precio para terceros
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
