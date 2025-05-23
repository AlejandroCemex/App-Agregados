// Componente reutilizable para títulos de página con estilo formal y elegante
import type { ReactNode } from "react"

interface PageTitleProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function PageTitle({ title, subtitle, icon, action }: PageTitleProps) {
  return (
    <div className="relative mb-12">
      {/* Recuadro con sombra alrededor del título */}
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
        {/* Borde decorativo inferior - azul a la izquierda, rojo a la derecha */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/2 bg-[#0001B5]"></div>
          <div className="w-1/2 bg-[#FB2230]"></div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-2 px-2 pb-2">
          <div className="relative">
            {/* Título principal con diseño formal */}
            <div className="flex items-center gap-4">
              {/* Icono con estilo formal */}
              {icon && (
                <div className="relative flex-shrink-0">
                  <div className="relative z-10 text-[#0001B5] p-3 bg-white rounded-full border border-gray-200 shadow-sm">
                    {icon}
                  </div>
                </div>
              )}

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#0001B5]">{title}</h1>
                {/* Subtítulo */}
                {subtitle && <p className="text-gray-600 mt-2 max-w-2xl">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Acción (botón u otro elemento) */}
          {action && <div className="mt-2 sm:mt-0">{action}</div>}
        </div>
      </div>

      {/* SEPARADOR ELEGANTE */}
      <div className="relative">
        <div className="flex items-center justify-center">
          <div className="w-1/3 h-[1px] bg-gray-300"></div>

          <div className="mx-4 flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#0001B5]"></div>
            <div className="w-16 h-[1px] bg-[#0001B5] mx-2"></div>
            <div className="w-3 h-3 rounded-full bg-[#FB2230]"></div>
            <div className="w-16 h-[1px] bg-[#0001B5] mx-2"></div>
            <div className="w-2 h-2 rounded-full bg-[#0001B5]"></div>
          </div>

          <div className="w-1/3 h-[1px] bg-gray-300"></div>
        </div>
      </div>
    </div>
  )
}
