"use client"

// Creamos un cliente simulado para el entorno de desarrollo/preview
// que proporciona la misma interfaz pero no depende de la biblioteca externa

type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
  count?: number | null
}

class SupabaseClientMock {
  private mockData: Record<string, any[]> = {
    "Roles de Usuarios": [
      {
        id: 1,
        Nombre: "Alejandro Díaz",
        Zona: { id: 1, Nombre: "Zona Central" },
        Rol: { id: 1, Nombre: "Usuario" },
      },
      {
        id: 2,
        Nombre: "María López",
        Zona: { id: 2, Nombre: "Zona Norte" },
        Rol: { id: 1, Nombre: "Usuario" },
      },
    ],
    "01 Canteras Propias": [
      { id: 1, Nombre: "Cantera Central", Zona: 1 },
      { id: 2, Nombre: "Cantera Norte", Zona: 1 },
      { id: 3, Nombre: "Cantera Sur", Zona: 2 },
    ],
    "01 Materiales Canteras": [
      { id: 1, Material: "Grava 3/4", "No. Material": 101, Cantera: 1 },
      { id: 2, Material: "Arena Fina", "No. Material": 102, Cantera: 1 },
      { id: 3, Material: "Piedra Triturada", "No. Material": 103, Cantera: 2 },
    ],
    "Calidad Material": [
      { id: 1, nombre: "Alta" },
      { id: 2, nombre: "Media" },
      { id: 3, nombre: "Estándar" },
    ],
    "Volumen Recurrente": [
      { id: 1, descripcion: "Diario" },
      { id: 2, descripcion: "Semanal" },
      { id: 3, descripcion: "Mensual" },
    ],
    Segmentos: [
      { id: 1, nombre: "Residencial" },
      { id: 2, nombre: "Comercial" },
      { id: 3, nombre: "Industrial" },
    ],
    Cotizaciones: [
      {
        id: 1,
        fecha_creacion: new Date().toISOString(),
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tipo_cotizacion: "Cantera Propia",
        estado: "Pendiente",
        numero_destino: "12345",
        nombre_destinatario: "Cliente Ejemplo",
        zona: 1,
        usuario: { id: 1, Nombre: "Alejandro Díaz" },
      },
    ],
    "Detalles Cotizacion": [
      {
        id: 1,
        cotizacion_id: 1,
        cantera: { id: 1, Nombre: "Cantera Central" },
        material: { id: 1, Material: "Grava 3/4" },
        modalidad: "Recogido",
        precio: 1200,
        incluye_flete: false,
        valor_flete: null,
        unidad_medida: "Tonelada",
        toneladas_promedio: null,
        costo_flete_tonelada: null,
        calidad_material: { id: 1, nombre: "Alta" },
        volumen_recurrente: { id: 2, descripcion: "Semanal" },
        segmento: { id: 1, nombre: "Residencial" },
      },
    ],
  }

  // Método from para iniciar una consulta
  from(table: string) {
    const self = this

    // Objeto que contiene todos los métodos de consulta
    return {
      // Método select para seleccionar columnas
      select(columns?: string) {
        // Objeto que contiene métodos de filtrado y ejecución
        return {
          // Método eq para filtrar por igualdad
          eq(column: string, value: any) {
            // Objeto que contiene métodos de ejecución
            return {
              // Método single para obtener un solo registro
              async single() {
                try {
                  const filteredData = self.mockData[table]?.filter((item) => {
                    if (column.includes(".")) {
                      const [parent, child] = column.split(".")
                      return item[parent] && item[parent][child] === value
                    }
                    return item[column] === value
                  })

                  if (filteredData && filteredData.length > 0) {
                    return { data: filteredData[0], error: null }
                  }
                  return { data: null, error: new Error("No data found") }
                } catch (error: any) {
                  return { data: null, error: error as Error }
                }
              },

              // Método para ejecutar la consulta y obtener múltiples registros
              async execute() {
                try {
                  const filteredData = self.mockData[table]?.filter((item) => {
                    if (column.includes(".")) {
                      const [parent, child] = column.split(".")
                      return item[parent] && item[parent][child] === value
                    }
                    return item[column] === value
                  })

                  return { data: filteredData || [], error: null }
                } catch (error: any) {
                  return { data: [], error: error as Error }
                }
              },
            }
          },

          // Método order para ordenar resultados
          order(column: string, options: { ascending: boolean }) {
            return {
              async execute() {
                try {
                  const data = [...(self.mockData[table] || [])]
                  data.sort((a, b) => {
                    const valueA = a[column]
                    const valueB = b[column]

                    if (valueA < valueB) {
                      return options.ascending ? -1 : 1
                    }
                    if (valueA > valueB) {
                      return options.ascending ? 1 : -1
                    }
                    return 0
                  })
                  return { data, error: null }
                } catch (error: any) {
                  return { data: [], error: error as Error }
                }
              },
            }
          },

          // Método para ejecutar la consulta sin filtros
          async execute() {
            try {
              return { data: self.mockData[table] || [], error: null }
            } catch (error: any) {
              return { data: [], error: error as Error }
            }
          },
        }
      },

      // Método insert para insertar datos
      insert(data: any) {
        return {
          // Método select para seleccionar después de insertar
          async select() {
            try {
              // Asegurarse de que la tabla existe
              if (!self.mockData[table]) {
                self.mockData[table] = []
              }

              const newId = (self.mockData[table]?.length || 0) + 1
              const newItem = { id: newId, ...data }

              self.mockData[table].push(newItem)
              return { data: [newItem], error: null }
            } catch (error: any) {
              return { data: null, error: error as Error }
            }
          },

          // Método para insertar sin seleccionar
          async execute() {
            try {
              // Asegurarse de que la tabla existe
              if (!self.mockData[table]) {
                self.mockData[table] = []
              }

              const newId = (self.mockData[table]?.length || 0) + 1
              const newItem = { id: newId, ...data }

              self.mockData[table].push(newItem)
              return { data: null, error: null }
            } catch (error: any) {
              return { data: null, error: error as Error }
            }
          },
        }
      },

      // Método update para actualizar datos
      update(data: any) {
        return {
          // Método eq para filtrar por igualdad
          eq(column: string, value: any) {
            return {
              async execute() {
                try {
                  if (!self.mockData[table]) {
                    return { data: null, error: new Error(`Table ${table} not found`) }
                  }

                  const index = self.mockData[table].findIndex((item) => item[column] === value)
                  if (index !== -1) {
                    self.mockData[table][index] = { ...self.mockData[table][index], ...data }
                    return { data: self.mockData[table][index], error: null }
                  }
                  return { data: null, error: new Error("Item not found") }
                } catch (error: any) {
                  return { data: null, error: error as Error }
                }
              },
            }
          },
        }
      },

      // Método delete para eliminar datos
      delete() {
        return {
          // Método eq para filtrar por igualdad
          eq(column: string, value: any) {
            return {
              async execute() {
                try {
                  if (!self.mockData[table]) {
                    return { data: null, error: new Error(`Table ${table} not found`) }
                  }

                  const index = self.mockData[table].findIndex((item) => item[column] === value)
                  if (index !== -1) {
                    const deletedItem = self.mockData[table][index]
                    self.mockData[table].splice(index, 1)
                    return { data: deletedItem, error: null }
                  }
                  return { data: null, error: new Error("Item not found") }
                } catch (error: any) {
                  return { data: null, error: error as Error }
                }
              },
            }
          },
        }
      },
    }
  }
}

// Exportamos el cliente simulado para el entorno de desarrollo/preview
export const supabaseClient = new SupabaseClientMock()
