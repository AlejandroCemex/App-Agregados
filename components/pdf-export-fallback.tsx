"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PdfExportFallbackProps {
  contentRef: React.RefObject<HTMLElement>
  fileName: string
}

export function PdfExportFallback({ contentRef, fileName }: PdfExportFallbackProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
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

      // Método alternativo: Usar la API de impresión del navegador
      const printWindow = window.open("", "_blank")

      if (!printWindow) {
        toast({
          title: "Error",
          description: "No se pudo abrir la ventana de impresión. Verifica que no esté bloqueada por el navegador.",
          variant: "destructive",
        })
        return
      }

      // Obtener el contenido HTML
      const contentHtml = contentRef.current.innerHTML

      // Crear un documento HTML completo
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${fileName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              border: 1px solid #0001B5;
            }
            th {
              background-color: #0001B5;
              color: white;
            }
            .cotizacion-print img {
              max-width: 200px;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="cotizacion-print">
            ${contentHtml}
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <button onclick="window.print(); setTimeout(() => window.close(), 500);">
              Imprimir o Guardar como PDF
            </button>
          </div>
        </body>
        </html>
      `)

      printWindow.document.close()

      toast({
        title: "Documento preparado",
        description: "Se ha abierto una nueva ventana. Utiliza la opción 'Guardar como PDF' de tu navegador.",
      })
    } catch (error) {
      console.error("Error al exportar:", error)
      toast({
        title: "Error al preparar el documento",
        description: "Por favor, inténtelo de nuevo o contacte con soporte",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="flex items-center h-12 px-6 border-[#0001B5] text-[#0001B5] hover:bg-[#0001B5]/10"
      onClick={handleExport}
      disabled={isLoading}
    >
      <FileDown className="mr-2 h-5 w-5" />
      {isLoading ? "Preparando documento..." : "Exportar (Alternativo)"}
    </Button>
  )
}
