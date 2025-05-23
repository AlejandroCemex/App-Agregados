"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/user-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Building,
  Package,
  Truck,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Store,
  MapPin,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { PageTitle } from "@/components/page-title"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Función para formatear fechas sin depender de date-fns
function formatearFecha(fecha: Date): string {
  const opciones: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }
  return new Intl.DateTimeFormat("es-MX", opciones).format(fecha)
}

type OrgVentas = {
  id: number
  nombre: string
}

type CEDIS = {
  id: number
  nombre: string
  org_ventas_id: number
}

type SF = {
  id: number
  nombre: string
  cedis_id: number
}

type Articulo = {
  id: number
  codigo: string
  descripcion: string
}

type ProductoItem = {
  id: string
  articulo_id: number
  descripcion: string
  peso_volumetrico: number // Cambiado de precio_venta a peso_volumetrico
  precio_llegar: number // Nuevo campo para precio a llegar
  modalidad: string
  incluye_flete: boolean
  valor_flete: number | null
  // Nuevos campos para el flete
  tipoFlete?: "tonelada" | "viaje" | "cotizacion"
  cotizacionFleteId?: string
  toneladas_promedio?: number | null
  costo_flete_tonelada?: number | null
}

type CotizacionFlete = {
  id: string
  fecha: Date
  ubicacionSuministro: string
  ubicacionProyecto: string
  idMaterial: string
  estado: "pendiente" | "aprobada" | "rechazada" | "completada" | "validado"
  precio?: string
  tiempoRespuesta?: string
}

type Cotizacion = {
  id: string
  fecha: Date
  cliente: string
  tipo: string
  estado: string
  total: string
}

export default function TercerosPage() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // Estado para el diálogo de vincular cotización
  const [vincularCotizacionOpen, setVincularCotizacionOpen] = useState(false)

  // Estado para las cotizaciones
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([
    {
      id: "COT-2023-001",
      fecha: new Date(2023, 4, 15),
      cliente: "Constructora ABC",
      tipo: "Terceros",
      estado: "Aprobada",
      total: "$45,200.00",
    },
    {
      id: "COT-2023-002",
      fecha: new Date(2023, 5, 2),
      cliente: "Desarrollos XYZ",
      tipo: "Terceros",
      estado: "Pendiente",
      total: "$32,800.00",
    },
    {
      id: "COT-2023-003",
      fecha: new Date(2023, 5, 10),
      cliente: "Inmobiliaria 123",
      tipo: "Terceros",
      estado: "Aprobada",
      total: "$28,350.00",
    },
    {
      id: "COT-2023-004",
      fecha: new Date(2023, 5, 18),
      cliente: "Constructora DEF",
      tipo: "Terceros",
      estado: "Rechazada",
      total: "$17,200.00",
    },
    {
      id: "COT-2023-005",
      fecha: new Date(2023, 6, 5),
      cliente: "Proyectos Urbanos",
      tipo: "Terceros",
      estado: "Aprobada",
      total: "$52,500.00",
    },
  ])

  // Form state
  const [orgVentas, setOrgVentas] = useState<OrgVentas[]>([])
  const [cedisList, setCedisList] = useState<CEDIS[]>([])
  const [sfList, setSfList] = useState<SF[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])

  // Form values
  const [orgVentasId, setOrgVentasId] = useState<number | null>(null)
  const [cedisId, setCedisId] = useState<number | null>(null)
  const [nombreCedis, setNombreCedis] = useState("")
  const [sfId, setSfId] = useState<number | null>(null)
  const [nombreSf, setNombreSf] = useState("")
  const [numeroPlanta, setNumeroPlanta] = useState("")
  const [nombrePlanta, setNombrePlanta] = useState("")

  // Products list
  const [productos, setProductos] = useState<ProductoItem[]>([])

  // Expanded products state
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({})

  // Tab state
  const [activeTab, setActiveTab] = useState<"informacion" | "productos">("informacion")

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para las cotizaciones de flete
  const [cotizacionesFlete, setCotizacionesFlete] = useState<CotizacionFlete[]>([
    {
      id: "COT-001",
      fecha: new Date(2023, 4, 15),
      ubicacionSuministro: "CEDIS Norte, Km 34",
      ubicacionProyecto: "Zona Industrial, Sector 3",
      idMaterial: "ART-001",
      estado: "validado",
      precio: "$5,200.00",
      tiempoRespuesta: "3 días",
    },
    {
      id: "COT-002",
      fecha: new Date(2023, 5, 2),
      ubicacionSuministro: "CEDIS Sur, Km 12",
      ubicacionProyecto: "Residencial Las Palmas",
      idMaterial: "ART-003",
      estado: "validado",
      precio: "$4,800.00",
      tiempoRespuesta: "2 días",
    },
    {
      id: "COT-003",
      fecha: new Date(2023, 5, 10),
      ubicacionSuministro: "CEDIS Este, Km 45",
      ubicacionProyecto: "Centro Comercial Plaza Mayor",
      idMaterial: "ART-002",
      estado: "validado",
      precio: "$6,350.00",
      tiempoRespuesta: "1 día",
    },
    {
      id: "COT-004",
      fecha: new Date(2023, 5, 18),
      ubicacionSuministro: "CEDIS Oeste, Km 22",
      ubicacionProyecto: "Hospital Regional",
      idMaterial: "ART-005",
      estado: "validado",
      precio: "$7,200.00",
      tiempoRespuesta: "4 días",
    },
    {
      id: "COT-005",
      fecha: new Date(2023, 6, 5),
      ubicacionSuministro: "CEDIS Central, Km 8",
      ubicacionProyecto: "Edificio Corporativo",
      idMaterial: "ART-007",
      estado: "validado",
      precio: "$12,500.00",
      tiempoRespuesta: "1 día",
    },
  ])

  // Estado para búsqueda de cotizaciones de flete
  const [searchTermFlete, setSearchTermFlete] = useState("")
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null)

  // Estado para búsqueda de cotizaciones
  const [searchTermCotizacion, setSearchTermCotizacion] = useState("")

  // Filtrar cotizaciones por término de búsqueda
  const filteredCotizaciones = cotizaciones.filter(
    (cotizacion) =>
      cotizacion.id.toLowerCase().includes(searchTermCotizacion.toLowerCase()) ||
      cotizacion.cliente.toLowerCase().includes(searchTermCotizacion.toLowerCase()) ||
      cotizacion.tipo.toLowerCase().includes(searchTermCotizacion.toLowerCase()),
  )

  // Filtrar cotizaciones de flete por término de búsqueda
  const filteredCotizacionesFlete = cotizacionesFlete.filter(
    (cotizacion) =>
      cotizacion.id.toLowerCase().includes(searchTermFlete.toLowerCase()) ||
      cotizacion.ubicacionSuministro.toLowerCase().includes(searchTermFlete.toLowerCase()) ||
      cotizacion.ubicacionProyecto.toLowerCase().includes(searchTermFlete.toLowerCase()) ||
      cotizacion.idMaterial.toLowerCase().includes(searchTermFlete.toLowerCase()),
  )

  // Toggle product expansion
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (!user) return

        // Simulación de carga de datos desde Supabase
        // En un entorno real, estos serían llamados a la API de Supabase

        // Org de Ventas
        setOrgVentas([
          { id: 1, nombre: "Org. Ventas Norte" },
          { id: 2, nombre: "Org. Ventas Sur" },
          { id: 3, nombre: "Org. Ventas Este" },
          { id: 4, nombre: "Org. Ventas Oeste" },
          { id: 5, nombre: "Org. Ventas Central" },
        ])

        // Artículos
        setArticulos([
          { id: 1, codigo: "ART-001", descripcion: "Cemento Portland Tipo I" },
          { id: 2, codigo: "ART-002", descripcion: "Cemento Portland Tipo II" },
          { id: 3, codigo: "ART-003", descripcion: "Cemento Portland Tipo III" },
          { id: 4, codigo: "ART-004", descripcion: "Cemento Portland Tipo IV" },
          { id: 5, codigo: "ART-005", descripcion: "Cemento Portland Tipo V" },
          { id: 6, codigo: "ART-006", descripcion: "Mortero" },
          { id: 7, codigo: "ART-007", descripcion: "Concreto Premezclado" },
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  // Cargar CEDIS cuando cambia Org de Ventas
  useEffect(() => {
    if (orgVentasId) {
      // Simulación de carga de CEDIS desde Supabase
      const cedisMock = [
        { id: 1, nombre: "CEDIS Norte 1", org_ventas_id: 1 },
        { id: 2, nombre: "CEDIS Norte 2", org_ventas_id: 1 },
        { id: 3, nombre: "CEDIS Sur 1", org_ventas_id: 2 },
        { id: 4, nombre: "CEDIS Sur 2", org_ventas_id: 2 },
        { id: 5, nombre: "CEDIS Este 1", org_ventas_id: 3 },
        { id: 6, nombre: "CEDIS Oeste 1", org_ventas_id: 4 },
        { id: 7, nombre: "CEDIS Central 1", org_ventas_id: 5 },
      ]

      setCedisList(cedisMock.filter((cedis) => cedis.org_ventas_id === orgVentasId))
      setCedisId(null)
      setNombreCedis("")
      setSfId(null)
      setNombreSf("")
    }
  }, [orgVentasId])

  // Cargar SF cuando cambia CEDIS
  useEffect(() => {
    if (cedisId) {
      // Simulación de carga de SF desde Supabase
      const sfMock = [
        { id: 1, nombre: "SF Norte 1-A", cedis_id: 1 },
        { id: 2, nombre: "SF Norte 1-B", cedis_id: 1 },
        { id: 3, nombre: "SF Norte 2-A", cedis_id: 2 },
        { id: 4, nombre: "SF Sur 1-A", cedis_id: 3 },
        { id: 5, nombre: "SF Sur 2-A", cedis_id: 4 },
        { id: 6, nombre: "SF Este 1-A", cedis_id: 5 },
        { id: 7, nombre: "SF Oeste 1-A", cedis_id: 6 },
        { id: 8, nombre: "SF Central 1-A", cedis_id: 7 },
      ]

      setSfList(sfMock.filter((sf) => sf.cedis_id === cedisId))

      // Actualizar nombre CEDIS
      const cedisSeleccionado = cedisList.find((c) => c.id === cedisId)
      if (cedisSeleccionado) {
        setNombreCedis(cedisSeleccionado.nombre)
      }

      setSfId(null)
      setNombreSf("")
    }
  }, [cedisId, cedisList])

  // Actualizar nombre SF cuando cambia SF
  useEffect(() => {
    if (sfId) {
      const sfSeleccionado = sfList.find((s) => s.id === sfId)
      if (sfSeleccionado) {
        setNombreSf(sfSeleccionado.nombre)
      }
    }
  }, [sfId, sfList])

  const addProducto = () => {
    const newProducto: ProductoItem = {
      id: Date.now().toString(),
      articulo_id: 0,
      descripcion: "",
      peso_volumetrico: 0, // Cambiado de precio_venta a peso_volumetrico
      precio_llegar: 0, // Nuevo campo
      modalidad: "Recogido",
      incluye_flete: false,
      valor_flete: null,
    }

    // Set the new product as expanded by default
    setExpandedProducts((prev) => ({
      ...prev,
      [newProducto.id]: true,
    }))

    setProductos([...productos, newProducto])
  }

  // Función para seleccionar una cotización de flete
  const selectCotizacionFlete = (cotizacionFlete: any, productoIndex: number) => {
    if (!cotizacionFlete.precio) {
      toast({
        title: "Error",
        description: "Esta cotización no tiene un precio asignado",
        variant: "destructive",
      })
      return
    }

    // Extraer el valor numérico del precio (quitar el símbolo $ y las comas)
    const precioNumerico = Number.parseFloat(cotizacionFlete.precio.replace(/[$,]/g, ""))

    setProductos((prev) => {
      const updatedProductos = [...prev]
      updatedProductos[productoIndex] = {
        ...updatedProductos[productoIndex],
        tipoFlete: "cotizacion",
        valor_flete: precioNumerico,
        cotizacionFleteId: cotizacionFlete.id,
      }
      return updatedProductos
    })

    toast({
      title: "Cotización de flete seleccionada",
      description: `Se ha cargado el precio de la cotización ${cotizacionFlete.id}`,
    })
  }

  const removeProducto = (id: string) => {
    setProductos(productos.filter((p) => p.id !== id))

    // Remove from expanded state
    setExpandedProducts((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const updateProducto = (id: string, field: keyof ProductoItem, value: any) => {
    setProductos(
      productos.map((p) => {
        if (p.id === id) {
          // Si estamos cambiando incluye_flete a false, resetear los valores relacionados con el flete
          if (field === "incluye_flete" && value === false) {
            return {
              ...p,
              [field]: value,
              valor_flete: null,
              tipoFlete: undefined,
              cotizacionFleteId: undefined,
            }
          }

          // Si estamos cambiando el tipo de flete, resetear valores específicos
          if (field === "tipoFlete") {
            if (value === "tonelada") {
              return {
                ...p,
                [field]: value,
                cotizacionFleteId: undefined,
              }
            } else if (value === "viaje") {
              return {
                ...p,
                [field]: value,
                cotizacionFleteId: undefined,
              }
            } else if (value === "cotizacion") {
              return {
                ...p,
                [field]: value,
                valor_flete: null,
              }
            }
          }

          // Si estamos cambiando el artículo, actualizar la descripción
          if (field === "articulo_id") {
            const articuloSeleccionado = articulos.find((a) => a.id === value)
            return {
              ...p,
              [field]: value,
              descripcion: articuloSeleccionado ? articuloSeleccionado.descripcion : "",
            }
          }

          return { ...p, [field]: value }
        }
        return p
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar una cotización",
        variant: "destructive",
      })
      return
    }

    if (productos.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un producto a la cotización",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!orgVentasId || !cedisId || !sfId || !numeroPlanta || !nombrePlanta) {
      toast({
        title: "Error",
        description: "Todos los campos de información general son obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validate required fields for products
    for (const producto of productos) {
      if (!producto.articulo_id || !producto.peso_volumetrico || !producto.precio_llegar) {
        toast({
          title: "Error",
          description: "Todos los productos deben tener artículo, peso volumétrico y precio a llegar",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Simulación de guardado en Supabase
      // En un entorno real, estos serían llamados a la API de Supabase

      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Éxito",
        description: "Cotización guardada correctamente",
      })

      router.push("/historial")
    } catch (error) {
      console.error("Error saving cotización:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la cotización",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a default product if none exists
  useEffect(() => {
    if (productos.length === 0 && !isLoading) {
      addProducto()
    }
  }, [isLoading, productos.length])

  // Initialize expanded state for products
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {}
    productos.forEach((producto) => {
      // If not in state yet, set to expanded by default
      if (expandedProducts[producto.id] === undefined) {
        initialExpandedState[producto.id] = true
      }
    })

    if (Object.keys(initialExpandedState).length > 0) {
      setExpandedProducts((prev) => ({
        ...prev,
        ...initialExpandedState,
      }))
    }
  }, [productos, expandedProducts])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#0001B5] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Nueva Alta de Precio - Terceros"
        subtitle="Completa el formulario para generar una cotización de terceros"
        icon={<FileText className="h-6 w-6" />}
        action={
          <Link href="/nueva-cotizacion">
            <Button variant="outline" className="flex items-center rounded-full w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Volver</span>
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <div className="flex justify-end mb-4">
          <Dialog open={vincularCotizacionOpen} onOpenChange={setVincularCotizacionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center rounded-full">
                <FileText className="mr-2 h-4 w-4" />
                Vincular Cotización
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Historial de Cotizaciones</DialogTitle>
                <DialogDescription>Selecciona una cotización para vincular a esta alta de precio</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar cotización..."
                    className="pl-9 h-10"
                    value={searchTermCotizacion}
                    onChange={(e) => setSearchTermCotizacion(e.target.value)}
                  />
                </div>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">ID</TableHead>
                        <TableHead className="text-center">Fecha</TableHead>
                        <TableHead className="text-center">Cliente</TableHead>
                        <TableHead className="text-center">Tipo</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCotizaciones.length > 0 ? (
                        filteredCotizaciones.map((cotizacion) => (
                          <TableRow key={cotizacion.id}>
                            <TableCell className="font-medium">{cotizacion.id}</TableCell>
                            <TableCell>{formatearFecha(cotizacion.fecha)}</TableCell>
                            <TableCell>{cotizacion.cliente}</TableCell>
                            <TableCell>{cotizacion.tipo}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`
                          ${
                            cotizacion.estado === "Aprobada"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : cotizacion.estado === "Pendiente"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          }
                          rounded-full px-2 py-0.5 text-xs
                        `}
                              >
                                {cotizacion.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>{cotizacion.total}</TableCell>
                            <TableCell>
                              <DialogClose asChild>
                                <Button variant="outline" size="sm">
                                  Seleccionar
                                </Button>
                              </DialogClose>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No se encontraron cotizaciones
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border-b">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("informacion")}
              className={`py-3 px-4 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
                activeTab === "informacion" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
              }`}
              style={{
                borderBottom: activeTab === "informacion" ? "2px solid #0001B5" : "none",
                boxShadow: "none",
              }}
            >
              <Building className="mr-2 h-5 w-5" />
              Información General
            </button>
            <button
              onClick={() => setActiveTab("productos")}
              className={`py-3 px-4 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
                activeTab === "productos" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
              }`}
              style={{
                borderBottom: activeTab === "productos" ? "2px solid #0001B5" : "none",
                boxShadow: "none",
              }}
            >
              <Package className="mr-2 h-5 w-5" />
              Productos
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {activeTab === "informacion" && (
          <Card className="border-2 border-[#0001B5]/30 transition-all duration-300 hover:border-[#0001B5]/50 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="mr-2 h-5 w-5 text-[#0001B5]" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                    Org de Ventas
                  </Label>
                  <Select
                    value={orgVentasId?.toString() || ""}
                    onValueChange={(value) => setOrgVentasId(Number.parseInt(value))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar Org de Ventas" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgVentas.map((org) => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          {org.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center">
                    <Store className="h-4 w-4 mr-2 text-slate-500" />
                    CEDIS
                  </Label>
                  <Select
                    value={cedisId?.toString() || ""}
                    onValueChange={(value) => setCedisId(Number.parseInt(value))}
                    disabled={!orgVentasId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar CEDIS" />
                    </SelectTrigger>
                    <SelectContent>
                      {cedisList.map((cedis) => (
                        <SelectItem key={cedis.id} value={cedis.id.toString()}>
                          {cedis.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="nombreCedis" className="text-base">
                    Nombre CEDIS
                  </Label>
                  <Input
                    id="nombreCedis"
                    value={nombreCedis}
                    onChange={(e) => setNombreCedis(e.target.value)}
                    placeholder="Nombre del CEDIS"
                    className="h-11"
                    required
                    disabled={!cedisId}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                    SF
                  </Label>
                  <Select
                    value={sfId?.toString() || ""}
                    onValueChange={(value) => setSfId(Number.parseInt(value))}
                    disabled={!cedisId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar SF" />
                    </SelectTrigger>
                    <SelectContent>
                      {sfList.map((sf) => (
                        <SelectItem key={sf.id} value={sf.id.toString()}>
                          {sf.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="nombreSf" className="text-base">
                    Nombre SF
                  </Label>
                  <Input
                    id="nombreSf"
                    value={nombreSf}
                    onChange={(e) => setNombreSf(e.target.value)}
                    placeholder="Nombre del SF"
                    className="h-11"
                    required
                    disabled={!sfId}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="numeroPlanta" className="text-base">
                    No. Planta / Obra / Frente
                  </Label>
                  <Input
                    id="numeroPlanta"
                    value={numeroPlanta}
                    onChange={(e) => setNumeroPlanta(e.target.value)}
                    placeholder="Número de planta, obra o frente"
                    className="h-11"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="nombrePlanta" className="text-base">
                    Nombre Planta / Obra / Frente
                  </Label>
                  <Input
                    id="nombrePlanta"
                    value={nombrePlanta}
                    onChange={(e) => setNombrePlanta(e.target.value)}
                    placeholder="Nombre de planta, obra o frente"
                    className="h-11"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "productos" && (
          <Card className="border-2 border-[#0001B5]/30 transition-all duration-300 hover:border-[#0001B5]/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2 h-5 w-5 text-[#0001B5]" />
                Productos
              </CardTitle>
              <Button type="button" variant="outline" onClick={addProducto} className="flex items-center rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Versión móvil - Productos como tarjetas */}
              <div className="md:hidden space-y-6">
                {productos.map((producto, index) => (
                  <div key={producto.id} className="border rounded-lg p-4 space-y-4">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleProductExpansion(producto.id)}
                    >
                      <h3 className="font-medium flex items-center">
                        <Package className="h-4 w-4 mr-2 text-[#0001B5]" />
                        Producto {index + 1}
                      </h3>
                      <div className="flex items-center">
                        {productos.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeProducto(producto.id)
                            }}
                            className="text-red-500 h-8 w-8 p-0 mr-2 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {expandedProducts[producto.id] ? (
                          <ChevronUp className="h-5 w-5 text-[#0001B5]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[#0001B5]" />
                        )}
                      </div>
                    </div>

                    {expandedProducts[producto.id] && (
                      <>
                        <Separator />

                        {/* Artículo */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <Package className="h-4 w-4 mr-2 text-slate-500" />
                            Artículo
                          </Label>
                          <Select
                            value={producto.articulo_id.toString()}
                            onValueChange={(value) =>
                              updateProducto(producto.id, "articulo_id", Number.parseInt(value))
                            }
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Seleccionar artículo" />
                            </SelectTrigger>
                            <SelectContent>
                              {articulos.map((articulo) => (
                                <SelectItem key={articulo.id} value={articulo.id.toString()}>
                                  {articulo.codigo} - {articulo.descripcion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Descripción del artículo */}
                        <div className="space-y-2">
                          <Label htmlFor={`descripcion-${producto.id}`} className="text-sm font-medium">
                            Descripción del artículo
                          </Label>
                          <Input
                            id={`descripcion-${producto.id}`}
                            value={producto.descripcion}
                            onChange={(e) => updateProducto(producto.id, "descripcion", e.target.value)}
                            placeholder="Descripción del artículo"
                            className="h-10 text-sm"
                            disabled
                          />
                        </div>

                        {/* Peso Volumétrico */}
                        <div className="space-y-2">
                          <Label htmlFor={`peso-${producto.id}`} className="text-sm font-medium flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                            P.V.
                          </Label>
                          <Input
                            id={`peso-${producto.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={producto.peso_volumetrico || ""}
                            onChange={(e) =>
                              updateProducto(producto.id, "peso_volumetrico", Number.parseFloat(e.target.value))
                            }
                            placeholder="Ingrese el peso volumétrico"
                            className="h-10 text-sm"
                            required
                          />
                        </div>

                        {/* Precio a Llegar - Nuevo campo */}
                        <div className="space-y-2">
                          <Label
                            htmlFor={`precio-llegar-${producto.id}`}
                            className="text-sm font-medium flex items-center"
                          >
                            <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                            Precio a Llegar
                          </Label>
                          <Input
                            id={`precio-llegar-${producto.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={producto.precio_llegar || ""}
                            onChange={(e) =>
                              updateProducto(producto.id, "precio_llegar", Number.parseFloat(e.target.value))
                            }
                            placeholder="Ingrese el precio a llegar"
                            className="h-10 text-sm"
                            required
                          />
                        </div>

                        {/* Modalidad */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-slate-500" />
                            Modalidad
                          </Label>
                          <RadioGroup
                            value={producto.modalidad}
                            onValueChange={(value) => updateProducto(producto.id, "modalidad", value)}
                            className="flex flex-col space-y-2 pt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Recogido" id={`recogido-${producto.id}`} />
                              <Label htmlFor={`recogido-${producto.id}`} className="font-normal text-sm">
                                Recogido
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Entregado" id={`entregado-${producto.id}`} />
                              <Label htmlFor={`entregado-${producto.id}`} className="font-normal text-sm">
                                Entregado
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Entrega Directa" id={`entrega-directa-${producto.id}`} />
                              <Label htmlFor={`entrega-directa-${producto.id}`} className="font-normal text-sm">
                                Entrega Directa
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Flete con Switch */}
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <div className="flex items-center gap-4">
                            <Label
                              htmlFor={`incluye-flete-${producto.id}`}
                              className="text-sm font-medium flex items-center whitespace-nowrap"
                            >
                              <Truck className="mr-2 h-4 w-4 text-[#0001B5]" />
                              Flete
                            </Label>
                            <div className="flex-shrink-0">
                              <Switch
                                id={`incluye-flete-${producto.id}`}
                                checked={producto.incluye_flete}
                                onCheckedChange={(checked) => updateProducto(producto.id, "incluye_flete", checked)}
                              />
                            </div>
                          </div>

                          {producto.incluye_flete && (
                            <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Tipo de Flete</Label>
                                <RadioGroup
                                  value={producto.tipoFlete || "tonelada"}
                                  onValueChange={(value: "tonelada" | "viaje" | "cotizacion") =>
                                    updateProducto(producto.id, "tipoFlete", value)
                                  }
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="tonelada" id={`flete-tonelada-${producto.id}`} />
                                    <Label htmlFor={`flete-tonelada-${producto.id}`} className="text-sm">
                                      Ton / m3
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="viaje" id={`flete-viaje-${producto.id}`} />
                                    <Label htmlFor={`flete-viaje-${producto.id}`} className="text-sm">
                                      Viaje
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cotizacion" id={`flete-cotizacion-${producto.id}`} />
                                    <Label htmlFor={`flete-cotizacion-${producto.id}`} className="text-sm">
                                      Cotización existente
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {!producto.tipoFlete || producto.tipoFlete === "tonelada" ? (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Valor del Flete</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={producto.valor_flete || ""}
                                    onChange={(e) =>
                                      updateProducto(producto.id, "valor_flete", Number.parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="Valor del flete"
                                    className="h-10 text-sm"
                                  />
                                </div>
                              ) : producto.tipoFlete === "viaje" ? (
                                <>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Toneladas promedio</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={producto.toneladas_promedio || ""}
                                      onChange={(e) =>
                                        updateProducto(
                                          producto.id,
                                          "toneladas_promedio",
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      placeholder="Toneladas promedio"
                                      className="h-10 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Costo por viaje</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={producto.costo_flete_tonelada || ""}
                                      onChange={(e) =>
                                        updateProducto(
                                          producto.id,
                                          "costo_flete_tonelada",
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      placeholder="Costo por viaje"
                                      className="h-10 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Valor del Flete (calculado)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={
                                        producto.toneladas_promedio && producto.costo_flete_tonelada
                                          ? (producto.costo_flete_tonelada / producto.toneladas_promedio).toFixed(2)
                                          : "0.00"
                                      }
                                      readOnly
                                      className="h-10 text-sm bg-gray-50"
                                    />
                                  </div>
                                </>
                              ) : (
                                // Opción de cotización existente
                                <div className="space-y-2">
                                  <div className="flex items-center gap-4">
                                    <Label className="text-sm font-medium">Cotización seleccionada</Label>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs"
                                          onClick={() => setSelectedProductIndex(index)}
                                        >
                                          {producto.cotizacionFleteId ? "Cambiar cotización" : "Seleccionar cotización"}
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                          <DialogTitle>Seleccionar Cotización de Flete</DialogTitle>
                                          <DialogDescription>
                                            Elige una cotización validada del historial para cargar su precio
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                              placeholder="Buscar cotización..."
                                              className="pl-9 h-10"
                                              value={searchTermFlete}
                                              onChange={(e) => setSearchTermFlete(e.target.value)}
                                            />
                                          </div>
                                          <div className="border rounded-md overflow-hidden">
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-center">ID</TableHead>
                                                  <TableHead className="text-center">Ubicación Suministro</TableHead>
                                                  <TableHead className="text-center">Ubicación Proyecto</TableHead>
                                                  <TableHead className="text-center">ID Material</TableHead>
                                                  <TableHead className="text-center">Estado</TableHead>
                                                  <TableHead className="text-center">Precio</TableHead>
                                                  <TableHead className="text-center">Acción</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {filteredCotizacionesFlete.length > 0 ? (
                                                  filteredCotizacionesFlete.map((cotizacionFlete) => (
                                                    <TableRow key={cotizacionFlete.id}>
                                                      <TableCell className="font-medium">
                                                        {cotizacionFlete.id}
                                                      </TableCell>
                                                      <TableCell>{cotizacionFlete.ubicacionSuministro}</TableCell>
                                                      <TableCell>{cotizacionFlete.ubicacionProyecto}</TableCell>
                                                      <TableCell>{cotizacionFlete.idMaterial}</TableCell>
                                                      <TableCell>
                                                        <Badge
                                                          variant="outline"
                                                          className={`
                                                            ${
                                                              cotizacionFlete.estado === "validado"
                                                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                                                : "bg-gray-50 text-gray-700 border-gray-200"
                                                            }
                                                            rounded-full px-2 py-0.5 text-xs
                                                          `}
                                                        >
                                                          {cotizacionFlete.estado.charAt(0).toUpperCase() +
                                                            cotizacionFlete.estado.slice(1)}
                                                        </Badge>
                                                      </TableCell>
                                                      <TableCell>
                                                        {cotizacionFlete.precio ? (
                                                          <span className="font-medium text-green-600">
                                                            {cotizacionFlete.precio}
                                                          </span>
                                                        ) : (
                                                          <span className="text-gray-400">--</span>
                                                        )}
                                                      </TableCell>
                                                      <TableCell>
                                                        <DialogClose asChild>
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!cotizacionFlete.precio}
                                                            onClick={() =>
                                                              selectCotizacionFlete(
                                                                cotizacionFlete,
                                                                selectedProductIndex !== null
                                                                  ? selectedProductIndex
                                                                  : index,
                                                              )
                                                            }
                                                          >
                                                            Seleccionar
                                                          </Button>
                                                        </DialogClose>
                                                      </TableCell>
                                                    </TableRow>
                                                  ))
                                                ) : (
                                                  <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                      No se encontraron cotizaciones
                                                    </TableCell>
                                                  </TableRow>
                                                )}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                  {producto.cotizacionFleteId ? (
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className="text-sm font-medium">
                                            Cotización: {producto.cotizacionFleteId}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            Valor del flete: {formatCurrency(producto.valor_flete || 0)}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-gray-500"
                                          onClick={() => {
                                            setProductos((prev) => {
                                              const updatedProductos = [...prev]
                                              const index = updatedProductos.findIndex((p) => p.id === producto.id)
                                              if (index !== -1) {
                                                updatedProductos[index] = {
                                                  ...updatedProductos[index],
                                                  cotizacionFleteId: undefined,
                                                  valor_flete: 0,
                                                }
                                              }
                                              return updatedProductos
                                            })
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-gray-50 rounded-md border text-center text-sm text-gray-500">
                                      No se ha seleccionado ninguna cotización
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Versión desktop - Productos como antes */}
              <div className="hidden md:block">
                {productos.map((producto, index) => (
                  <div key={producto.id} className="border rounded-lg p-6 space-y-6">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleProductExpansion(producto.id)}
                    >
                      <h3 className="text-lg font-medium flex items-center">
                        <Package className="h-5 w-5 mr-2 text-[#0001B5]" />
                        Producto {index + 1}
                      </h3>
                      <div className="flex items-center">
                        {productos.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeProducto(producto.id)
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 mr-2 rounded-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        )}
                        {expandedProducts[producto.id] ? (
                          <ChevronUp className="h-5 w-5 text-[#0001B5]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[#0001B5]" />
                        )}
                      </div>
                    </div>

                    {expandedProducts[producto.id] && (
                      <>
                        <Separator />

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label className="text-base flex items-center">
                              <Package className="h-4 w-4 mr-2 text-slate-500" />
                              Artículo
                            </Label>
                            <Select
                              value={producto.articulo_id.toString()}
                              onValueChange={(value) =>
                                updateProducto(producto.id, "articulo_id", Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Seleccionar artículo" />
                              </SelectTrigger>
                              <SelectContent>
                                {articulos.map((articulo) => (
                                  <SelectItem key={articulo.id} value={articulo.id.toString()}>
                                    {articulo.codigo} - {articulo.descripcion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor={`descripcion-desktop-${producto.id}`} className="text-base">
                              Descripción del artículo
                            </Label>
                            <Input
                              id={`descripcion-desktop-${producto.id}`}
                              value={producto.descripcion}
                              onChange={(e) => updateProducto(producto.id, "descripcion", e.target.value)}
                              placeholder="Descripción del artículo"
                              className="h-11"
                              disabled
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor={`peso-desktop-${producto.id}`} className="text-base flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                              P.V.
                            </Label>
                            <Input
                              id={`peso-desktop-${producto.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={producto.peso_volumetrico || ""}
                              onChange={(e) =>
                                updateProducto(producto.id, "peso_volumetrico", Number.parseFloat(e.target.value))
                              }
                              placeholder="Ingrese el peso volumétrico"
                              className="h-11"
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label
                              htmlFor={`precio-llegar-desktop-${producto.id}`}
                              className="text-base flex items-center"
                            >
                              <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                              Precio a Llegar
                            </Label>
                            <Input
                              id={`precio-llegar-desktop-${producto.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={producto.precio_llegar || ""}
                              onChange={(e) =>
                                updateProducto(producto.id, "precio_llegar", Number.parseFloat(e.target.value))
                              }
                              placeholder="Ingrese el precio a llegar"
                              className="h-11"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label className="text-base flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-slate-500" />
                              Modalidad
                            </Label>
                            <RadioGroup
                              value={producto.modalidad}
                              onValueChange={(value) => updateProducto(producto.id, "modalidad", value)}
                              className="flex flex-wrap gap-4 pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Recogido" id={`recogido-desktop-${producto.id}`} />
                                <Label htmlFor={`recogido-desktop-${producto.id}`} className="font-normal">
                                  Recogido
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Entregado" id={`entregado-desktop-${producto.id}`} />
                                <Label htmlFor={`entregado-desktop-${producto.id}`} className="font-normal">
                                  Entregado
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Entrega Directa" id={`entrega-directa-desktop-${producto.id}`} />
                                <Label htmlFor={`entrega-directa-desktop-${producto.id}`} className="font-normal">
                                  Entrega Directa
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>

                        {/* Flete */}
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <div className="flex items-center gap-4">
                            <Label
                              htmlFor={`incluye-flete-desktop-${producto.id}`}
                              className="font-medium flex items-center"
                            >
                              <Truck className="mr-2 h-4 w-4 text-[#0001B5]" />
                              Flete
                            </Label>
                            <Switch
                              id={`incluye-flete-desktop-${producto.id}`}
                              checked={producto.incluye_flete}
                              onCheckedChange={(checked) => updateProducto(producto.id, "incluye_flete", checked)}
                            />
                          </div>

                          {producto.incluye_flete && (
                            <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                              <div className="space-y-2">
                                <Label className="font-medium">Tipo de Flete</Label>
                                <RadioGroup
                                  value={producto.tipoFlete || "tonelada"}
                                  onValueChange={(value: "tonelada" | "viaje" | "cotizacion") =>
                                    updateProducto(producto.id, "tipoFlete", value)
                                  }
                                  className="flex space-x-6"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="tonelada" id={`flete-tonelada-desktop-${producto.id}`} />
                                    <Label htmlFor={`flete-tonelada-desktop-${producto.id}`}>Ton / m3</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="viaje" id={`flete-viaje-desktop-${producto.id}`} />
                                    <Label htmlFor={`flete-viaje-desktop-${producto.id}`}>Viaje</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cotizacion" id={`flete-cotizacion-desktop-${producto.id}`} />
                                    <Label htmlFor={`flete-cotizacion-desktop-${producto.id}`}>
                                      Cotización existente
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {!producto.tipoFlete || producto.tipoFlete === "tonelada" ? (
                                <div className="space-y-2">
                                  <Label className="font-medium">Valor del Flete</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={producto.valor_flete || ""}
                                    onChange={(e) =>
                                      updateProducto(producto.id, "valor_flete", Number.parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="Valor del flete"
                                    className="h-11"
                                  />
                                </div>
                              ) : producto.tipoFlete === "viaje" ? (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="font-medium">Toneladas promedio</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={producto.toneladas_promedio || ""}
                                      onChange={(e) =>
                                        updateProducto(
                                          producto.id,
                                          "toneladas_promedio",
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      placeholder="Toneladas promedio"
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="font-medium">Costo por viaje</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={producto.costo_flete_tonelada || ""}
                                      onChange={(e) =>
                                        updateProducto(
                                          producto.id,
                                          "costo_flete_tonelada",
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      placeholder="Costo por viaje"
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="font-medium">Valor del Flete (calculado)</Label>
                                    <div className="bg-slate-50 p-3 rounded border text-base">
                                      {formatCurrency(
                                        producto.toneladas_promedio && producto.costo_flete_tonelada
                                          ? producto.costo_flete_tonelada / producto.toneladas_promedio
                                          : 0,
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Opción de cotización existente
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Label className="font-medium">Cotización seleccionada</Label>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setSelectedProductIndex(index)}
                                        >
                                          {producto.cotizacionFleteId ? "Cambiar cotización" : "Seleccionar cotización"}
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                          <DialogTitle>Seleccionar Cotización de Flete</DialogTitle>
                                          <DialogDescription>
                                            Elige una cotización validada del historial para cargar su precio
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                              placeholder="Buscar cotización..."
                                              className="pl-9 h-10"
                                              value={searchTermFlete}
                                              onChange={(e) => setSearchTermFlete(e.target.value)}
                                            />
                                          </div>
                                          <div className="border rounded-md overflow-hidden">
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-center">ID</TableHead>
                                                  <TableHead className="text-center">Ubicación Suministro</TableHead>
                                                  <TableHead className="text-center">Ubicación Proyecto</TableHead>
                                                  <TableHead className="text-center">ID Material</TableHead>
                                                  <TableHead className="text-center">Estado</TableHead>
                                                  <TableHead className="text-center">Precio</TableHead>
                                                  <TableHead className="text-center">Acción</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {filteredCotizacionesFlete.length > 0 ? (
                                                  filteredCotizacionesFlete.map((cotizacionFlete) => (
                                                    <TableRow key={cotizacionFlete.id}>
                                                      <TableCell className="font-medium">
                                                        {cotizacionFlete.id}
                                                      </TableCell>
                                                      <TableCell>{cotizacionFlete.ubicacionSuministro}</TableCell>
                                                      <TableCell>{cotizacionFlete.ubicacionProyecto}</TableCell>
                                                      <TableCell>{cotizacionFlete.idMaterial}</TableCell>
                                                      <TableCell>
                                                        <Badge
                                                          variant="outline"
                                                          className={`
                                                            ${
                                                              cotizacionFlete.estado === "validado"
                                                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                                                : "bg-gray-50 text-gray-700 border-gray-200"
                                                            }
                                                            rounded-full px-2 py-0.5 text-xs
                                                          `}
                                                        >
                                                          {cotizacionFlete.estado.charAt(0).toUpperCase() +
                                                            cotizacionFlete.estado.slice(1)}
                                                        </Badge>
                                                      </TableCell>
                                                      <TableCell>
                                                        {cotizacionFlete.precio ? (
                                                          <span className="font-medium text-green-600">
                                                            {cotizacionFlete.precio}
                                                          </span>
                                                        ) : (
                                                          <span className="text-gray-400">--</span>
                                                        )}
                                                      </TableCell>
                                                      <TableCell>
                                                        <DialogClose asChild>
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!cotizacionFlete.precio}
                                                            onClick={() =>
                                                              selectCotizacionFlete(
                                                                cotizacionFlete,
                                                                selectedProductIndex !== null
                                                                  ? selectedProductIndex
                                                                  : index,
                                                              )
                                                            }
                                                          >
                                                            Seleccionar
                                                          </Button>
                                                        </DialogClose>
                                                      </TableCell>
                                                    </TableRow>
                                                  ))
                                                ) : (
                                                  <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                      No se encontraron cotizaciones
                                                    </TableCell>
                                                  </TableRow>
                                                )}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                  {producto.cotizacionFleteId ? (
                                    <div className="p-4 bg-gray-50 rounded-md border">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className="font-medium">Cotización: {producto.cotizacionFleteId}</p>
                                          <p className="text-sm text-gray-500 mt-1">
                                            Valor del flete: {formatCurrency(producto.valor_flete || 0)}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-gray-500"
                                          onClick={() => {
                                            setProductos((prev) => {
                                              const updatedProductos = [...prev]
                                              const index = updatedProductos.findIndex((p) => p.id === producto.id)
                                              if (index !== -1) {
                                                updatedProductos[index] = {
                                                  ...updatedProductos[index],
                                                  cotizacionFleteId: undefined,
                                                  valor_flete: 0,
                                                }
                                              }
                                              return updatedProductos
                                            })
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-gray-50 rounded-md border text-center text-gray-500">
                                      No se ha seleccionado ninguna cotización
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Link href="/nueva-cotizacion" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="flex items-center w-full rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-[#0001B5] hover:bg-[#00018c] flex items-center w-full sm:w-auto mt-2 sm:mt-0 rounded-full"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar Cotización"}
          </Button>
        </div>
      </form>
    </div>
  )
}
