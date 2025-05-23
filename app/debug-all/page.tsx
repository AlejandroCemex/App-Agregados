"use client"

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getBrowserClient } from '@/lib/services/auth'
import Link from 'next/link'

export default function DebugAllPage() {
  const { user, isAuthenticated, loading, signOut, getUserZone } = useAuth()
  const router = useRouter()
  const [supabaseTest, setSupabaseTest] = useState<any>(null)
  const [dbTables, setDbTables] = useState<any[]>([])

  // Test Supabase connection
  useEffect(() => {
    async function testSupabase() {
      try {
        const client = getBrowserClient()
        
        // Test 1: Basic connection
        const { data: testData, error: testError } = await client
          .from('information_schema.tables')
          .select('table_name')
          .limit(5)

        // Test 2: Check our specific table
        const { data: rolesData, error: rolesError } = await client
          .from('"Roles de Usuarios"')
          .select('*')
          .limit(1)

        setSupabaseTest({
          basicConnection: !testError,
          basicError: testError?.message,
          rolesTable: !rolesError,
          rolesError: rolesError?.message,
          rolesData: rolesData
        })

        if (!testError && testData) {
          setDbTables(testData)
        }
      } catch (error: any) {
        setSupabaseTest({
          basicConnection: false,
          basicError: error.message,
          rolesTable: false,
          rolesError: 'No se pudo conectar'
        })
      }
    }

    if (isAuthenticated) {
      testSupabase()
    }
  }, [isAuthenticated])

  const testNavigationButtons = () => {
    console.log('🔗 Testing navigation to dashboard...')
    router.push('/dashboard')
  }

  const userZone = getUserZone()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Debug Completo - Todos los Problemas</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problema 1: Conexión a Supabase */}
          <Card>
            <CardHeader>
              <CardTitle>1️⃣ Conexión a Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong>Variables de entorno:</strong>
                  <div className="text-sm">
                    <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante'}</div>
                    <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante'}</div>
                  </div>
                </div>
                
                {supabaseTest && (
                  <div>
                    <strong>Test de conexión:</strong>
                    <div className="text-sm">
                      <div>Conexión básica: {supabaseTest.basicConnection ? '✅' : '❌'}</div>
                      {supabaseTest.basicError && <div className="text-red-600">Error: {supabaseTest.basicError}</div>}
                      <div>Tabla "Roles de Usuarios": {supabaseTest.rolesTable ? '✅' : '❌'}</div>
                      {supabaseTest.rolesError && <div className="text-red-600">Error: {supabaseTest.rolesError}</div>}
                    </div>
                  </div>
                )}

                {dbTables.length > 0 && (
                  <div>
                    <strong>Tablas encontradas:</strong>
                    <div className="text-sm max-h-20 overflow-y-auto">
                      {dbTables.map((table, i) => <div key={i}>{table.table_name}</div>)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Problema 2: Datos del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>2️⃣ Datos del Usuario (Tabla "Roles de Usuarios")</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2 text-sm">
                  <div><strong>🆔 ID:</strong> {user.id}</div>
                  <div><strong>📧 Email:</strong> {user.email}</div>
                  <div><strong>👤 Nombre (de tabla):</strong> {user.role?.nombre || '❌ No encontrado'}</div>
                  <div><strong>🎭 Rol:</strong> {user.role?.Roles?.nombre || '❌ No encontrado'}</div>
                  <div><strong>🗺️ Zona:</strong> {userZone?.nombre || '❌ No encontrado'}</div>
                  
                  <div className="mt-4 p-2 bg-gray-100 rounded">
                    <strong>🔍 Debug - Objeto completo user.role:</strong>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(user.role, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No hay usuario autenticado</p>
              )}
            </CardContent>
          </Card>

          {/* Problema 3: Botones de navegación */}
          <Card>
            <CardHeader>
              <CardTitle>3️⃣ Test de Botones de Navegación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong>Botones usando router.push():</strong>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={() => router.push('/dashboard')}
                      variant="outline"
                      size="sm"
                    >
                      Dashboard (router)
                    </Button>
                    <Button 
                      onClick={() => router.push('/')}
                      variant="outline"
                      size="sm"
                    >
                      Home (router)
                    </Button>
                  </div>
                </div>

                <div>
                  <strong>Botones usando Link:</strong>
                  <div className="flex gap-2 mt-2">
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm">
                        Dashboard (Link)
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" size="sm">
                        Home (Link)
                      </Button>
                    </Link>
                  </div>
                </div>

                <div>
                  <strong>Test con console.log:</strong>
                  <Button 
                    onClick={testNavigationButtons}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Test navegación (check console)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>Loading: {loading ? '🔄' : '✅'}</div>
                <div>Autenticado: {isAuthenticated ? '✅' : '❌'}</div>
                <div>Usuario presente: {user ? '✅' : '❌'}</div>
                <div>Datos de rol: {user?.role ? '✅' : '❌'}</div>
                <div>Zona disponible: {userZone ? '✅' : '❌'}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones de debug */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            🔄 Recargar Página
          </Button>
          
          <Button 
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.reload()
            }}
            variant="destructive"
          >
            🗑️ Limpiar Todo y Recargar
          </Button>

          <Link href="/test-auth">
            <Button variant="outline">
              🧪 Ir a Test Auth
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700">
              🏠 Ir al Dashboard
            </Button>
          </Link>
        </div>

        {/* Instrucciones */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Instrucciones para resolver problemas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><strong>1. Si no hay conexión a Supabase:</strong> Crear archivo .env.local con las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
            <div><strong>2. Si el nombre es email:</strong> Verificar que el campo 'nombre' en la tabla "Roles de Usuarios" tenga el nombre real, no el email</div>
            <div><strong>3. Si los botones no funcionan:</strong> Verificar en la consola del navegador si hay errores JavaScript</div>
            <div><strong>4. Si no hay datos de rol/zona:</strong> Verificar que el usuario tenga un registro en "Roles de Usuarios" con su UUID</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 