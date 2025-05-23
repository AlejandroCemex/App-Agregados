'use client'

export default function DebugEnvPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Debug Variables de Entorno</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</h2>
          <p className="text-sm text-gray-600 break-all">{url || 'NO DEFINIDA'}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h2>
          <p className="text-sm text-gray-600 break-all">{key || 'NO DEFINIDA'}</p>
          <p className="text-xs text-gray-500 mt-2">Longitud: {key?.length || 0} caracteres</p>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold">Estado de las variables:</h2>
          <ul className="text-sm">
            <li>URL válida: {url ? '✅' : '❌'}</li>
            <li>Key válida: {key && key.length > 100 ? '✅' : '❌'}</li>
            <li>Formato JWT: {key && key.includes('.') && key.split('.').length === 3 ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 