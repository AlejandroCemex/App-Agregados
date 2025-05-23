import type React from "react"
// Componentes decorativos para mejorar el diseño visual
import { cn } from "@/lib/utils"

interface BackgroundDecoratorProps {
  className?: string
}

export function BackgroundDecorator({ className }: BackgroundDecoratorProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={cn(
          "absolute -top-[10%] -right-[10%] w-[30%] h-[30%] bg-[#0001B5]/5 rounded-full blur-3xl",
          className,
        )}
      ></div>
      <div
        className={cn("absolute top-[60%] -left-[5%] w-[25%] h-[25%] bg-[#FB2230]/5 rounded-full blur-3xl", className)}
      ></div>
      <div
        className={cn("absolute top-[30%] left-[70%] w-[15%] h-[15%] bg-[#0001B5]/3 rounded-full blur-3xl", className)}
      ></div>
    </div>
  )
}

interface CardDecoratorProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  color?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
}

export function CardDecorator({ position = "top-right", color = "primary", size = "md" }: CardDecoratorProps) {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  }

  const colorClasses = {
    primary: "bg-[#0001B5]/10",
    secondary: "bg-[#FB2230]/10",
  }

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <div
      className={cn(
        "absolute rounded-full -z-10 blur-xl",
        positionClasses[position],
        colorClasses[color],
        sizeClasses[size],
      )}
    ></div>
  )
}

interface FormCardProps {
  children: React.ReactNode
  className?: string
}

export function FormCard({ children, className }: FormCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-[#0001B5]/30 shadow-sm overflow-hidden",
        "before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-[#0001B5] before:to-[#FB2230]",
        className,
      )}
    >
      {children}
    </div>
  )
}
