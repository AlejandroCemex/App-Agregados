"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function LogoUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido (PNG, JPG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen es demasiado grande. El tamaño máximo es 2MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Crear una URL para previsualizar la imagen
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Simular una carga (en una implementación real, aquí subirías el archivo a un servidor)
    setTimeout(() => {
      setIsUploading(false)
      setUploadSuccess(true)

      toast({
        title: "Logo actualizado",
        description: "El logo se ha actualizado correctamente.",
      })

      // En una implementación real, aquí guardarías la URL del logo en localStorage o en la base de datos
      try {
        localStorage.setItem("customLogo", objectUrl)
      } catch (error) {
        console.error("Error saving logo to localStorage:", error)
      }
    }, 1500)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Logo personalizado</h3>
        <Button onClick={triggerFileInput} variant="outline" className="flex items-center" disabled={isUploading}>
          {isUploading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Subiendo...
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Cambiar logo
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir logo
            </>
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/gif"
          className="hidden"
        />
      </div>

      {previewUrl && (
        <div className="border rounded-md p-4 bg-slate-50">
          <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
          <div className="flex justify-center bg-white p-4 rounded border">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Logo preview"
              width={200}
              height={70}
              style={{ objectFit: "contain", height: "auto" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Este es solo un ejemplo. Para implementar completamente esta funcionalidad, necesitarías un servicio de
            almacenamiento de archivos.
          </p>
        </div>
      )}
    </div>
  )
}
