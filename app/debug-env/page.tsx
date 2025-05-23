"use client"

import { useEffect, useState } from 'react'

export default function DebugEnvPage() {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: '',
    supabaseKey: '',
    hasUrl: false,
    hasKey: false,
    urlLength: 0,
    keyLength: 0,
  })

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    setEnvStatus({
      supabaseUrl: url,
      supabaseKey: key.substring(0, 20) + '...' + key.substring(key.length - 10),
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url.length,
      keyLength: key.length,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🔍 Diagnóstico de Variables de Entorno</h1>
        
        <div className="space-y-6">
          {/* Status General */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📊 Estado General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded ${envStatus.hasUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="font-semibold">SUPABASE_URL</div>
                <div>{envStatus.hasUrl ? '✅ Configurada' : '❌ Faltante'}</div>
                <div className="text-sm">Longitud: {envStatus.urlLength}</div>
              </div>
              <div className={`p-3 rounded ${envStatus.hasKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="font-semibold">SUPABASE_ANON_KEY</div>
                <div>{envStatus.hasKey ? '✅ Configurada' : '❌ Faltante'}</div>
                <div className="text-sm">Longitud: {envStatus.keyLength}</div>
              </div>
            </div>
          </div>

          {/* Detalles de URL */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🌐 URL de Supabase</h2>
            <div className="bg-white p-3 rounded border">
              <div className="font-mono text-sm break-all">
                {envStatus.supabaseUrl || 'NO CONFIGURADA'}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              ✅ Debe ser algo como: https://tu-proyecto.supabase.co
            </div>
          </div>

          {/* Detalles de API Key */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🔑 API Key (Anon)</h2>
            <div className="bg-white p-3 rounded border">
              <div className="font-mono text-sm break-all">
                {envStatus.hasKey ? envStatus.supabaseKey : 'NO CONFIGURADA'}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              ✅ Debe ser un JWT largo que empiece con "eyJ"
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">📝 Pasos para Solucionarlo</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Ve a <a href="https://app.supabase.com" target="_blank" className="underline">Supabase Dashboard</a></li>
              <li>Selecciona tu proyecto</li>
              <li>Ve a <strong>Settings → API</strong></li>
              <li>Copia la <strong>URL</strong> y la <strong>anon key</strong></li>
              <li>Pega en tu archivo <code>.env.local</code> en la raíz del proyecto</li>
              <li>Reinicia el servidor: <code>npm run dev</code></li>
            </ol>
          </div>

          {/* Formato del archivo .env.local */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📄 Formato del archivo .env.local</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`# Archivo: .env.local (en la raíz del proyecto)

NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui`}
            </pre>
          </div>

          {/* Botón de prueba */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">🧪 Prueba de Conexión</h2>
            <button
              onClick={async () => {
                try {
                  const { createClient } = await import('@/lib/supabase/client')
                  const client = createClient()
                  const { data, error } = await client.auth.getSession()
                  
                  if (error) {
                    alert('Error: ' + error.message)
                  } else {
                    alert('✅ Conexión exitosa con Supabase!')
                  }
                } catch (error: any) {
                  alert('❌ Error de conexión: ' + error.message)
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Probar Conexión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 