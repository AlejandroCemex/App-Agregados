// Creamos un cliente simulado para el entorno de desarrollo/preview
// que proporciona la misma interfaz pero no depende de la biblioteca externa

class SupabaseServerMock {
  // Implementación similar al cliente, pero para uso en el servidor
  // Por ahora, es un objeto vacío ya que no se usa en la vista principal
}

export const supabaseServer = new SupabaseServerMock()
