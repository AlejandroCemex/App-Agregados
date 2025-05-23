'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ConnectionInfo {
  status: 'loading' | 'connected' | 'error'
  url?: string
  projectRef?: string
  error?: string
  envVarsConfigured: {
    url: boolean
    anonKey: boolean
  }
}

export default function TestSupabasePage() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'loading',
    envVarsConfigured: {
      url: false,
      anonKey: false
    }
  })

  useEffect(() => {
    const testConnection = async () => {
      // Check environment variables
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      setConnectionInfo(prev => ({
        ...prev,
        envVarsConfigured: {
          url: hasUrl,
          anonKey: hasAnonKey
        },
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        projectRef: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]
      }))

      if (!hasUrl || !hasAnonKey) {
        setConnectionInfo(prev => ({
          ...prev,
          status: 'error',
          error: 'Variables de entorno no configuradas. Verifica que .env.local exista con las variables correctas.'
        }))
        return
      }

      try {
        // Create the Supabase client
        const supabase = createClient()
        
        // Try to get the current session (this tests the connection)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw new Error(`Error de autenticación: ${sessionError.message}`)
        }

        // If we get here, the connection is working
        setConnectionInfo(prev => ({
          ...prev,
          status: 'connected'
        }))

      } catch (err: any) {
        console.error('Supabase connection error:', err)
        setConnectionInfo(prev => ({
          ...prev,
          status: 'error',
          error: err.message || 'Error desconocido al conectar con Supabase'
        }))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Prueba de Conexión con Supabase</h1>
        <p className="text-muted-foreground">
          Verificando la conexión con el proyecto AppAgregados 01
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionInfo.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {connectionInfo.status === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {connectionInfo.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            Estado de la Conexión
          </CardTitle>
          <CardDescription>
            Estado actual de la conexión con Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Estado:</span>
            <Badge 
              variant={
                connectionInfo.status === 'connected' ? 'default' : 
                connectionInfo.status === 'error' ? 'destructive' : 
                'secondary'
              }
            >
              {connectionInfo.status === 'loading' && 'Conectando...'}
              {connectionInfo.status === 'connected' && '✅ Conectado Exitosamente'}
              {connectionInfo.status === 'error' && '❌ Error de Conexión'}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Variables de Entorno:</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                <Badge variant={connectionInfo.envVarsConfigured.url ? 'default' : 'destructive'}>
                  {connectionInfo.envVarsConfigured.url ? '✅ Configurada' : '❌ No Configurada'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <Badge variant={connectionInfo.envVarsConfigured.anonKey ? 'default' : 'destructive'}>
                  {connectionInfo.envVarsConfigured.anonKey ? '✅ Configurada' : '❌ No Configurada'}
                </Badge>
              </div>
            </div>
          </div>

          {connectionInfo.url && (
            <div className="space-y-2">
              <h3 className="font-semibold">Información del Proyecto:</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="font-medium">URL del Proyecto:</span>
                  <p className="text-muted-foreground font-mono break-all">{connectionInfo.url}</p>
                </div>
                <div>
                  <span className="font-medium">Referencia del Proyecto:</span>
                  <p className="text-muted-foreground font-mono">{connectionInfo.projectRef}</p>
                </div>
              </div>
            </div>
          )}

          {connectionInfo.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error de Conexión:</h3>
              <p className="text-red-700 text-sm">{connectionInfo.error}</p>
              
              {!connectionInfo.envVarsConfigured.url || !connectionInfo.envVarsConfigured.anonKey ? (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-sm font-medium">
                    💡 Para solucionar este problema:
                  </p>
                  <ol className="text-yellow-700 text-xs mt-1 list-decimal list-inside space-y-1">
                    <li>Crea un archivo llamado <code>.env.local</code> en la raíz del proyecto</li>
                    <li>Agrega las variables de entorno de Supabase que te proporcioné anteriormente</li>
                    <li>Reinicia el servidor de desarrollo</li>
                  </ol>
                </div>
              ) : null}
            </div>
          )}

          {connectionInfo.status === 'connected' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🎉 ¡Conexión Exitosa!</h3>
              <p className="text-green-700 text-sm">
                Tu aplicación está correctamente conectada al proyecto AppAgregados 01 en Supabase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 