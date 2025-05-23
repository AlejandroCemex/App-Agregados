'use client'

import { useAuth } from '@/hooks/use-auth'

export default function TestSupabase() {
  const { user, loading, error } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!user) {
    return <div>No hay usuario autenticado</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Información del Usuario</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Datos Básicos</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Rol de Usuario</h2>
          <p><strong>Nombre:</strong> {user.role?.nombre || 'No asignado'}</p>
          <p><strong>ID Rol:</strong> {user.role?.id_rol || 'No asignado'}</p>
          <p><strong>Rol:</strong> {user.role?.Roles?.nombre || 'No asignado'}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Zona</h2>
          <p><strong>ID Zona:</strong> {user.role?.id_zona || 'No asignada'}</p>
          <p><strong>Zona:</strong> {user.role?.Zonas?.nombre || 'No asignada'}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Datos Adicionales</h2>
          <p><strong>Creado:</strong> {user.role?.created_at || 'No disponible'}</p>
          <p><strong>Actualizado:</strong> {user.role?.updated_at || 'No disponible'}</p>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Datos Raw</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 