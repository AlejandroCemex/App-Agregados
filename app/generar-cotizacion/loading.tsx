import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0001B5] border-t-transparent"></div>
        <h1 className="text-2xl font-bold">Cargando cotización...</h1>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200"></div>
            <div className="h-24 animate-pulse rounded bg-slate-200"></div>
            <div className="space-y-3">
              <div className="h-6 animate-pulse rounded bg-slate-200"></div>
              <div className="h-6 animate-pulse rounded bg-slate-200"></div>
              <div className="h-6 animate-pulse rounded bg-slate-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
