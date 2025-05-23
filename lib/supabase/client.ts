"use client"

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Validar variables de entorno
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Create a singleton instance for browser use
  if (!supabase) {
    supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabase
}

// Para compatibilidad con el código existente
export const supabaseClient = createClient()
