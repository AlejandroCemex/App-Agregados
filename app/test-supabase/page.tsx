'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Users, Database } from "lucide-react"

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

interface DatabaseInfo {
  status: 'loading' | 'success' | 'error'
  tables: {
    rolesDeUsuarios: { exists: boolean; count: number; sample?: any[] }
    roles: { exists: boolean; count: number; sample?: any[] }
    zonas: { exists: boolean; count: number; sample?: any[] }
  }
  authUsers: { count: number; sample?: any[] }
  error?: string
}

export default function TestSupabasePage() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'loading',
    envVarsConfigured: {
      url: false,
      anonKey: false
    }
  })

  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo>({
    status: 'loading',
    tables: {
      rolesDeUsuarios: { exists: false, count: 0 },
      roles: { exists: false, count: 0 },
      zonas: { exists: false, count: 0 }
    },
    authUsers: { count: 0 }
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

        // Now test database access
        await testDatabaseAccess(supabase)

      } catch (err: any) {
        console.error('Supabase connection error:', err)
        setConnectionInfo(prev => ({
          ...prev,
          status: 'error',
          error: err.message || 'Error desconocido al conectar con Supabase'
        }))
      }
    }

    const testDatabaseAccess = async (supabase: any) => {
      try {
        const dbInfo: DatabaseInfo = {
          status: 'loading',
          tables: {
            rolesDeUsuarios: { exists: false, count: 0 },
            roles: { exists: false, count: 0 },
            zonas: { exists: false, count: 0 }
          },
          authUsers: { count: 0 }
        }

        // Test Roles de Usuarios table
        try {
          const { data: rolesUsuarios, error: rolesUsuariosError } = await supabase
            .from('Roles de Usuarios')
            .select('*')
            .limit(3)

          if (!rolesUsuariosError) {
            dbInfo.tables.rolesDeUsuarios = {
              exists: true,
              count: rolesUsuarios?.length || 0,
              sample: rolesUsuarios
            }
          }
        } catch (e) {
          console.log('Error accessing Roles de Usuarios:', e)
        }

        // Test Roles table
        try {
          const { data: roles, error: rolesError } = await supabase
            .from('Roles')
            .select('*')
            .limit(3)

          if (!rolesError) {
            dbInfo.tables.roles = {
              exists: true,
              count: roles?.length || 0,
              sample: roles
            }
          }
        } catch (e) {
          console.log('Error accessing Roles:', e)
        }

        // Test Zonas table
        try {
          const { data: zonas, error: zonasError } = await supabase
            .from('Zonas')
            .select('*')
            .limit(3)

          if (!zonasError) {
            dbInfo.tables.zonas = {
              exists: true,
              count: zonas?.length || 0,
              sample: zonas
            }
          }
        } catch (e) {
          console.log('Error accessing Zonas:', e)
        }

        dbInfo.status = 'success'
        setDatabaseInfo(dbInfo)

      } catch (err: any) {
        setDatabaseInfo(prev => ({
          ...prev,
          status: 'error',
          error: err.message
        }))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Diagnóstico Completo de Supabase</h1>
        <p className="text-muted-foreground">
          Verificando conexión, tablas y usuarios en el proyecto AppAgregados 01
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionInfo.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
              {connectionInfo.status === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {connectionInfo.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
              Estado de la Conexión
            </CardTitle>
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
                {connectionInfo.status === 'connected' && '✅ Conectado'}
                {connectionInfo.status === 'error' && '❌ Error'}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Variables de Entorno:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>SUPABASE_URL:</span>
                  <Badge variant={connectionInfo.envVarsConfigured.url ? 'default' : 'destructive'}>
                    {connectionInfo.envVarsConfigured.url ? '✅' : '❌'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ANON_KEY:</span>
                  <Badge variant={connectionInfo.envVarsConfigured.anonKey ? 'default' : 'destructive'}>
                    {connectionInfo.envVarsConfigured.anonKey ? '✅' : '❌'}
                  </Badge>
                </div>
              </div>
            </div>

            {connectionInfo.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{connectionInfo.error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado de la Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Roles de Usuarios:</span>
                  <Badge variant={databaseInfo.tables.rolesDeUsuarios.exists ? 'default' : 'destructive'}>
                    {databaseInfo.tables.rolesDeUsuarios.exists ? 
                      `✅ ${databaseInfo.tables.rolesDeUsuarios.count} registros` : 
                      '❌ No encontrada'
                    }
                  </Badge>
                </div>
                {databaseInfo.tables.rolesDeUsuarios.sample && (
                  <div className="text-xs bg-gray-50 p-2 rounded">
                    <strong>Muestra:</strong>
                    <pre className="mt-1 overflow-x-auto">
                      {JSON.stringify(databaseInfo.tables.rolesDeUsuarios.sample, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Roles:</span>
                  <Badge variant={databaseInfo.tables.roles.exists ? 'default' : 'destructive'}>
                    {databaseInfo.tables.roles.exists ? 
                      `✅ ${databaseInfo.tables.roles.count} registros` : 
                      '❌ No encontrada'
                    }
                  </Badge>
                </div>
                {databaseInfo.tables.roles.sample && (
                  <div className="text-xs bg-gray-50 p-2 rounded">
                    <strong>Muestra:</strong>
                    <pre className="mt-1 overflow-x-auto">
                      {JSON.stringify(databaseInfo.tables.roles.sample, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Zonas:</span>
                  <Badge variant={databaseInfo.tables.zonas.exists ? 'default' : 'destructive'}>
                    {databaseInfo.tables.zonas.exists ? 
                      `✅ ${databaseInfo.tables.zonas.count} registros` : 
                      '❌ No encontrada'
                    }
                  </Badge>
                </div>
                {databaseInfo.tables.zonas.sample && (
                  <div className="text-xs bg-gray-50 p-2 rounded">
                    <strong>Muestra:</strong>
                    <pre className="mt-1 overflow-x-auto">
                      {JSON.stringify(databaseInfo.tables.zonas.sample, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {databaseInfo.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">Error BD: {databaseInfo.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {connectionInfo.status === 'connected' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Información para Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📝 Instrucciones para Login:</h3>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Los usuarios deben estar registrados en Supabase Auth (auth.users)</li>
                <li>Además deben tener un registro en la tabla "Roles de Usuarios" con el mismo UUID</li>
                <li>El UUID del usuario en auth.users debe coincidir con el campo "id" en "Roles de Usuarios"</li>
                <li>Para crear un usuario: ve al panel de Supabase → Authentication → Users → Add user</li>
                <li>Luego agrega el registro correspondiente en "Roles de Usuarios" con el mismo UUID</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 