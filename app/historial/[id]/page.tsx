"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@/components/user-context"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Construction } from "lucide-react"
import Link from "next/link"
import { PageTitle } from "@/components/page-title"
import { CardDecorator } from "@/components/ui-elements"

type Cotizacion = {
  id: number
  fecha_creacion: string
  fecha_inicio: string
  fecha_fin: string
  tipo_cotizacion: string
  estado: string
  numero_destino: string
  nombre_destinatario: string
  usuario: {
    id: number
    Nombre: string
  }
}

type DetalleCotizacion = {
  id: number
  cantera: {
    id: number
    Nombre: string
  }
  material: {
    id: number
    Material: string
  }
  modalidad: string
  precio: number
  incluye_flete: boolean
  valor_flete: number | null
  unidad_medida: string
  toneladas_promedio: number | null
  costo_flete_tonelada: number | null
  calidad_material: {
    id: number
    nombre: string
  } | null
  volumen_recurrente: {
    id: number
    descripcion: string
  } | null
  segmento: {
    id: number
    nombre: string
  } | null
}

export default function CotizacionDetalle() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [detalles, setDetalles] = useState<DetalleCotizacion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()
  const cotizacionId = params.id as string

  useEffect(() => {
    const fetchCotizacion = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Get cotizacion
        const { data: cotizacionData, error: cotizacionError } = await supabase
          .from("Cotizaciones")
          .select(`
            id,
            fecha_creacion,
            fecha_inicio,
            fecha_fin,
            tipo_cotizacion,
            estado,
            numero_destino,
            nombre_destinatario,
            usuario:Roles de Usuarios (id, Nombre)
          `)
          .eq("id", cotizacionId)
          .single()

        if (cotizacionError) throw cotizacionError
        setCotizacion(cotizacionData)

        // Get detalles
        const { data: detallesData, error: detallesError } = await supabase
          .from("Detalles Cotizacion")
          .select(`
            id,
            cantera:cantera_id (id, Nombre),
            material:material_id (id, Material),
            modalidad,
            precio,
            incluye_flete,
            valor_flete,
            unidad_medida,
            toneladas_promedio,
            costo_flete_tonelada,
            calidad_material:Calidad Material (id, nombre),
            volumen_recurrente:Volumen Recurrente (id, descripcion),
            segmento:Segmentos (id, nombre)
          `)
          .eq("cotizacion_id", cotizacionId)

        if (detallesError) throw detallesError
        setDetalles(detallesData || [])
      } catch (error) {
        console.error("Error fetching cotizacion:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la cotización",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCotizacion()
  }, [user, cotizacionId, toast])

  const handleSendForApproval = async () => {
    if (!cotizacion) return

    try {
      const { error } = await supabase
        .from("Cotizaciones")
        .update({ estado: "Enviado a aprobación" })
        .eq("id", cotizacion.id)

      if (error) throw error

      // Update local state
      setCotizacion({
        ...cotizacion,
        estado: "Enviado a aprobación",
      })

      toast({
        title: "Éxito",
        description: "Cotización enviada a aprobación",
      })
    } catch (error) {
      console.error("Error sending for approval:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar la cotización a aprobación",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 rounded-full px-3">
            Pendiente
          </Badge>
        )
      case "Enviado a aprobación":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3">
            Enviado a aprobación
          </Badge>
        )
      case "Aprobado":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 rounded-full px-3">
            Aprobado
          </Badge>
        )
      case "Rechazado":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 rounded-full px-3">
            Rechazado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="rounded-full px-3">
            {status}
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#0001B5] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (!cotizacion) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 bg-[#0001B5]/10 rounded-full blur-xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-12 w-12 text-[#0001B5]/50" />
          </div>
        </div>
        <p className="text-lg text-muted-foreground mb-6">No se encontró la cotización</p>
        <Link href="/historial">
          <Button className="flex items-center rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al historial
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title={`Detalle de Alta de Precio #${cotizacion.id}`}
        subtitle="Información detallada del alta de precio"
        icon={<FileText className="h-6 w-6" />}
        action={
          <Link href="/historial">
            <Button variant="outline" className="flex items-center rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />

      <Card className="shadow-sm overflow-hidden relative">
        <CardDecorator position="top-right" color="primary" size="lg" />
        <CardDecorator position="bottom-left" color="secondary" size="md" />
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-[#0001B5]/10 rounded-full blur-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Construction className="h-12 w-12 text-[#0001B5]" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0001B5] mb-3">Sección en Desarrollo</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md text-center">
            Esta funcionalidad se encuentra actualmente en desarrollo y estará disponible próximamente.
          </p>

          <Link href="/dashboard">
            <Button className="bg-[#0001B5] hover:bg-[#00018c] rounded-full">Volver al Menú Principal</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
