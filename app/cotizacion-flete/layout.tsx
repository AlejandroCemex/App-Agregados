"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { UserProvider } from "@/components/user-context"
import { MenuButton } from "@/components/menu-button"
import { useState } from "react"

export default function CotizacionFleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <UserProvider>
      <div className="min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <MenuButton onClick={toggleSidebar} />
        <div className="p-6 md:p-10 pt-16">{children}</div>
      </div>
    </UserProvider>
  )
}
