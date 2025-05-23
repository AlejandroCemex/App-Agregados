"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SaveAsPdfButtonProps {
  contentRef: React.RefObject<HTMLElement>
  fileName: string
}

export function SaveAsPdfButton({ contentRef, fileName }: SaveAsPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveAsPdf = async () => {
    if (!contentRef.current) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el contenido para exportar",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Importar las dependencias de manera dinámica
      const jspdfPromise = import("jspdf").catch((err) => {
        console.error("Error loading jspdf:", err)
        throw new Error("No se pudo cargar el módulo de PDF")
      })

      const html2canvasPromise = import("html2canvas").catch((err) => {
        console.error("Error loading html2canvas:", err)
        throw new Error("No se pudo cargar el módulo de captura")
      })

      // Esperar a que ambas promesas se resuelvan
      const [jspdfModule, html2canvasModule] = await Promise.all([jspdfPromise, html2canvasPromise])

      const jsPDF = jspdfModule.default
      const html2Canvas = html2canvasModule.default

      // Crear una copia del elemento para manipularlo sin afectar la UI
      const element = contentRef.current

      // Configuración para html2canvas
      const options = {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
        foreignObjectRendering: false,
      }

      // Capturar el elemento como una imagen
      const canvas = await html2Canvas(element, options)

      // Crear un nuevo documento PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calcular las dimensiones para ajustar la imagen al PDF
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Añadir la imagen al PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.92)

      try {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)

        // Guardar el PDF
        pdf.save(`${fileName}.pdf`)

        toast({
          title: "PDF generado correctamente",
          description: "El archivo se ha descargado en tu dispositivo",
        })
      } catch (pdfError) {
        console.error("Error adding image to PDF:", pdfError)
        throw new Error("Error al generar el documento PDF")
      }
    } catch (error) {
      console.error("Error completo:", error)
      toast({
        title: "Error al generar el PDF",
        description: "Por favor, inténtelo de nuevo o contacte con soporte",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="bg-[#0001B5] hover:bg-[#00018c] flex items-center h-12 px-6"
      onClick={handleSaveAsPdf}
      disabled={isLoading}
    >
      <FileDown className="mr-2 h-5 w-5" />
      {isLoading ? "Generando PDF..." : "Exportar PDF"}
    </Button>
  )
}
