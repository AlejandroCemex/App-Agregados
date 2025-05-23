"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CardDecorator } from "@/components/ui-elements"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  action?: () => void
  color?: string
  borderColor?: string
  iconBg?: string
}

export function FeatureCard({
  title,
  description,
  icon,
  action,
  color = "bg-gradient-to-br from-blue-50 to-blue-100",
  borderColor = "border-blue-200",
  iconBg = "bg-blue-100",
}: FeatureCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border ${borderColor} ${color} hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] cursor-pointer`}
      onClick={action}
    >
      <CardDecorator position="top-right" color="primary" size="md" />
      <CardDecorator position="bottom-left" color="secondary" size="sm" />

      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className={`${iconBg} p-3 rounded-full flex items-center justify-center mr-3`}>{icon}</div>
          <h3 className="text-xl font-bold text-[#0001B5]">{title}</h3>
        </div>
        <p className="text-gray-600 mt-1 mb-4">{description}</p>

        {/* Línea roja decorativa */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FB2230]"></div>
      </CardContent>
    </Card>
  )
}
