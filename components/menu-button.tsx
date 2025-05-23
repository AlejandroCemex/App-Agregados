"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface MenuButtonProps {
  onClick: () => void
}

export function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50 bg-white shadow-sm" onClick={onClick}>
      <Menu className="h-6 w-6" />
      <span className="sr-only">Abrir menú</span>
    </Button>
  )
}
