import type React from "react"
import { UserProvider } from "@/components/user-context"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UserProvider>{children}</UserProvider>
}
