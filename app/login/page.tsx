"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, Eye, EyeOff } from "lucide-react"
import { Logo } from "@/components/logo"
import { useAuth } from '@/hooks/use-auth'

// Componente que maneja los search params
function LoginFormWithParams() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom')

  const { user, isAuthenticated, signIn } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetPath = redirectedFrom || '/dashboard'
      router.push(targetPath)
    }
  }, [isAuthenticated, user, router, redirectedFrom])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Por favor ingresa tu email y contraseña')
      setLoading(false)
      return
    }

    try {
      const result = await signIn(email, password)
      
      if (result.user) {
        console.log('Usuario autenticado exitosamente')
        // The useAuth hook will handle the redirect through useEffect
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error)
      
      // Handle different error types
      if (error.message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Por favor confirma tu email antes de iniciar sesión')
      } else {
        setError('Error al iniciar sesión: ' + (error.message || 'Error desconocido'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Logo width={150} height={50} />
        </div>
        <h1 className="text-2xl font-bold text-[#0001B5] mb-2">Iniciar Sesión</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={loading}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#0001B5] hover:bg-[#00018c] text-white"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </div>
          ) : (
            <div className="flex items-center">
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </div>
          )}
        </Button>
      </form>
    </div>
  )
}

// Componente de fallback para el Suspense
function LoginFallback() {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Logo width={150} height={50} />
        </div>
        <h1 className="text-2xl font-bold text-[#0001B5] mb-2">Cargando...</h1>
      </div>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0001B5]"></div>
      </div>
    </div>
  )
}

// Componente principal exportado
export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url(/cantera-bg.jpg)" }}
    >
      <Suspense fallback={<LoginFallback />}>
        <LoginFormWithParams />
      </Suspense>
    </div>
  )
}
