"use client"

import { cn } from "@/lib/utils"

interface ProcessStepProps {
  number: number
  title: string
  description: string
  icon: string
  isActive?: boolean
  isLast?: boolean
  onClick?: () => void
}

export function ProcessStep({
  number,
  title,
  description,
  icon,
  isActive = false,
  isLast = false,
  onClick,
}: ProcessStepProps) {
  return (
    <div className={cn("relative flex flex-col items-center group", onClick ? "cursor-pointer" : "")} onClick={onClick}>
      {/* Línea conectora */}
      {!isLast && (
        <div className="absolute top-10 left-1/2 w-full h-1 bg-gradient-to-r from-[#0001B5]/50 to-[#FB2230]/50 transform -translate-x-1/2"></div>
      )}

      {/* Círculo con número */}
      <div
        className={cn(
          "z-10 flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold transition-all duration-300",
          isActive
            ? "bg-[#0001B5] text-white shadow-lg shadow-[#0001B5]/30"
            : "bg-white text-[#0001B5] border-2 border-[#0001B5]/30 group-hover:border-[#0001B5]",
        )}
      >
        {icon}
      </div>

      {/* Texto */}
      <div className="mt-4 text-center">
        <h3
          className={cn(
            "text-lg font-bold transition-colors duration-300",
            isActive ? "text-[#0001B5]" : "text-gray-700 group-hover:text-[#0001B5]",
          )}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 max-w-[200px]">{description}</p>
      </div>

      {/* Número pequeño */}
      <div
        className={cn(
          "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
          isActive ? "bg-[#FB2230] text-white" : "bg-gray-200 text-gray-700",
        )}
      >
        {number}
      </div>
    </div>
  )
}

interface ProcessFlowProps {
  steps: Array<{
    id: number
    title: string
    description: string
    action?: () => void
    icon: string
  }>
  activeStep?: number
}

export function ProcessFlow({ steps, activeStep }: ProcessFlowProps) {
  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-start">
        {steps.map((step, index) => (
          <ProcessStep
            key={step.id}
            number={step.id}
            title={step.title}
            description={step.description}
            icon={step.icon}
            isActive={activeStep === step.id}
            isLast={index === steps.length - 1}
            onClick={step.action}
          />
        ))}
      </div>
    </div>
  )
}
