"use client"

import { useState, useRef, useEffect } from "react"
import { useUser } from "@/components/user-context"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileText, ArrowLeft, Plus, Trash2, User, Package, Info, Truck, Calendar, Search, X } from "lucide-react"
import Link from "next/link"
import { PageTitle } from "@/components/page-title"
import { CardDecorator } from "@/components/ui-elements"
import { formatCurrency } from "@/lib/utils"
import { SharePdfButton } from "@/components/share-pdf-button"
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

// Tipo para los materiales en la cotización
type MaterialItem = {
  id: string
  tipoOrigen: "cantera-propia" | "terceros"
  cantera_id?: number
  material_id?: number
  descripcion: string
  origen: string
  litologia: string
  pesoVolumetrico: number
  unidadMedida: string
  precioUnitario: number
  // Nuevos campos para el flete
  incluyeFlete: boolean
  tipoFlete: "tonelada" | "viaje" | "cotizacion"
  valorFlete: number
  toneladasPromedio?: number
  costoPorViaje?: number
  cotizacionFleteId?: string
}

// Tipo para la información de la cotización
type CotizacionInfo = {
  cliente: string
  contacto: string
  obra: string
  fechaInicio: string
  fechaFin: string
  vigencia: string
  modalidad: string
  materiales: MaterialItem[]
  premisas: string
  notas: string
  firmante: string
  cargo: string
  telefono: string
  email: string
}

// Tipos para los datos de Supabase
type Cantera = {
  id: number
  Nombre: string
}

type Material = {
  id: number
  Material: string
  "No. Material": number
}

// Tipo para las cotizaciones de flete
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

// Tipo para las cotizaciones guardadas en el historial
type CotizacionGuardada = {
  id: string
  fecha: string
  cliente: string
  obra: string
  materiales: number
  total: number
  estado: "pendiente" | "aprobada" | "rechazada" | "completada"
}

export default function GenerarCotizacion() {
  const { user } = useUser()
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)

  // Estados para los datos de Supabase
  const [canteras, setCanteras] = useState<Cantera[]>([])
  const [materiales, setMateriales] = useState<Record<number, Material[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Añadir este estado después de los otros estados
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({})

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
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState<number | null>(null)

  // Texto predeterminado para premisas
  const premisasDefault = `• A estos precios se debe adicionar el 16 % de IVA
• Precios son sujetos a una orden de compra y/o contrato de suministro con el objetivo de garantizar la disponibilidad del producto
• El Peso Volumétrico (P.V.) mostrado es un dato estadístico, por lo tanto, este puede variar.
• **Favor de consultar el apartado de cláusulas para mayor información.**`

  // Estado inicial de la cotización
  const [cotizacion, setCotizacion] = useState<CotizacionInfo>({
    cliente: "",
    contacto: "",
    obra: "",
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: "",
    vigencia: "1 MES",
    modalidad: "RECOGIDO",
    materiales: [
      {
        id: "1",
        tipoOrigen: "terceros",
        descripcion: "",
        origen: "",
        litologia: "",
        pesoVolumetrico: 0,
        unidadMedida: "TON",
        precioUnitario: 0,
        incluyeFlete: false,
        tipoFlete: "tonelada",
        valorFlete: 0,
      },
    ],
    premisas: premisasDefault,
    notas: "",
    firmante: "",
    cargo: "",
    telefono: "",
    email: "",
  })

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("informacion-general")

  // Estado para controlar la vista activa (nueva cotización o historial)
  const [vistaActiva, setVistaActiva] = useState<"nueva" | "historial">("nueva")

  // Datos de ejemplo para el historial de cotizaciones
  const [historialCotizaciones, setHistorialCotizaciones] = useState<CotizacionGuardada[]>([
    {
      id: "COT-2023-001",
      fecha: "2023-05-15",
      cliente: "Constructora Moderna S.A.",
      obra: "Edificio Residencial Las Palmas",
      materiales: 3,
      total: 45600,
      estado: "aprobada",
    },
    {
      id: "COT-2023-002",
      fecha: "2023-06-02",
      cliente: "Desarrollos Urbanos del Norte",
      obra: "Centro Comercial Plaza Mayor",
      materiales: 2,
      total: 28750,
      estado: "pendiente",
    },
    {
      id: "COT-2023-003",
      fecha: "2023-06-10",
      cliente: "Constructora Avanza",
      obra: "Hospital Regional Fase II",
      materiales: 5,
      total: 87200,
      estado: "completada",
    },
    {
      id: "COT-2023-004",
      fecha: "2023-06-18",
      cliente: "Inmobiliaria Futuro",
      obra: "Complejo Residencial Los Pinos",
      materiales: 4,
      total: 52300,
      estado: "rechazada",
    },
    {
      id: "COT-2023-005",
      fecha: "2023-07-05",
      cliente: "Constructora Horizonte",
      obra: "Torre Corporativa Empresarial",
      materiales: 6,
      total: 124500,
      estado: "aprobada",
    },
  ])

  // Estado para búsqueda en el historial
  const [searchTermHistorial, setSearchTermHistorial] = useState("")

  // Filtrar cotizaciones de flete por término de búsqueda
  const filteredCotizacionesFlete = cotizacionesFlete.filter(
    (cotizacion) =>
      cotizacion.id.toLowerCase().includes(searchTermFlete.toLowerCase()) ||
      cotizacion.ubicacionSuministro.toLowerCase().includes(searchTermFlete.toLowerCase()) ||
      cotizacion.ubicacionProyecto.toLowerCase().includes(searchTermFlete.toLowerCase()) ||
      cotizacion.idMaterial.toLowerCase().includes(searchTermFlete.toLowerCase()),
  )

  // Filtrar cotizaciones del historial por término de búsqueda
  const filteredHistorialCotizaciones = historialCotizaciones.filter(
    (cotizacion) =>
      cotizacion.id.toLowerCase().includes(searchTermHistorial.toLowerCase()) ||
      cotizacion.cliente.toLowerCase().includes(searchTermHistorial.toLowerCase()) ||
      cotizacion.obra.toLowerCase().includes(searchTermHistorial.toLowerCase()),
  )

  // Función para seleccionar una cotización de flete
  const selectCotizacionFlete = (cotizacionFlete: CotizacionFlete, materialIndex: number) => {
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

    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales[materialIndex] = {
        ...updatedMateriales[materialIndex],
        tipoFlete: "cotizacion",
        valorFlete: precioNumerico,
        cotizacionFleteId: cotizacionFlete.id,
      }
      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })

    toast({
      title: "Cotización de flete seleccionada",
      description: `Se ha cargado el precio de la cotización ${cotizacionFlete.id}`,
    })
  }

  // Calcular el total de la cotización
  const calcularTotal = () => {
    return cotizacion.materiales.reduce((total, material) => {
      const precioMaterial = material.precioUnitario || 0
      const precioFlete = material.incluyeFlete ? material.valorFlete || 0 : 0
      return total + precioMaterial + precioFlete
    }, 0)
  }

  // Calcular fecha de fin basada en fecha de inicio y vigencia
  useEffect(() => {
    if (cotizacion.fechaInicio) {
      const fechaInicio = new Date(cotizacion.fechaInicio)
      const fechaFin = new Date(fechaInicio)

      switch (cotizacion.vigencia) {
        case "15 DÍAS":
          fechaFin.setDate(fechaInicio.getDate() + 15)
          break
        case "1 MES":
          fechaFin.setMonth(fechaInicio.getMonth() + 1)
          break
        case "6 MESES":
          fechaFin.setMonth(fechaInicio.getMonth() + 6)
          break
        case "1 AÑO":
          fechaFin.setFullYear(fechaInicio.getFullYear() + 1)
          break
      }

      setCotizacion((prev) => ({
        ...prev,
        fechaFin: fechaFin.toISOString().split("T")[0],
      }))
    }
  }, [cotizacion.fechaInicio, cotizacion.vigencia])

  // Cargar canteras al iniciar
  useEffect(() => {
    const fetchCanteras = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch canteras based on user's zone
        const { data: canterasData, error: canterasError } = await supabaseClient
          .from("01 Canteras Propias")
          .select("id, Nombre")
          .eq("Zona", user.zona.id)

        if (canterasError) throw canterasError
        setCanteras(canterasData || [])

        // Precargar materiales para cada cantera
        const materialesMap: Record<number, Material[]> = {}
        for (const cantera of canterasData || []) {
          const { data: materialesData } = await supabaseClient
            .from("01 Materiales Canteras")
            .select('id, Material, "No. Material"')
            .eq("Cantera", cantera.id)

          materialesMap[cantera.id] = materialesData || []
        }
        setMateriales(materialesMap)
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

    fetchCanteras()
  }, [user, toast])

  // Añadir esta función junto con las otras funciones de manejo
  const toggleMaterialExpansion = (materialId: string) => {
    setExpandedMaterials((prev) => ({
      ...prev,
      [materialId]: !prev[materialId],
    }))
  }

  // Función para actualizar los campos de la cotización
  const handleChange = (field: keyof CotizacionInfo, value: string) => {
    setCotizacion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Función para actualizar los campos de los materiales
  const handleMaterialItemChange = (index: number, field: keyof MaterialItem, value: any) => {
    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales[index] = {
        ...updatedMateriales[index],
        [field]: value,
      }

      // Si estamos actualizando toneladasPromedio o costoPorViaje, calculamos el valorFlete
      if (
        (field === "toneladasPromedio" || field === "costoPorViaje") &&
        updatedMateriales[index].tipoFlete === "viaje" &&
        updatedMateriales[index].toneladasPromedio &&
        updatedMateriales[index].toneladasPromedio > 0 &&
        updatedMateriales[index].costoPorViaje
      ) {
        updatedMateriales[index].valorFlete =
          updatedMateriales[index].costoPorViaje / updatedMateriales[index].toneladasPromedio
      }

      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })
  }

  // Función para manejar el cambio de tipo de origen
  const handleTipoOrigenChange = (index: number, isCanteraPropia: boolean) => {
    const value = isCanteraPropia ? "cantera-propia" : "terceros"

    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales[index] = {
        ...updatedMateriales[index],
        tipoOrigen: value,
        // Resetear valores si cambia el tipo
        cantera_id: undefined,
        material_id: undefined,
        origen: value === "terceros" ? "" : updatedMateriales[index].origen,
        descripcion: value === "terceros" ? "" : updatedMateriales[index].descripcion,
        litologia: value === "terceros" ? "" : updatedMateriales[index].litologia,
      }
      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })
  }

  // Función para manejar el cambio de incluir flete
  const handleIncluyeFleteChange = (index: number, incluyeFlete: boolean) => {
    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales[index] = {
        ...updatedMateriales[index],
        incluyeFlete,
        // Resetear valores si se desactiva el flete
        valorFlete: incluyeFlete ? updatedMateriales[index].valorFlete : 0,
        tipoFlete: incluyeFlete ? updatedMateriales[index].tipoFlete : "tonelada",
        toneladasPromedio: incluyeFlete ? updatedMateriales[index].toneladasPromedio : undefined,
        costoPorViaje: incluyeFlete ? updatedMateriales[index].costoPorViaje : undefined,
        cotizacionFleteId: incluyeFlete ? updatedMateriales[index].cotizacionFleteId : undefined,
      }
      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })
  }

  // Función para manejar el cambio de tipo de flete
  const handleTipoFleteChange = (index: number, tipoFlete: "tonelada" | "viaje" | "cotizacion") => {
    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales[index] = {
        ...updatedMateriales[index],
        tipoFlete,
        // Resetear valores específicos según el tipo de flete
        valorFlete: tipoFlete === "tonelada" ? updatedMateriales[index].valorFlete : 0,
        toneladasPromedio: tipoFlete === "viaje" ? 0 : undefined,
        costoPorViaje: tipoFlete === "viaje" ? 0 : undefined,
        cotizacionFleteId: tipoFlete === "cotizacion" ? "" : undefined,
      }
      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })
  }

  // Función para manejar la selección de cantera
  const handleCanteraChange = (index: number, canteraId: number) => {
    const cantera = canteras.find((c) => c.id === canteraId)

    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales[index] = {
        ...updatedMateriales[index],
        cantera_id: canteraId,
        origen: cantera?.Nombre || "",
        material_id: undefined,
        descripcion: "",
      }
      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })
  }

  // Función para manejar la selección de material
  const handleMaterialChange = (index: number, materialId: number) => {
    const material = materiales[cotizacion.materiales[index].cantera_id || 0]?.find((m) => m.id === materialId)

    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales[index] = {
        ...updatedMateriales[index],
        material_id: materialId,
        descripcion: material?.Material || "",
      }
      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })
  }

  // Modificar la función addMaterial para que los nuevos materiales estén expandidos por defecto
  const addMaterial = () => {
    const newId = Date.now().toString()
    setCotizacion((prev) => ({
      ...prev,
      materiales: [
        ...prev.materiales,
        {
          id: newId,
          tipoOrigen: "terceros",
          descripcion: "",
          origen: "",
          litologia: "",
          pesoVolumetrico: 0,
          unidadMedida: "TON",
          precioUnitario: 0,
          incluyeFlete: false,
          tipoFlete: "tonelada",
          valorFlete: 0,
        },
      ],
    }))

    // Expandir el nuevo material automáticamente
    setExpandedMaterials((prev) => ({
      ...prev,
      [newId]: true,
    }))
  }

  // Función para eliminar un material
  const removeMaterial = (index: number) => {
    setCotizacion((prev) => {
      const updatedMateriales = [...prev.materiales]
      updatedMateriales.splice(index, 1)
      return {
        ...prev,
        materiales: updatedMateriales,
      }
    })
  }

  // Función para guardar la cotización
  const handleSave = async () => {
    // Crear un nuevo ID para la cotización
    const newId = `COT-${new Date().getFullYear()}-${(historialCotizaciones.length + 1).toString().padStart(3, "0")}`

    // Crear una nueva cotización para el historial
    const nuevaCotizacion: CotizacionGuardada = {
      id: newId,
      fecha: new Date().toISOString().split("T")[0],
      cliente: cotizacion.cliente || "Cliente sin nombre",
      obra: cotizacion.obra || "Obra sin especificar",
      materiales: cotizacion.materiales.length,
      total: calcularTotal(),
      estado: "pendiente",
    }

    // Añadir la cotización al historial
    setHistorialCotizaciones((prev) => [nuevaCotizacion, ...prev])

    // Mostrar mensaje de éxito
    toast({
      title: "Éxito",
      description: `Cotización ${newId} guardada correctamente`,
    })

    // Opcional: cambiar a la vista de historial después de guardar
    setVistaActiva("historial")
  }

  // Generar nombre de archivo para PDF y documento de impresión
  const getDocumentName = () => {
    const clientName = cotizacion.cliente.trim() ? cotizacion.cliente : "Cliente"
    const date = cotizacion.fechaInicio.replace(/-/g, "")
    return `Cotizacion_${clientName}_${date}`
  }

  // Preparar datos para la impresión
  const prepareProductsForPrinting = () => {
    return cotizacion.materiales.map((material) => ({
      code: material.material_id?.toString() || "",
      description: material.descripcion,
      origin: material.origen,
      lithology: material.litologia,
      pv: material.pesoVolumetrico,
      um: material.unidadMedida,
      price: material.precioUnitario,
      freight: material.incluyeFlete ? material.valorFlete : undefined,
    }))
  }

  // Añadir este useEffect después de los otros useEffects
  useEffect(() => {
    // Inicializar todos los materiales existentes como expandidos
    const initialExpandedState: Record<string, boolean> = {}
    cotizacion.materiales.forEach((material) => {
      initialExpandedState[material.id] = true
    })
    setExpandedMaterials(initialExpandedState)
  }, [])

  return (
    <div className="space-y-8">
      <PageTitle
        title="Generar Cotización"
        subtitle="Crea cotizaciones para clientes basadas en las altas de precio"
        icon={<FileText className="h-6 w-6" />}
        action={
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center rounded-full w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Volver al Menú Principal</span>
            </Button>
          </Link>
        }
      />

      {/* Selección de vista: Nueva Cotización o Historial */}
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
          <FileText className="mr-2 h-5 w-5" />
          Nueva Cotización
        </button>
        <button
          onClick={() => setVistaActiva("historial")}
          className={`py-3 px-6 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
            vistaActiva === "historial" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
          }`}
          style={{
            borderBottom: vistaActiva === "historial" ? "2px solid #0001B5" : "none",
            boxShadow: "none",
          }}
        >
          <FileText className="mr-2 h-5 w-5" />
          Historial de Cotizaciones
        </button>
      </div>

      {vistaActiva === "nueva" ? (
        <div className="space-y-8">
          {/* Pestañas de navegación */}
          <div className="border-b">
            <div className="flex space-x-4 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab("informacion-general")
                  const element = document.getElementById("seccion-informacion-general")
                  if (element) element.scrollIntoView({ behavior: "smooth" })
                }}
                className={`py-3 px-4 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
                  activeTab === "informacion-general" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
                }`}
                style={{
                  borderBottom: activeTab === "informacion-general" ? "2px solid #0001B5" : "none",
                  boxShadow: "none",
                }}
              >
                <User className="mr-2 h-5 w-5" />
                Información General
              </button>
              <button
                onClick={() => {
                  setActiveTab("materiales")
                  const element = document.getElementById("seccion-materiales")
                  if (element) element.scrollIntoView({ behavior: "smooth" })
                }}
                className={`py-3 px-4 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
                  activeTab === "materiales" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
                }`}
                style={{
                  borderBottom: activeTab === "materiales" ? "2px solid #0001B5" : "none",
                  boxShadow: "none",
                }}
              >
                <Package className="mr-2 h-5 w-5" />
                Materiales
              </button>
              <button
                onClick={() => {
                  setActiveTab("informacion-adicional")
                  const element = document.getElementById("seccion-informacion-adicional")
                  if (element) element.scrollIntoView({ behavior: "smooth" })
                }}
                className={`py-3 px-4 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
                  activeTab === "informacion-adicional" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
                }`}
                style={{
                  borderBottom: activeTab === "informacion-adicional" ? "2px solid #0001B5" : "none",
                  boxShadow: "none",
                }}
              >
                <Info className="mr-2 h-5 w-5" />
                Información Adicional
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Formulario de cotización */}
            {/* Sección: Información General */}
            {activeTab === "informacion-general" && (
              <Card
                className="shadow-sm overflow-hidden relative border-2 border-[#0001B5]/30 transition-all duration-300 hover:border-[#0001B5]/50 hover:shadow-md"
                id="seccion-informacion-general"
              >
                <CardDecorator position="top-right" color="primary" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-[#0001B5]" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cliente">Cliente</Label>
                      <Input
                        id="cliente"
                        value={cotizacion.cliente}
                        onChange={(e) => handleChange("cliente", e.target.value)}
                        placeholder="Nombre del cliente"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contacto">Contacto</Label>
                      <Input
                        id="contacto"
                        value={cotizacion.contacto}
                        onChange={(e) => handleChange("contacto", e.target.value)}
                        placeholder="Nombre del contacto"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="obra">Obra</Label>
                    <Textarea
                      id="obra"
                      value={cotizacion.obra}
                      onChange={(e) => handleChange("obra", e.target.value)}
                      placeholder="Descripción de la obra"
                      className="resize-none text-base min-h-[100px]"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                        Fecha de Inicio
                      </Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={cotizacion.fechaInicio}
                        onChange={(e) => handleChange("fechaInicio", e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vigencia" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                        Vigencia
                      </Label>
                      <Select value={cotizacion.vigencia} onValueChange={(value) => handleChange("vigencia", value)}>
                        <SelectTrigger id="vigencia" className="h-12 text-base">
                          <SelectValue placeholder="Seleccionar vigencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15 DÍAS">15 DÍAS</SelectItem>
                          <SelectItem value="1 MES">1 MES</SelectItem>
                          <SelectItem value="6 MESES">6 MESES</SelectItem>
                          <SelectItem value="1 AÑO">1 AÑO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaFin" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                        Fecha de Fin (calculada)
                      </Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        value={cotizacion.fechaFin}
                        readOnly
                        className="h-12 text-base bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="modalidad" className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-slate-500" />
                      Modalidad
                    </Label>
                    <Select value={cotizacion.modalidad} onValueChange={(value) => handleChange("modalidad", value)}>
                      <SelectTrigger id="modalidad" className="h-12 text-base">
                        <SelectValue placeholder="Seleccionar modalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECOGIDO">RECOGIDO</SelectItem>
                        <SelectItem value="ENTREGADO">ENTREGADO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botón para guardar la cotización */}
                </CardContent>
              </Card>
            )}

            {/* Sección: Materiales */}
            {activeTab === "materiales" && (
              <Card
                className="shadow-sm overflow-hidden relative border-2 border-[#0001B5]/30 transition-all duration-300 hover:border-[#0001B5]/50 hover:shadow-md"
                id="seccion-materiales"
              >
                <CardDecorator position="bottom-left" color="secondary" />
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Package className="mr-2 h-5 w-5 text-[#0001B5]" />
                    Materiales
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addMaterial} className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Material
                  </Button>
                </CardHeader>
                <CardContent>
                  {/* Versión móvil - Materiales como tarjetas */}
                  <div className="md:hidden space-y-6">
                    {cotizacion.materiales.map((material, index) => (
                      <div key={material.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => toggleMaterialExpansion(material.id)}
                            className="flex items-center text-left font-medium w-full"
                          >
                            <h3 className="font-medium">Material {index + 1}</h3>
                            <div className="ml-2 flex-grow"></div>
                            <div
                              className={`transition-transform duration-200 ${
                                expandedMaterials[material.id] ? "rotate-180" : ""
                              }`}
                            >
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
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </div>
                          </button>
                          {cotizacion.materiales.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMaterial(index)}
                              className="text-red-500 h-8 w-8 p-0 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {expandedMaterials[material.id] && (
                          <>
                            {/* Tipo de Origen con Switch */}
                            <div className="space-y-2 border-b pb-4">
                              <div className="flex items-center justify-between gap-4">
                                <Label
                                  htmlFor={`tipo-origen-${index}`}
                                  className="text-sm font-medium whitespace-nowrap"
                                >
                                  Cantera Propia
                                </Label>
                                <div className="flex-shrink-0">
                                  <Switch
                                    id={`tipo-origen-${index}`}
                                    checked={material.tipoOrigen === "cantera-propia"}
                                    onCheckedChange={(checked) => handleTipoOrigenChange(index, checked)}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Origen (ahora Banco o Cantera) */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                {material.tipoOrigen === "cantera-propia" ? "Cantera" : "Banco"}
                              </Label>
                              {material.tipoOrigen === "cantera-propia" ? (
                                <Select
                                  value={material.cantera_id?.toString()}
                                  onValueChange={(value) => handleCanteraChange(index, Number(value))}
                                >
                                  <SelectTrigger className="h-10 text-sm">
                                    <SelectValue placeholder={`Seleccionar cantera`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {canteras.map((cantera) => (
                                      <SelectItem key={cantera.id} value={cantera.id.toString()}>
                                        {cantera.Nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={material.origen}
                                  onChange={(e) => handleMaterialItemChange(index, "origen", e.target.value)}
                                  placeholder="Nombre del banco"
                                  className="h-10 text-sm"
                                />
                              )}
                            </div>

                            {/* Material (antes Descripción Material) */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Material</Label>
                              {material.tipoOrigen === "cantera-propia" && material.cantera_id ? (
                                <Select
                                  value={material.material_id?.toString()}
                                  onValueChange={(value) => handleMaterialChange(index, Number(value))}
                                >
                                  <SelectTrigger className="h-10 text-sm">
                                    <SelectValue placeholder="Seleccionar material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {materiales[material.cantera_id]?.map((mat) => (
                                      <SelectItem key={mat.id} value={mat.id.toString()}>
                                        {mat.Material}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={material.descripcion}
                                  onChange={(e) => handleMaterialItemChange(index, "descripcion", e.target.value)}
                                  placeholder="Descripción del material"
                                  className="h-10 text-sm"
                                />
                              )}
                            </div>

                            {/* Litología */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Litología</Label>
                              <Input
                                value={material.litologia}
                                onChange={(e) => handleMaterialItemChange(index, "litologia", e.target.value)}
                                placeholder="Litología"
                                className="h-10 text-sm"
                              />
                            </div>

                            {/* Peso Volumétrico */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">P.V.</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={material.pesoVolumetrico || ""}
                                onChange={(e) =>
                                  handleMaterialItemChange(
                                    index,
                                    "pesoVolumetrico",
                                    Number.parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="P.V."
                                className="h-10 text-sm"
                              />
                            </div>

                            {/* Unidad de Medida */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">UM</Label>
                              <Select
                                value={material.unidadMedida}
                                onValueChange={(value) => handleMaterialItemChange(index, "unidadMedida", value)}
                              >
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="UM" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TON">TON</SelectItem>
                                  <SelectItem value="M3">M3</SelectItem>
                                  <SelectItem value="KG">KG</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Precio Unitario */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Precio Unitario</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={material.precioUnitario || ""}
                                onChange={(e) =>
                                  handleMaterialItemChange(
                                    index,
                                    "precioUnitario",
                                    Number.parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="Precio"
                                className="h-10 text-sm"
                              />
                            </div>

                            {/* Flete con Switch */}
                            <div className="space-y-4 border-t pt-4 mt-4">
                              <div className="flex items-center justify-between gap-4">
                                <Label
                                  htmlFor={`incluye-flete-${index}`}
                                  className="text-sm font-medium flex items-center whitespace-nowrap"
                                >
                                  <Truck className="mr-2 h-4 w-4 text-[#0001B5]" />
                                  Flete
                                </Label>
                                <div className="flex-shrink-0">
                                  <Switch
                                    id={`incluye-flete-${index}`}
                                    checked={material.incluyeFlete}
                                    onCheckedChange={(checked) => handleIncluyeFleteChange(index, checked)}
                                  />
                                </div>
                              </div>

                              {material.incluyeFlete && (
                                <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Tipo de Flete</Label>
                                    <RadioGroup
                                      value={material.tipoFlete}
                                      onValueChange={(value: "tonelada" | "viaje" | "cotizacion") =>
                                        handleTipoFleteChange(index, value)
                                      }
                                      className="flex flex-col space-y-2"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="tonelada" id={`flete-tonelada-${index}`} />
                                        <Label htmlFor={`flete-tonelada-${index}`} className="text-sm">
                                          Ton / m3
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="viaje" id={`flete-viaje-${index}`} />
                                        <Label htmlFor={`flete-viaje-${index}`} className="text-sm">
                                          Viaje
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="cotizacion" id={`flete-cotizacion-${index}`} />
                                        <Label htmlFor={`flete-cotizacion-${index}`} className="text-sm">
                                          Cotización existente
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  </div>

                                  {material.tipoFlete === "tonelada" ? (
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Valor del Flete</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={material.valorFlete || ""}
                                        onChange={(e) =>
                                          handleMaterialItemChange(
                                            index,
                                            "valorFlete",
                                            Number.parseFloat(e.target.value) || 0,
                                          )
                                        }
                                        placeholder="Valor del flete"
                                        className="h-10 text-sm"
                                      />
                                    </div>
                                  ) : material.tipoFlete === "viaje" ? (
                                    <>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Toneladas promedio</Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={material.toneladasPromedio || ""}
                                          onChange={(e) =>
                                            handleMaterialItemChange(
                                              index,
                                              "toneladasPromedio",
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
                                          value={material.costoPorViaje || ""}
                                          onChange={(e) =>
                                            handleMaterialItemChange(
                                              index,
                                              "costoPorViaje",
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
                                          value={material.valorFlete.toFixed(2) || ""}
                                          readOnly
                                          className="h-10 text-sm bg-gray-50"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    // Opción de cotización existente
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Cotización seleccionada</Label>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-xs"
                                              onClick={() => setSelectedMaterialIndex(index)}
                                            >
                                              {material.cotizacionFleteId
                                                ? "Cambiar cotización"
                                                : "Seleccionar cotización"}
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
                                                      <TableHead className="text-center">
                                                        Ubicación Suministro
                                                      </TableHead>
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
                                                                    selectedMaterialIndex !== null
                                                                      ? selectedMaterialIndex
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
                                      {material.cotizacionFleteId ? (
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <p className="text-sm font-medium">
                                                Cotización: {material.cotizacionFleteId}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                Valor del flete: {formatCurrency(material.valorFlete)}
                                              </p>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 text-gray-500"
                                              onClick={() => {
                                                setCotizacion((prev) => {
                                                  const updatedMateriales = [...prev.materiales]
                                                  updatedMateriales[index] = {
                                                    ...updatedMateriales[index],
                                                    cotizacionFleteId: undefined,
                                                    valorFlete: 0,
                                                  }
                                                  return {
                                                    ...prev,
                                                    materiales: updatedMateriales,
                                                  }
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

                    {/* Total para versión móvil */}
                    <div className="mt-6 bg-slate-50 p-4 rounded-lg border">
                      <div className="text-lg font-medium text-center">Total: {formatCurrency(calcularTotal())}</div>
                    </div>
                  </div>

                  {/* Versión desktop - Vista de tarjetas */}
                  <div className="hidden md:block">
                    {cotizacion.materiales.map((material, index) => (
                      <div key={material.id} className="border rounded-lg p-6 mb-6 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <button
                            onClick={() => toggleMaterialExpansion(material.id)}
                            className="flex items-center text-left"
                          >
                            <h3 className="text-lg font-medium flex items-center">
                              <Package className="h-5 w-5 mr-2 text-[#0001B5]" />
                              Material {index + 1}
                            </h3>
                            <div
                              className={`ml-3 transition-transform duration-200 ${
                                expandedMaterials[material.id] ? "rotate-180" : ""
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </div>
                          </button>
                          {cotizacion.materiales.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMaterial(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          )}
                        </div>

                        {expandedMaterials[material.id] && (
                          <div className="grid grid-cols-2 gap-6">
                            {/* Columna izquierda */}
                            <div className="space-y-6">
                              {/* Tipo de Origen */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`tipo-origen-desktop-${index}`} className="font-medium">
                                    Cantera Propia
                                  </Label>
                                  <Switch
                                    id={`tipo-origen-desktop-${index}`}
                                    checked={material.tipoOrigen === "cantera-propia"}
                                    onCheckedChange={(checked) => handleTipoOrigenChange(index, checked)}
                                  />
                                </div>
                              </div>

                              {/* Origen (Banco o Cantera) */}
                              <div className="space-y-2">
                                <Label className="font-medium">
                                  {material.tipoOrigen === "cantera-propia" ? "Cantera" : "Banco"}
                                </Label>
                                {material.tipoOrigen === "cantera-propia" ? (
                                  <Select
                                    value={material.cantera_id?.toString()}
                                    onValueChange={(value) => handleCanteraChange(index, Number(value))}
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
                                ) : (
                                  <Input
                                    value={material.origen}
                                    onChange={(e) => handleMaterialItemChange(index, "origen", e.target.value)}
                                    placeholder="Nombre del banco"
                                    className="h-11"
                                  />
                                )}
                              </div>

                              {/* Material */}
                              <div className="space-y-2">
                                <Label className="font-medium">Material</Label>
                                {material.tipoOrigen === "cantera-propia" && material.cantera_id ? (
                                  <Select
                                    value={material.material_id?.toString()}
                                    onValueChange={(value) => handleMaterialChange(index, Number(value))}
                                  >
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Seleccionar material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {materiales[material.cantera_id]?.map((mat) => (
                                        <SelectItem key={mat.id} value={mat.id.toString()}>
                                          {mat.Material}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    value={material.descripcion}
                                    onChange={(e) => handleMaterialItemChange(index, "descripcion", e.target.value)}
                                    placeholder="Descripción del material"
                                    className="h-11"
                                  />
                                )}
                              </div>

                              {/* Litología */}
                              <div className="space-y-2">
                                <Label className="font-medium">Litología</Label>
                                <Input
                                  value={material.litologia}
                                  onChange={(e) => handleMaterialItemChange(index, "litologia", e.target.value)}
                                  placeholder="Litología"
                                  className="h-11"
                                />
                              </div>

                              {/* Peso Volumétrico */}
                              <div className="space-y-2">
                                <Label className="font-medium">P.V.</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={material.pesoVolumetrico || ""}
                                  onChange={(e) =>
                                    handleMaterialItemChange(
                                      index,
                                      "pesoVolumetrico",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  placeholder="P.V."
                                  className="h-11"
                                />
                              </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="space-y-6">
                              {/* Unidad de Medida */}
                              <div className="space-y-2">
                                <Label className="font-medium">Unidad de Medida</Label>
                                <Select
                                  value={material.unidadMedida}
                                  onChange={(value) => handleMaterialItemChange(index, "unidadMedida", value)}
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="UM" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="TON">TON</SelectItem>
                                    <SelectItem value="M3">M3</SelectItem>
                                    <SelectItem value="KG">KG</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Precio Unitario */}
                              <div className="space-y-2">
                                <Label className="font-medium">Precio Unitario</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={material.precioUnitario || ""}
                                  onChange={(e) =>
                                    handleMaterialItemChange(
                                      index,
                                      "precioUnitario",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  placeholder="Precio"
                                  className="h-11"
                                />
                              </div>

                              {/* Flete */}
                              <div className="space-y-4 border-t pt-4 mt-4">
                                <div className="flex items-center justify-between">
                                  <Label
                                    htmlFor={`incluye-flete-desktop-${index}`}
                                    className="font-medium flex items-center"
                                  >
                                    <Truck className="mr-2 h-4 w-4 text-[#0001B5]" />
                                    Flete
                                  </Label>
                                  <Switch
                                    id={`incluye-flete-desktop-${index}`}
                                    checked={material.incluyeFlete}
                                    onCheckedChange={(checked) => handleIncluyeFleteChange(index, checked)}
                                  />
                                </div>

                                {material.incluyeFlete && (
                                  <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                                    <div className="space-y-2">
                                      <Label className="font-medium">Tipo de Flete</Label>
                                      <RadioGroup
                                        value={material.tipoFlete}
                                        onValueChange={(value: "tonelada" | "viaje" | "cotizacion") =>
                                          handleTipoFleteChange(index, value)
                                        }
                                        className="flex space-x-6"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="tonelada" id={`flete-tonelada-desktop-${index}`} />
                                          <Label htmlFor={`flete-tonelada-desktop-${index}`}>Ton / m3</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="viaje" id={`flete-viaje-desktop-${index}`} />
                                          <Label htmlFor={`flete-viaje-desktop-${index}`}>Viaje</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="cotizacion" id={`flete-cotizacion-desktop-${index}`} />
                                          <Label htmlFor={`flete-cotizacion-desktop-${index}`}>
                                            Cotización existente
                                          </Label>
                                        </div>
                                      </RadioGroup>
                                    </div>

                                    {material.tipoFlete === "tonelada" ? (
                                      <div className="space-y-2">
                                        <Label className="font-medium">Valor del Flete</Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={material.valorFlete || ""}
                                          onChange={(e) =>
                                            handleMaterialItemChange(
                                              index,
                                              "valorFlete",
                                              Number.parseFloat(e.target.value) || 0,
                                            )
                                          }
                                          placeholder="Valor del flete"
                                          className="h-11"
                                        />
                                      </div>
                                    ) : material.tipoFlete === "viaje" ? (
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label className="font-medium">Toneladas promedio</Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={material.toneladasPromedio || ""}
                                            onChange={(e) =>
                                              handleMaterialItemChange(
                                                index,
                                                "toneladasPromedio",
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
                                            value={material.costoPorViaje || ""}
                                            onChange={(e) =>
                                              handleMaterialItemChange(
                                                index,
                                                "costoPorViaje",
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
                                            {formatCurrency(material.valorFlete)}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      // Opción de cotización existente
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <Label className="font-medium">Cotización seleccionada</Label>
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedMaterialIndex(index)}
                                              >
                                                {material.cotizacionFleteId
                                                  ? "Cambiar cotización"
                                                  : "Seleccionar cotización"}
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
                                                        <TableHead className="text-center">
                                                          Ubicación Suministro
                                                        </TableHead>
                                                        <TableHead className="text-center">
                                                          Ubicación Proyecto
                                                        </TableHead>
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
                                                                      selectedMaterialIndex !== null
                                                                        ? selectedMaterialIndex
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
                                        {material.cotizacionFleteId ? (
                                          <div className="p-4 bg-gray-50 rounded-md border">
                                            <div className="flex justify-between items-center">
                                              <div>
                                                <p className="font-medium">Cotización: {material.cotizacionFleteId}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                  Valor del flete: {formatCurrency(material.valorFlete)}
                                                </p>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-500"
                                                onClick={() => {
                                                  setCotizacion((prev) => {
                                                    const updatedMateriales = [...prev.materiales]
                                                    updatedMateriales[index] = {
                                                      ...updatedMateriales[index],
                                                      cotizacionFleteId: undefined,
                                                      valorFlete: 0,
                                                    }
                                                    return {
                                                      ...prev,
                                                      materiales: updatedMateriales,
                                                    }
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
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Total de la cotización */}
                    <div className="mt-6 flex justify-end">
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="text-lg font-medium">Total: {formatCurrency(calcularTotal())}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sección: Información Adicional */}
            {activeTab === "informacion-adicional" && (
              <Card
                className="shadow-sm overflow-hidden relative border-2 border-[#0001B5]/30 transition-all duration-300 hover:border-[#0001B5]/50 hover:shadow-md"
                id="seccion-informacion-adicional"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Info className="mr-2 h-5 w-5 text-[#0001B5]" />
                    Información Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="premisas">Premisas</Label>
                    <Textarea
                      id="premisas"
                      value={cotizacion.premisas}
                      onChange={(e) => handleChange("premisas", e.target.value)}
                      placeholder="Premisas de la cotización"
                      className="resize-none text-base min-h-[120px]"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notas">Notas</Label>
                    <Textarea
                      id="notas"
                      value={cotizacion.notas}
                      onChange={(e) => handleChange("notas", e.target.value)}
                      placeholder="Notas adicionales"
                      className="resize-none text-base min-h-[120px]"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firmante">Firmante</Label>
                      <Input
                        id="firmante"
                        value={cotizacion.firmante}
                        onChange={(e) => handleChange("firmante", e.target.value)}
                        placeholder="Nombre del firmante"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        value={cotizacion.cargo}
                        onChange={(e) => handleChange("cargo", e.target.value)}
                        placeholder="Cargo del firmante"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={cotizacion.telefono}
                        onChange={(e) => handleChange("telefono", e.target.value)}
                        placeholder="Teléfono de contacto"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={cotizacion.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Correo electrónico"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  {/* Botón de imprimir cotización movido a esta sección */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                    <SharePdfButton
                      contentRef={printRef}
                      fileName={getDocumentName()}
                      clientName={cotizacion.cliente}
                      clientContact={cotizacion.contacto}
                      projectName={cotizacion.obra}
                      products={prepareProductsForPrinting()}
                      premises={cotizacion.premisas}
                      notes={cotizacion.notas}
                      representativeName={cotizacion.firmante}
                      representativePosition={cotizacion.cargo}
                      representativePhone={cotizacion.telefono}
                      representativeEmail={cotizacion.email}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Componente oculto para impresión - Ya no es necesario con la nueva implementación */}
          <div className="hidden">
            <div ref={printRef} className="p-8 bg-white">
              {/* Este contenido ya no se usa directamente, pero mantenemos la referencia para compatibilidad */}
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Historial de Cotizaciones */
        <div className="space-y-6">
          <Card className="shadow-sm overflow-hidden relative border-2 border-[#0001B5]/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-[#0001B5]" />
                Historial de Cotizaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar cotización..."
                      className="pl-9 h-10"
                      value={searchTermHistorial}
                      onChange={(e) => setSearchTermHistorial(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setVistaActiva("nueva")} className="bg-[#0001B5] hover:bg-[#00018c]">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Cotización
                  </Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">ID</TableHead>
                        <TableHead className="text-center">Fecha</TableHead>
                        <TableHead className="text-center">Cliente</TableHead>
                        <TableHead className="text-center">Obra</TableHead>
                        <TableHead className="text-center">Materiales</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistorialCotizaciones.length > 0 ? (
                        filteredHistorialCotizaciones.map((cotizacion) => (
                          <TableRow key={cotizacion.id}>
                            <TableCell className="font-medium text-center">{cotizacion.id}</TableCell>
                            <TableCell className="text-center">{cotizacion.fecha}</TableCell>
                            <TableCell>{cotizacion.cliente}</TableCell>
                            <TableCell>{cotizacion.obra}</TableCell>
                            <TableCell className="text-center">{cotizacion.materiales}</TableCell>
                            <TableCell className="text-center font-medium">
                              {formatCurrency(cotizacion.total)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`
                                ${
                                  cotizacion.estado === "aprobada"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : cotizacion.estado === "pendiente"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      : cotizacion.estado === "rechazada"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                }
                                rounded-full px-2 py-0.5 text-xs
                              `}
                              >
                                {cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
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
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No se encontraron cotizaciones
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
