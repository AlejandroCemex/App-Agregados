"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintButtonProps {
  contentRef: React.RefObject<HTMLElement>
  documentTitle: string
}

export function PrintButton({ contentRef, documentTitle }: PrintButtonProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [ReactToPrintComponent, setReactToPrintComponent] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)

    const loadReactToPrint = async () => {
      setIsLoading(true)
      try {
        const reactToPrintModule = await import("react-to-print")
        setReactToPrintComponent(() => reactToPrintModule.default)
      } catch (error) {
        console.error("Error loading react-to-print:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReactToPrint()
  }, [])

  // Si no estamos en el cliente o la biblioteca está cargando, mostramos un botón deshabilitado
  if (!isClient || isLoading) {
    return (
      <Button className="bg-[#0001B5] hover:bg-[#00018c] flex items-center h-12 px-6" disabled={true}>
        <Printer className="mr-2 h-5 w-5" />
        Cargando...
      </Button>
    )
  }

  // Si no se pudo cargar la biblioteca, mostramos un botón que muestra un mensaje
  if (!ReactToPrintComponent) {
    return (
      <Button
        className="bg-[#0001B5] hover:bg-[#00018c] flex items-center h-12 px-6"
        onClick={() => alert("La función de impresión no está disponible en este momento.")}
      >
        <Printer className="mr-2 h-5 w-5" />
        Imprimir Cotización
      </Button>
    )
  }

  // Si todo está bien, usamos ReactToPrint
  return (
    <ReactToPrintComponent
      trigger={() => (
        <Button className="bg-[#0001B5] hover:bg-[#00018c] flex items-center h-12 px-6">
          <Printer className="mr-2 h-5 w-5" />
          Imprimir Cotización
        </Button>
      )}
      content={() => contentRef.current}
      documentTitle={documentTitle}
      removeAfterPrint={true}
    />
  )
}
