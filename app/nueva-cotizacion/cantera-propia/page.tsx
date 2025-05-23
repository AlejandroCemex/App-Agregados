"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/user-context"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Building,
  Package,
  Truck,
  DollarSign,
  BarChart3,
  Users,
  CalendarPlus2Icon as CalendarIcon2,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  X,
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

type Cantera = {
  id: number
  Nombre: string
}

type Material = {
  id: number
  Material: string
  "No. Material": number
}

type CalidadMaterial = {
  id: number
  nombre: string
}

type VolumenRecurrente = {
  id: number
  descripcion: string
}

type Segmento = {
  id: number
  nombre: string
}

type ProductoItem = {
  id: string
  cantera_id: number
  material_id: number
  modalidad: string
  precio: number
  incluye_flete: boolean
  valor_flete: number | null
  unidad_medida: string
  toneladas_promedio: number | null
  costo_flete_tonelada: number | null
  calidad_material: number
  volumen_recurrente: number
  segmento: number
  // Nuevos campos para el flete
  tipoFlete?: "tonelada" | "viaje" | "cotizacion"
  cotizacionFleteId?: string
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

export default function CoteraPropia() {
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
      tipo: "Cantera Propia",
      estado: "Aprobada",
      total: "$45,200.00",
    },
    {
      id: "COT-2023-002",
      fecha: new Date(2023, 5, 2),
      cliente: "Desarrollos XYZ",
      tipo: "Cantera Propia",
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
      tipo: "Cantera Propia",
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
  const [canteras, setCanteras] = useState<Cantera[]>([])
  const [materiales, setMateriales] = useState<Material[]>([])
  const [calidadMaterial, setCalidadMaterial] = useState<CalidadMaterial[]>([])
  const [volumenRecurrente, setVolumenRecurrente] = useState<VolumenRecurrente[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])

  // Form values
  const [numeroDestino, setNumeroDestino] = useState("")
  const [nombreDestinatario, setNombreDestinatario] = useState("")
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date())
  const [fechaFin, setFechaFin] = useState<Date>(new Date())

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
      ubicacionSuministro: "Cantera Norte, Km 34",
      ubicacionProyecto: "Zona Industrial, Sector 3",
      idMaterial: "MAT-001",
      estado: "validado",
      precio: "$5,200.00",
      tiempoRespuesta: "3 días",
    },
    {
      id: "COT-002",
      fecha: new Date(2023, 5, 2),
      ubicacionSuministro: "Cantera Sur, Km 12",
      ubicacionProyecto: "Residencial Las Palmas",
      idMaterial: "MAT-003",
      estado: "validado",
      precio: "$4,800.00",
      tiempoRespuesta: "2 días",
    },
    {
      id: "COT-003",
      fecha: new Date(2023, 5, 10),
      ubicacionSuministro: "Cantera Este, Km 45",
      ubicacionProyecto: "Centro Comercial Plaza Mayor",
      idMaterial: "MAT-002",
      estado: "validado",
      precio: "$6,350.00",
      tiempoRespuesta: "1 día",
    },
    {
      id: "COT-004",
      fecha: new Date(2023, 5, 18),
      ubicacionSuministro: "Cantera Oeste, Km 22",
      ubicacionProyecto: "Hospital Regional",
      idMaterial: "MAT-005",
      estado: "validado",
      precio: "$7,200.00",
      tiempoRespuesta: "4 días",
    },
    {
      id: "COT-005",
      fecha: new Date(2023, 6, 5),
      ubicacionSuministro: "Cantera Central, Km 8",
      ubicacionProyecto: "Edificio Corporativo",
      idMaterial: "MAT-007",
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

        // Fetch canteras based on user's zone
        const { data: canterasData, error: canterasError } = await supabaseClient
          .from("01 Canteras Propias")
          .select("id, Nombre")
          .eq("Zona", user.zona.id)

        if (canterasError) throw canterasError
        setCanteras(canterasData || [])

        // Fetch other data
        const { data: calidadData } = await supabaseClient.from("Calidad Material").select("*")
        setCalidadMaterial(calidadData || [])

        const { data: volumenData } = await supabaseClient.from("Volumen Recurrente").select("*")
        setVolumenRecurrente(volumenData || [])

        const { data: segmentosData } = await supabaseClient.from("Segmentos").select("*")
        setSegmentos(segmentosData || [])
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

  const fetchMateriales = async (canteraId: number) => {
    try {
      const { data, error } = await supabaseClient
        .from("01 Materiales Canteras")
        .select('id, Material, "No. Material"')
        .eq("Cantera", canteraId)

      if (error) throw error
      setMateriales(data || [])
    } catch (error) {
      console.error("Error fetching materiales:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los materiales",
        variant: "destructive",
      })
    }
  }

  const addProducto = () => {
    const newProducto: ProductoItem = {
      id: Date.now().toString(),
      cantera_id: 0,
      material_id: 0,
      modalidad: "Recogido",
      precio: 0,
      incluye_flete: false,
      valor_flete: null,
      unidad_medida: "Tonelada",
      toneladas_promedio: null,
      costo_flete_tonelada: null,
      calidad_material: 0,
      volumen_recurrente: 0,
      segmento: 0,
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

          return { ...p, [field]: value }
        }
        return p
      }),
    )

    // Si cantera changes, fetch materials for that cantera
    if (field === "cantera_id") {
      fetchMateriales(value)
    }
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
    for (const producto of productos) {
      if (!producto.cantera_id || !producto.material_id || !producto.precio) {
        toast({
          title: "Error",
          description: "Todos los productos deben tener cantera, material y precio",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Insert cotización
      const { data: cotizacionData, error: cotizacionError } = await supabaseClient
        .from("Cotizaciones")
        .insert({
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          usuario: user.id,
          tipo_cotizacion: "Cantera Propia",
          numero_destino: numeroDestino,
          nombre_destinatario: nombreDestinatario,
          zona: user.zona.id,
        })
        .select()

      if (cotizacionError) throw cotizacionError

      const cotizacionId = cotizacionData[0].id

      // Insert detalles de cotización
      const detallesPromises = productos.map((producto) => {
        return supabaseClient.from("Detalles Cotizacion").insert({
          cotizacion_id: cotizacionId,
          cantera_id: producto.cantera_id,
          material_id: producto.material_id,
          modalidad: producto.modalidad,
          precio: producto.precio,
          incluye_flete: producto.incluye_flete,
          valor_flete: producto.valor_flete,
          unidad_medida: producto.unidad_medida,
          toneladas_promedio: producto.toneladas_promedio,
          costo_flete_tonelada: producto.costo_flete_tonelada,
          calidad_material: producto.calidad_material,
          volumen_recurrente: producto.volumen_recurrente,
          segmento: producto.segmento,
          tipo_flete: producto.tipoFlete,
          cotizacion_flete_id: producto.cotizacionFleteId,
        })
      })

      await Promise.all(detallesPromises)

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
        title="Nueva Alta de Precio - Cantera Propia"
        subtitle="Completa el formulario para generar una cotización"
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
              <CalendarIcon2 className="mr-2 h-5 w-5" />
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
                <CalendarIcon2 className="mr-2 h-5 w-5 text-[#0001B5]" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="numeroDestino" className="text-base">
                    Número destino de mercancía
                  </Label>
                  <Input
                    id="numeroDestino"
                    value={numeroDestino}
                    onChange={(e) => setNumeroDestino(e.target.value)}
                    placeholder="Ingrese el número de destino"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="nombreDestinatario" className="text-base">
                    Nombre del destinatario
                  </Label>
                  <Input
                    id="nombreDestinatario"
                    value={nombreDestinatario}
                    onChange={(e) => setNombreDestinatario(e.target.value)}
                    placeholder="Ingrese el nombre del destinatario"
                    className="h-11"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base">Fecha de inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-11">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaInicio ? formatearFecha(fechaInicio) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaInicio}
                        onSelect={(date) => date && setFechaInicio(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Fecha de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-11">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaFin ? formatearFecha(fechaFin) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaFin}
                        onSelect={(date) => date && setFechaFin(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

                        {/* Cantera */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <Building className="h-4 w-4 mr-2 text-slate-500" />
                            Cantera
                          </Label>
                          <Select
                            value={producto.cantera_id.toString()}
                            onValueChange={(value) => updateProducto(producto.id, "cantera_id", Number.parseInt(value))}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Seleccionar cantera" />
                            </SelectTrigger>
                            <SelectContent>
                              {canteras.map((cantera) => (
                                <SelectItem key={cantera.id} value={cantera.id.toString()}>
                                  {cantera.Nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Material */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <Package className="h-4 w-4 mr-2 text-slate-500" />
                            Material
                          </Label>
                          <Select
                            value={producto.material_id.toString()}
                            onValueChange={(value) =>
                              updateProducto(producto.id, "material_id", Number.parseInt(value))
                            }
                            disabled={!producto.cantera_id}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Seleccionar material" />
                            </SelectTrigger>
                            <SelectContent>
                              {materiales.map((material) => (
                                <SelectItem key={material.id} value={material.id.toString()}>
                                  {material.Material}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            className="flex space-x-8 pt-2"
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
                          </RadioGroup>
                        </div>

                        {/* Precio */}
                        <div className="space-y-2">
                          <Label htmlFor={`precio-${producto.id}`} className="text-sm font-medium flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                            Precio a llegar
                          </Label>
                          <Input
                            id={`precio-${producto.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={producto.precio || ""}
                            onChange={(e) => updateProducto(producto.id, "precio", Number.parseFloat(e.target.value))}
                            placeholder="Ingrese el precio"
                            className="h-10 text-sm"
                            required
                          />
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

                        <Separator />

                        {/* Calidad del material */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-slate-500" />
                            Calidad del material
                          </Label>
                          <Select
                            value={producto.calidad_material.toString()}
                            onValueChange={(value) =>
                              updateProducto(producto.id, "calidad_material", Number.parseInt(value))
                            }
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Seleccionar calidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {calidadMaterial.map((calidad) => (
                                <SelectItem key={calidad.id} value={calidad.id.toString()}>
                                  {calidad.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Volumen recurrente */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <CalendarIcon2 className="h-4 w-4 mr-2 text-slate-500" />
                            Volumen recurrente
                          </Label>
                          <Select
                            value={producto.volumen_recurrente.toString()}
                            onValueChange={(value) =>
                              updateProducto(producto.id, "volumen_recurrente", Number.parseInt(value))
                            }
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Seleccionar volumen" />
                            </SelectTrigger>
                            <SelectContent>
                              {volumenRecurrente.map((volumen) => (
                                <SelectItem key={volumen.id} value={volumen.id.toString()}>
                                  {volumen.descripcion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Segmento */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <Users className="h-4 w-4 mr-2 text-slate-500" />
                            Segmento
                          </Label>
                          <Select
                            value={producto.segmento.toString()}
                            onValueChange={(value) => updateProducto(producto.id, "segmento", Number.parseInt(value))}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Seleccionar segmento" />
                            </SelectTrigger>
                            <SelectContent>
                              {segmentos.map((segmento) => (
                                <SelectItem key={segmento.id} value={segmento.id.toString()}>
                                  {segmento.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                              <Building className="h-4 w-4 mr-2 text-slate-500" />
                              Cantera
                            </Label>
                            <Select
                              value={producto.cantera_id.toString()}
                              onValueChange={(value) =>
                                updateProducto(producto.id, "cantera_id", Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Seleccionar cantera" />
                              </SelectTrigger>
                              <SelectContent>
                                {canteras.map((cantera) => (
                                  <SelectItem key={cantera.id} value={cantera.id.toString()}>
                                    {cantera.Nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-base flex items-center">
                              <Package className="h-4 w-4 mr-2 text-slate-500" />
                              Material
                            </Label>
                            <Select
                              value={producto.material_id.toString()}
                              onValueChange={(value) =>
                                updateProducto(producto.id, "material_id", Number.parseInt(value))
                              }
                              disabled={!producto.cantera_id}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Seleccionar material" />
                              </SelectTrigger>
                              <SelectContent>
                                {materiales.map((material) => (
                                  <SelectItem key={material.id} value={material.id.toString()}>
                                    {material.Material}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              className="flex space-x-8 pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Recogido" id={`recogido-${producto.id}`} />
                                <Label htmlFor={`recogido-${producto.id}`} className="font-normal">
                                  Recogido
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Entregado" id={`entregado-${producto.id}`} />
                                <Label htmlFor={`entregado-${producto.id}`} className="font-normal">
                                  Entregado
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor={`precio-${producto.id}`} className="text-base flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                              Precio a llegar
                            </Label>
                            <Input
                              id={`precio-${producto.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={producto.precio || ""}
                              onChange={(e) => updateProducto(producto.id, "precio", Number.parseFloat(e.target.value))}
                              placeholder="Ingrese el precio"
                              className="h-11"
                              required
                            />
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

                        <Separator />

                        <div className="grid md:grid-cols-3 gap-8">
                          <div className="space-y-3">
                            <Label className="text-base flex items-center">
                              <BarChart3 className="h-4 w-4 mr-2 text-slate-500" />
                              Calidad del material
                            </Label>
                            <Select
                              value={producto.calidad_material.toString()}
                              onValueChange={(value) =>
                                updateProducto(producto.id, "calidad_material", Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Seleccionar calidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {calidadMaterial.map((calidad) => (
                                  <SelectItem key={calidad.id} value={calidad.id.toString()}>
                                    {calidad.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-base flex items-center">
                              <CalendarIcon2 className="h-4 w-4 mr-2 text-slate-500" />
                              Volumen recurrente
                            </Label>
                            <Select
                              value={producto.volumen_recurrente.toString()}
                              onValueChange={(value) =>
                                updateProducto(producto.id, "volumen_recurrente", Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Seleccionar volumen" />
                              </SelectTrigger>
                              <SelectContent>
                                {volumenRecurrente.map((volumen) => (
                                  <SelectItem key={volumen.id} value={volumen.id.toString()}>
                                    {volumen.descripcion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-base flex items-center">
                              <Users className="h-4 w-4 mr-2 text-slate-500" />
                              Segmento
                            </Label>
                            <Select
                              value={producto.segmento.toString()}
                              onValueChange={(value) => updateProducto(producto.id, "segmento", Number.parseInt(value))}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Seleccionar segmento" />
                              </SelectTrigger>
                              <SelectContent>
                                {segmentos.map((segmento) => (
                                  <SelectItem key={segmento.id} value={segmento.id.toString()}>
                                    {segmento.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
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
