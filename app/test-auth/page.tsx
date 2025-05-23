"use client"

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function TestAuthPage() {
  const { user, isAuthenticated, loading, signOut, getUserZone } = useAuth()
  const router = useRouter()

  const handleForceLogout = async () => {
    try {
      await signOut()
      localStorage.clear()
      sessionStorage.clear()
      // Limpiar cookies de Supabase
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos) : c
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      })
      router.push('/')
    } catch (error) {
      console.error('Error during force logout:', error)
    }
  }

  const userZone = getUserZone()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Test de Autenticación</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado General */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Autenticación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                    {loading ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Autenticado:</span>
                  <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                    {isAuthenticated ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usuario presente:</span>
                  <span className={user ? 'text-green-600' : 'text-red-600'}>
                    {user ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>ID:</strong> {user.id}</div>
                  <div><strong>Nombre:</strong> {user.role?.nombre || 'No definido'}</div>
                  <div><strong>Rol:</strong> {user.role?.Roles?.nombre || 'Sin rol'}</div>
                  <div><strong>Zona:</strong> {userZone?.nombre || 'Sin zona'}</div>
                  <div><strong>ID Zona:</strong> {user.role?.id_zona || 'No definido'}</div>
                </div>
              ) : (
                <p className="text-gray-500">No hay usuario autenticado</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Acciones</h2>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
            >
              Ir a Inicio
            </Button>
            
            <Button 
              onClick={() => router.push('/login')}
              variant="outline"
            >
              Ir a Login
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Ir a Dashboard
            </Button>
            
            <Button 
              onClick={handleForceLogout}
              variant="destructive"
            >
              Forzar Logout Completo
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug - Información Raw</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
              {JSON.stringify({ user, isAuthenticated, loading }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 