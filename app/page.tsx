import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url(/cantera-bg.jpg)" }}
    >
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <Logo width={200} height={70} />
          </div>
          <h1 className="text-3xl font-bold text-[#0001B5] mb-4">App Agregados</h1>
          <p className="text-lg text-gray-600">Sistema de gestión de agregados</p>
        </div>

        <Link href="/login">
          <Button 
            className="w-full bg-[#0001B5] hover:bg-[#00018c] text-white text-lg py-3"
            size="lg"
          >
            Abrir App
          </Button>
        </Link>
      </div>
    </div>
  )
}
