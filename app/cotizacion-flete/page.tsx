"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useUser } from "@/components/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Truck, ArrowLeft, MapPin, Package, Building, Map, Camera, Shield, Route, Locate, LinkIcon } from "lucide-react"
import Link from "next/link"
import { PageTitle } from "@/components/page-title"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Copy, Trash2, Clock, Filter, Search, FileText, History } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function CotizacionFlete() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("form")

  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    ubicacionSuministro: "",
    idMaterial: "",
    ubicacionProyecto: "",
    direccionDestino: "",
    fotografiasEntrada: [null, null, null] as (File | null)[],
    datosSeguridadRequeridos: "",
    rutaEntradaDescarga: "",
  })

  // Estado para la geolocalización
  const [geoLocation, setGeoLocation] = useState<{
    latitude: number | null
    longitude: number | null
    error: string | null
    loading: boolean
  }>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  })

  // Estado para el tipo de entrada de ubicación
  const [locationInputType, setLocationInputType] = useState<"link" | "current">("link")

  // Estado para el historial de cotizaciones
  const [historialCotizaciones, setHistorialCotizaciones] = useState<
    Array<{
      id: string
      fecha: Date
      ubicacionSuministro: string
      ubicacionProyecto: string
      idMaterial: string
      estado: "pendiente" | "aprobada" | "rechazada" | "completada" | "validado"
      precio?: string
      tiempoRespuesta?: string
    }>
  >([
    {
      id: "COT-001",
      fecha: new Date(2023, 4, 15),
      ubicacionSuministro: "Cantera Norte, Km 34",
      ubicacionProyecto: "Zona Industrial, Sector 3",
      idMaterial: "MAT-001",
      estado: "aprobada",
      tiempoRespuesta: "3 días",
    },
    {
      id: "COT-002",
      fecha: new Date(2023, 5, 2),
      ubicacionSuministro: "Cantera Sur, Km 12",
      ubicacionProyecto: "Residencial Las Palmas",
      idMaterial: "MAT-003",
      estado: "pendiente",
      tiempoRespuesta: "5 días y contando",
    },
    {
      id: "COT-003",
      fecha: new Date(2023, 5, 10),
      ubicacionSuministro: "Cantera Este, Km 45",
      ubicacionProyecto: "Centro Comercial Plaza Mayor",
      idMaterial: "MAT-002",
      estado: "rechazada",
      tiempoRespuesta: "2 días",
    },
    {
      id: "COT-004",
      fecha: new Date(2023, 5, 18),
      ubicacionSuministro: "Cantera Oeste, Km 22",
      ubicacionProyecto: "Hospital Regional",
      idMaterial: "MAT-005",
      estado: "completada",
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

  // Estado para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Manejar cambios en los campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejar cambios en los archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0]
      const newFotos = [...formData.fotografiasEntrada]
      newFotos[index] = newFile

      setFormData((prev) => ({
        ...prev,
        fotografiasEntrada: newFotos,
      }))
    }
  }

  // Reemplazar la función para eliminar una foto
  const removeFoto = (index: number) => {
    const newFotos = [...formData.fotografiasEntrada]
    newFotos[index] = null

    setFormData((prev) => ({
      ...prev,
      fotografiasEntrada: newFotos,
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío
    setTimeout(() => {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cotización de flete ha sido enviada correctamente.",
      })
      setIsSubmitting(false)
      // Aquí podrías redirigir al usuario o mostrar un mensaje de éxito
    }, 1500)
  }

  // Función para ver detalles de una cotización
  const verDetalle = (id: string) => {
    toast({
      title: "Ver detalle",
      description: `Viendo detalle de la cotización ${id}`,
    })
    // Aquí se implementaría la lógica para mostrar los detalles
  }

  // Función para duplicar una cotización
  const duplicarCotizacion = (cotizacion: any) => {
    // Rellenar el formulario con los datos de la cotización seleccionada
    setFormData({
      ...formData,
      ubicacionSuministro: cotizacion.ubicacionSuministro,
      idMaterial: cotizacion.idMaterial,
      ubicacionProyecto: cotizacion.ubicacionProyecto,
      direccionDestino: "",
      fotografiasEntrada: [null, null, null],
      datosSeguridadRequeridos: "",
      rutaEntradaDescarga: "",
    })

    toast({
      title: "Cotización duplicada",
      description: `Se han cargado los datos de la cotización ${cotizacion.id}`,
    })

    // Cambiar a la pestaña del formulario
    setActiveTab("form")
  }

  // Función para eliminar una cotización
  const eliminarCotizacion = (id: string) => {
    // Filtrar la cotización del estado
    setHistorialCotizaciones(historialCotizaciones.filter((cot) => cot.id !== id))

    toast({
      title: "Cotización eliminada",
      description: `La cotización ${id} ha sido eliminada`,
    })
  }

  // Función para filtrar cotizaciones
  const filteredCotizaciones = historialCotizaciones.filter((cotizacion) => {
    // Filtrar por término de búsqueda
    const matchesSearch =
      cotizacion.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.ubicacionSuministro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.ubicacionProyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.idMaterial.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por estado
    const matchesStatus = statusFilter ? cotizacion.estado === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Función para intentar abrir la configuración de ubicación
  const openLocationSettings = () => {
    // Detectar el navegador y sistema operativo
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)
    const isChrome = /Chrome/i.test(navigator.userAgent)
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)
    const isFirefox = /Firefox/i.test(navigator.userAgent)

    try {
      if (isIOS) {
        // En iOS, redirigir a la configuración de ubicación
        window.open("app-settings:location")
        toast({
          title: "Redirección",
          description: "Si no se abre automáticamente, ve a Configuración > Privacidad > Servicios de ubicación",
        })
      } else if (isAndroid) {
        if (isChrome) {
          // En Android Chrome
          window.open("chrome://settings/content/location")
        } else {
          // Otros navegadores en Android
          window.open("https://support.google.com/chrome/answer/142065", "_blank")
        }
        toast({
          title: "Redirección",
          description: "Si no se abre automáticamente, ve a Configuración > Ubicación",
        })
      } else if (isChrome) {
        // Chrome en escritorio
        window.open("chrome://settings/content/location")
        toast({
          title: "Redirección",
          description:
            "Si no se abre automáticamente, ve a Configuración > Privacidad y seguridad > Configuración de sitios > Ubicación",
        })
      } else if (isFirefox) {
        // Firefox
        window.open("about:preferences#privacy", "_blank")
        toast({
          title: "Redirección",
          description: "Ve a Privacidad y seguridad > Permisos > Ubicación",
        })
      } else if (isSafari) {
        // Safari
        toast({
          title: "Configuración de Safari",
          description: "Ve a Preferencias > Sitios web > Ubicación",
        })
      } else {
        // Navegador no identificado
        toast({
          title: "Configuración de ubicación",
          description: "Por favor, habilita los permisos de ubicación en la configuración de tu navegador",
        })
      }
    } catch (error) {
      console.error("Error al abrir la configuración:", error)
      toast({
        title: "No se pudo abrir la configuración",
        description:
          "Por favor, habilita manualmente los permisos de ubicación en la configuración de tu navegador o dispositivo",
        variant: "destructive",
      })
    }
  }

  // Función para obtener la ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoLocation((prev) => ({
        ...prev,
        error: "La geolocalización no es compatible con este navegador.",
      }))
      toast({
        title: "Error",
        description: "La geolocalización no es compatible con este navegador.",
        variant: "destructive",
      })
      return
    }

    setGeoLocation((prev) => ({ ...prev, loading: true }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setGeoLocation({
          latitude,
          longitude,
          error: null,
          loading: false,
        })

        // Actualizar el campo de dirección con las coordenadas
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
        setFormData((prev) => ({
          ...prev,
          direccionDestino: googleMapsUrl,
        }))

        toast({
          title: "Ubicación obtenida",
          description: "Se ha capturado tu ubicación actual correctamente.",
        })
      },
      (error) => {
        let errorMessage = "Error al obtener la ubicación."
        let isPermissionDenied = false

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor, habilita el acceso a tu ubicación."
            isPermissionDenied = true
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "La información de ubicación no está disponible."
            break
          case error.TIMEOUT:
            errorMessage = "Se agotó el tiempo para obtener la ubicación."
            break
        }

        setGeoLocation({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
        })

        if (isPermissionDenied) {
          // Mostrar toast con opción para abrir configuración
          toast({
            title: "Permiso denegado",
            description: (
              <div className="space-y-2">
                <p>Necesitamos acceso a tu ubicación para continuar.</p>
                <Button onClick={openLocationSettings} variant="outline" size="sm" className="w-full mt-2">
                  Abrir configuración de ubicación
                </Button>
              </div>
            ),
            variant: "destructive",
            duration: 10000, // Duración más larga para dar tiempo a leer
          })
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Cotización de Flete"
        subtitle="Completa el formulario para solicitar una cotización de flete"
        icon={<Truck className="h-6 w-6" />}
        action={
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center rounded-full w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Volver al Menú Principal</span>
            </Button>
          </Link>
        }
      />

      {/* Pestañas de navegación */}
      <div className="flex flex-col space-y-6">
        <div className="border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("form")}
              className={`py-3 px-4 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
                activeTab === "form" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
              }`}
              style={{
                borderBottom: activeTab === "form" ? "2px solid #0001B5" : "none",
                boxShadow: "none",
              }}
            >
              <FileText className="mr-2 h-5 w-5" />
              Información de Ubicaciones y Material
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-4 font-medium text-lg flex items-center relative transition-colors duration-200 bg-transparent shadow-none outline-none ${
                activeTab === "history" ? "text-[#0001B5]" : "text-gray-600 hover:text-[#0001B5]"
              }`}
              style={{
                borderBottom: activeTab === "history" ? "2px solid #0001B5" : "none",
                boxShadow: "none",
              }}
            >
              <History className="mr-2 h-5 w-5" />
              Historial de Solicitudes
            </button>
          </div>
        </div>

        {/* Contenido de la pestaña de formulario */}
        {activeTab === "form" && (
          <form onSubmit={handleSubmit}>
            <Card className="shadow-sm overflow-hidden relative border-2 border-[#0001B5]/30 transition-all duration-300 hover:border-[#0001B5]/50 hover:shadow-md">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xl flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-[#0001B5]" />
                  Información de Ubicaciones y Material
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ubicación del suministro del material */}
                  <div className="space-y-2">
                    <Label htmlFor="ubicacionSuministro" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-[#0001B5]" />
                      Ubicación del suministro del material
                    </Label>
                    <Input
                      id="ubicacionSuministro"
                      name="ubicacionSuministro"
                      value={formData.ubicacionSuministro}
                      onChange={handleInputChange}
                      placeholder="Ej. Cantera Norte, Km 34"
                      className="h-11"
                      required
                    />
                  </div>

                  {/* ID del material a suministrar */}
                  <div className="space-y-2">
                    <Label htmlFor="idMaterial" className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-[#0001B5]" />
                      ID del material a suministrar
                    </Label>
                    <Input
                      id="idMaterial"
                      name="idMaterial"
                      value={formData.idMaterial}
                      onChange={handleInputChange}
                      placeholder="Ej. MAT-001"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ubicación del proyecto */}
                  <div className="space-y-2">
                    <Label htmlFor="ubicacionProyecto" className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-[#0001B5]" />
                      Ubicación del proyecto
                    </Label>
                    <Input
                      id="ubicacionProyecto"
                      name="ubicacionProyecto"
                      value={formData.ubicacionProyecto}
                      onChange={handleInputChange}
                      placeholder="Ej. Zona Industrial, Sector 3"
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Dirección del destino por medio de Google Maps */}
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Map className="h-4 w-4 mr-2 text-[#0001B5]" />
                      Dirección del destino (Google Maps)
                    </Label>

                    <Tabs
                      defaultValue="link"
                      onValueChange={(value) => setLocationInputType(value as "link" | "current")}
                    >
                      <TabsList className="grid w-full grid-cols-2 mb-2">
                        <TabsTrigger value="link" className="flex items-center">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Insertar link
                        </TabsTrigger>
                        <TabsTrigger value="current" className="flex items-center">
                          <Locate className="h-4 w-4 mr-2" />
                          Ubicación actual
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="link" className="mt-0">
                        <Input
                          id="direccionDestino"
                          name="direccionDestino"
                          value={formData.direccionDestino}
                          onChange={handleInputChange}
                          placeholder="Ej. https://maps.google.com/?q=..."
                          className="h-11"
                          required={locationInputType === "link"}
                        />
                      </TabsContent>

                      <TabsContent value="current" className="mt-0">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              value={formData.direccionDestino}
                              readOnly
                              placeholder="Haz clic en 'Obtener ubicación actual'"
                              className="h-11 flex-grow"
                            />
                            <Button
                              type="button"
                              onClick={getCurrentLocation}
                              className="bg-[#0001B5] hover:bg-[#00018c]"
                              disabled={geoLocation.loading}
                            >
                              {geoLocation.loading ? (
                                <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  Obteniendo...
                                </>
                              ) : (
                                <>
                                  <Locate className="h-4 w-4 mr-2" />
                                  Obtener ubicación
                                </>
                              )}
                            </Button>
                          </div>

                          {geoLocation.latitude && geoLocation.longitude && (
                            <div className="text-xs text-green-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              Ubicación capturada: {geoLocation.latitude.toFixed(6)}, {geoLocation.longitude.toFixed(6)}
                            </div>
                          )}

                          {geoLocation.error && (
                            <div className="text-xs text-red-600 flex items-center">
                              <Shield className="h-3 w-3 mr-1" />
                              {geoLocation.error}{" "}
                              {geoLocation.error.includes("denegado") && (
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs text-red-600 underline ml-1"
                                  onClick={openLocationSettings}
                                >
                                  Abrir configuración
                                </Button>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-gray-500 flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            Tu ubicación solo se utilizará para generar el enlace de Google Maps.
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Fotografías de la entrada */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Camera className="h-4 w-4 mr-2 text-[#0001B5]" />
                    Fotografías de la entrada (3 fotos)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0001B5]/50 transition-colors flex flex-col items-center justify-center relative"
                        style={{ minHeight: "140px" }}
                      >
                        {formData.fotografiasEntrada[index] ? (
                          <>
                            <div className="text-sm text-[#0001B5] mb-2 overflow-hidden text-ellipsis w-full">
                              {formData.fotografiasEntrada[index]?.name}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {(formData.fotografiasEntrada[index]?.size || 0) < 1024 * 1024
                                ? `${Math.round((formData.fotografiasEntrada[index]?.size || 0) / 1024)} KB`
                                : `${Math.round(((formData.fotografiasEntrada[index]?.size || 0) / (1024 * 1024)) * 10) / 10} MB`}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => {
                                  const input = document.getElementById(`foto-${index}`) as HTMLInputElement
                                  if (input) input.click()
                                }}
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                Cambiar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                onClick={() => removeFoto(index)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <input
                              id={`foto-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, index)}
                              className="hidden"
                            />
                            <label
                              htmlFor={`foto-${index}`}
                              className="cursor-pointer flex flex-col items-center justify-center"
                            >
                              <Camera className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Foto {index + 1}</p>
                              <p className="text-xs text-gray-400 mt-1">Haz clic para subir</p>
                            </label>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Formatos permitidos: PNG, JPG, GIF hasta 10MB
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos de tema de seguridad */}
                  <div className="space-y-2">
                    <Label htmlFor="datosSeguridadRequeridos" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-[#0001B5]" />
                      Datos de tema de seguridad
                    </Label>
                    <Textarea
                      id="datosSeguridadRequeridos"
                      name="datosSeguridadRequeridos"
                      value={formData.datosSeguridadRequeridos}
                      onChange={handleInputChange}
                      placeholder="Especifica requisitos de seguridad, equipo necesario, etc."
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Ruta desde la entrada al área de descarga */}
                  <div className="space-y-2">
                    <Label htmlFor="rutaEntradaDescarga" className="flex items-center">
                      <Route className="h-4 w-4 mr-2 text-[#0001B5]" />
                      Ruta desde la entrada al área de descarga
                    </Label>
                    <Textarea
                      id="rutaEntradaDescarga"
                      name="rutaEntradaDescarga"
                      value={formData.rutaEntradaDescarga}
                      onChange={handleInputChange}
                      placeholder="Describe la ruta que debe seguir el transportista desde la entrada hasta el área de descarga"
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
              <Link href="/dashboard">
                <Button variant="outline" type="button" className="w-full sm:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#0001B5] hover:bg-[#00018c] w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Solicitar Cotización
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Contenido de la pestaña de historial */}
        {activeTab === "history" && (
          <Card className="shadow-sm overflow-hidden border-2 border-[#0001B5]/30">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-xl flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-[#0001B5]" />
                  Solicitudes Anteriores
                </CardTitle>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Buscador */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar cotización..."
                      className="pl-9 h-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filtro de estado */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10">
                        <Filter className="mr-2 h-4 w-4" />
                        {statusFilter ? `Estado: ${statusFilter}` : "Filtrar por estado"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setStatusFilter(null)}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("pendiente")}>Pendiente</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("aprobada")}>Aprobada</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("rechazada")}>Rechazada</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("completada")}>Completada</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("validado")}>Validado</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center">Fecha</TableHead>
                      <TableHead className="text-center">Ubicación Suministro</TableHead>
                      <TableHead className="text-center">Ubicación Proyecto</TableHead>
                      <TableHead className="text-center">ID Material</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Tiempo</TableHead>
                      <TableHead className="text-center">Precio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCotizaciones.length > 0 ? (
                      filteredCotizaciones.map((cotizacion) => (
                        <TableRow key={cotizacion.id}>
                          <TableCell className="font-medium">{cotizacion.id}</TableCell>
                          <TableCell>{formatDate(cotizacion.fecha)}</TableCell>
                          <TableCell>{cotizacion.ubicacionSuministro}</TableCell>
                          <TableCell>{cotizacion.ubicacionProyecto}</TableCell>
                          <TableCell>{cotizacion.idMaterial}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`
                                ${cotizacion.estado === "pendiente" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}
                                ${cotizacion.estado === "aprobada" ? "bg-green-50 text-green-700 border-green-200" : ""}
                                ${cotizacion.estado === "rechazada" ? "bg-red-50 text-red-700 border-red-200" : ""}
                                ${cotizacion.estado === "completada" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                                ${cotizacion.estado === "validado" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                                rounded-full px-2 py-0.5 text-xs
                              `}
                            >
                              {cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {cotizacion.tiempoRespuesta ? (
                              <span
                                className={`${cotizacion.estado === "pendiente" ? "text-amber-600" : "text-gray-700"}`}
                              >
                                {cotizacion.tiempoRespuesta}
                                {cotizacion.estado === "pendiente" && <span className="ml-1 animate-pulse">•</span>}
                              </span>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {cotizacion.precio ? (
                              <span className="font-medium text-green-600">{cotizacion.precio}</span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs py-1 px-2 h-auto"
                                onClick={() => {
                                  toast({
                                    title: "Funcionalidad en desarrollo",
                                    description: "La opción para agregar precio estará disponible próximamente.",
                                  })
                                }}
                              >
                                Agregar precio
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menú</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => verDetalle(cotizacion.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicarCotizacion(cotizacion)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => eliminarCotizacion(cotizacion.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No se encontraron cotizaciones
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
