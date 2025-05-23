import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/components/user-context"
import { EnhancedBackground } from "@/components/background-decorator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "App Agregados",
  description: "En esta app podrás agilizar el proceso de venta de agregado",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <UserProvider>
            <EnhancedBackground />
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
