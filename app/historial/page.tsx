"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Search, Plus, Eye, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Función para formatear fechas
function formatearFecha(fecha: Date): string {
  const opciones: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }
  return new Intl.DateTimeFormat("es-MX", opciones).format(fecha)
}

// Tipos de datos
type AltaPrecio = {
  id: string
  fecha: Date
  tipo: "Cantera Propia" | "Terceros"
  cliente: string
  // Campos específicos de Cantera Propia
  cantera?: string
  material?: string
  // Campos específicos de Terceros
  cedis?: string
  articulo?: string
  // Campos comunes
  estado: "Aprobada" | "Pendiente" | "Rechazada"
  total: string
  usuario: string
}

export default function HistorialPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<"Todos" | "Cantera Propia" | "Terceros">("Todos")

  // Datos de ejemplo
  const altasPrecios: AltaPrecio[] = [
    {
      id: "AP-2023-001",
      fecha: new Date(2023, 4, 15),
      tipo: "Cantera Propia",
      cliente: "Constructora ABC",
      cantera: "Cantera Norte",
      material: "Grava 3/4",
      estado: "Aprobada",
      total: "$45,200.00",
      usuario: "Juan Pérez",
    },
    {
      id: "AP-2023-002",
      fecha: new Date(2023, 5, 2),
      tipo: "Terceros",
      cliente: "Desarrollos XYZ",
      cedis: "CEDIS Sur",
      articulo: "Cemento Portland Tipo I",
      estado: "Pendiente",
      total: "$32,800.00",
      usuario: "María López",
    },
    {
      id: "AP-2023-003",
      fecha: new Date(2023, 5, 10),
      tipo: "Cantera Propia",
      cliente: "Inmobiliaria 123",
      cantera: "Cantera Este",
      material: "Arena Fina",
      estado: "Aprobada",
      total: "$28,350.00",
      usuario: "Carlos Rodríguez",
    },
    {
      id: "AP-2023-004",
      fecha: new Date(2023, 5, 18),
      tipo: "Terceros",
      cliente: "Constructora DEF",
      cedis: "CEDIS Norte",
      articulo: "Mortero",
      estado: "Rechazada",
      total: "$17,200.00",
      usuario: "Ana Martínez",
    },
    {
      id: "AP-2023-005",
      fecha: new Date(2023, 6, 5),
      tipo: "Cantera Propia",
      cliente: "Proyectos Urbanos",
      cantera: "Cantera Oeste",
      material: "Piedra Triturada",
      estado: "Aprobada",
      total: "$52,500.00",
      usuario: "Roberto Sánchez",
    },
    {
      id: "AP-2023-006",
      fecha: new Date(2023, 6, 12),
      tipo: "Terceros",
      cliente: "Constructora GHI",
      cedis: "CEDIS Este",
      articulo: "Cemento Portland Tipo II",
      estado: "Pendiente",
      total: "$41,300.00",
      usuario: "Laura Gómez",
    },
    {
      id: "AP-2023-007",
      fecha: new Date(2023, 6, 20),
      tipo: "Cantera Propia",
      cliente: "Desarrolladora JKL",
      cantera: "Cantera Sur",
      material: "Grava 1/2",
      estado: "Aprobada",
      total: "$38,750.00",
      usuario: "Pedro Díaz",
    },
    {
      id: "AP-2023-008",
      fecha: new Date(2023, 7, 3),
      tipo: "Terceros",
      cliente: "Inmobiliaria MNO",
      cedis: "CEDIS Central",
      articulo: "Concreto Premezclado",
      estado: "Rechazada",
      total: "$63,200.00",
      usuario: "Sofía Hernández",
    },
  ]

  // Filtrar altas de precio por término de búsqueda y tipo
  const filteredAltas = altasPrecios.filter((alta) => {
    const matchesSearch =
      alta.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alta.tipo === "Cantera Propia" &&
        (alta.cantera?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alta.material?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (alta.tipo === "Terceros" &&
        (alta.cedis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alta.articulo?.toLowerCase().includes(searchTerm.toLowerCase())))

    const matchesTipo = filtroTipo === "Todos" || alta.tipo === filtroTipo

    return matchesSearch && matchesTipo
  })

  return (
    <div className="space-y-8">
      <PageTitle
        title="Historial de Altas de Precio"
        subtitle="Consulta y gestiona todas las altas de precio"
        icon={<FileText className="h-6 w-6" />}
        action={
          <Link href="/nueva-cotizacion">
            <Button className="bg-[#0001B5] hover:bg-[#00018c] rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Alta de Precio
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por ID, cliente, material, artículo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filtroTipo === "Todos" ? "Todos los tipos" : filtroTipo}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFiltroTipo("Todos")}>Todos los tipos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Cantera Propia")}>Cantera Propia</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Terceros")}>Terceros</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Filtrar por fecha
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Fecha</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-center">Cliente</TableHead>
                  <TableHead className="text-center">Detalle</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Usuario</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAltas.length > 0 ? (
                  filteredAltas.map((alta) => (
                    <TableRow key={alta.id}>
                      <TableCell className="font-medium text-center">{alta.id}</TableCell>
                      <TableCell className="text-center">{formatearFecha(alta.fecha)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              alta.tipo === "Cantera Propia"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }
                            rounded-full px-2 py-0.5
                          `}
                        >
                          {alta.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{alta.cliente}</TableCell>
                      <TableCell className="text-center">
                        {alta.tipo === "Cantera Propia"
                          ? `${alta.cantera} - ${alta.material}`
                          : `${alta.cedis} - ${alta.articulo}`}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              alta.estado === "Aprobada"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : alta.estado === "Pendiente"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }
                            rounded-full px-2 py-0.5
                          `}
                        >
                          {alta.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{alta.total}</TableCell>
                      <TableCell className="text-center">{alta.usuario}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => router.push(`/historial/${alta.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-muted-foreground">No se encontraron altas de precio</p>
                        <Link href="/nueva-cotizacion">
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Crear nueva alta de precio
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
